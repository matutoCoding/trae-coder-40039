import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import {
  ArrowLeft,
  GitCompare,
  Plus,
  X,
  Trash2,
  Thermometer,
  Ruler,
  Coins,
  ShieldCheck,
  Flame,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type {
  Slab,
  HeatingRecord,
  FinishingRecord,
  CoilingRecord,
  InspectionRecord,
} from '@/types';
import {
  formatTemperature,
  formatThickness,
  formatStrength,
  formatElongation,
  formatImpactEnergy,
  formatInspectionResult,
  formatNumber,
} from '@/utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';

const SLAB_COLORS = [
  { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', fill: '#f97316' },
  { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', fill: '#3b82f6' },
  { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400', fill: '#22c55e' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', fill: '#a855f7' },
];

interface CompareData {
  slab: Slab;
  heating?: HeatingRecord;
  finishing?: FinishingRecord;
  coiling?: CoilingRecord;
  inspection?: InspectionRecord;
}

export default function SlabCompare() {
  const navigate = useNavigate();
  const {
    compareSlabNos,
    slabs,
    addCompareSlab,
    removeCompareSlab,
    clearCompareSlabs,
    getEntitiesBySlabNo,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const effectiveCompareSlabNos = useMemo(() => {
    if (compareSlabNos.length > 0) {
      return compareSlabNos;
    }
    const finishedSlabs = slabs.filter((s) => s.status === 'finished').slice(0, 4);
    return finishedSlabs.map((s) => s.slabNo);
  }, [compareSlabNos, slabs]);

  const compareData: CompareData[] = useMemo(() => {
    return effectiveCompareSlabNos
      .map((slabNo, index) => {
        const slab = slabs.find((s) => s.slabNo === slabNo);
        if (!slab) return null;
        const heating = (getEntitiesBySlabNo('heatingRecords', slabNo) as HeatingRecord[])[0];
        const finishing = (getEntitiesBySlabNo('finishingRecords', slabNo) as FinishingRecord[])[0];
        const coiling = (getEntitiesBySlabNo('coilingRecords', slabNo) as CoilingRecord[])[0];
        const inspection = (getEntitiesBySlabNo('inspectionRecords', slabNo) as InspectionRecord[])[0];
        return { slab, heating, finishing, coiling, inspection, colorIndex: index };
      })
      .filter(Boolean) as (CompareData & { colorIndex: number })[];
  }, [effectiveCompareSlabNos, slabs, getEntitiesBySlabNo]);

  const availableSlabs = useMemo(() => {
    return slabs.filter((s) => !effectiveCompareSlabNos.includes(s.slabNo));
  }, [slabs, effectiveCompareSlabNos]);

  const heatingChartData = useMemo(() => {
    return compareData.map((d) => ({
      slabNo: d.slab.slabNo.slice(-5),
      preheatTemp: d.heating?.preheatTemp || 0,
      heatingTemp: d.heating?.heatingTemp || 0,
      soakingTemp: d.heating?.soakingTemp || 0,
      dischargeTemp: d.heating?.dischargeTemp || 0,
    }));
  }, [compareData]);

  const thicknessChartData = useMemo(() => {
    return compareData.map((d) => {
      const avgThickness = d.finishing
        ? (d.finishing.headThickness + d.finishing.midThickness + d.finishing.tailThickness) / 3
        : 0;
      const targetThickness = d.slab.thickness > 200 ? d.slab.thickness / 70 : d.slab.thickness / 60;
      return {
        slabNo: d.slab.slabNo.slice(-5),
        headThickness: d.finishing?.headThickness || 0,
        midThickness: d.finishing?.midThickness || 0,
        tailThickness: d.finishing?.tailThickness || 0,
        targetThickness: Number(targetThickness.toFixed(2)),
        avgThickness: Number(avgThickness.toFixed(3)),
      };
    });
  }, [compareData]);

  const coilingChartData = useMemo(() => {
    return compareData.map((d) => ({
      slabNo: d.slab.slabNo.slice(-5),
      coilingTemp: d.coiling?.coilingTemp || 0,
      targetTemp: 620,
      toleranceUpper: 640,
      toleranceLower: 600,
    }));
  }, [compareData]);

  const performanceChartData = useMemo(() => {
    return compareData.map((d) => ({
      slabNo: d.slab.slabNo.slice(-5),
      yieldStrength: d.inspection?.yieldStrength || 0,
      tensileStrength: d.inspection?.tensileStrength || 0,
      elongation: d.inspection?.elongation || 0,
      yieldStandard: 235,
      tensileStandard: 370,
      elongationStandard: 26,
    }));
  }, [compareData]);

  const tableRows = useMemo(() => {
    type TableRow = {
      label: string;
      unit: string;
      values: (string | number | null)[];
      isNumeric: boolean;
      higherIsBetter: boolean;
    };
    const rows: TableRow[] = [
      {
        label: '钢种',
        unit: '',
        values: compareData.map((d) => d.slab.steelGrade),
        isNumeric: false,
        higherIsBetter: false,
      },
      {
        label: '规格',
        unit: '',
        values: compareData.map((d) => `${d.slab.thickness}×${d.slab.width}mm`),
        isNumeric: false,
        higherIsBetter: false,
      },
      {
        label: '出炉温度',
        unit: '℃',
        values: compareData.map((d) => d.heating?.dischargeTemp || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '终轧温度',
        unit: '℃',
        values: compareData.map((d) => d.finishing?.finishingTemp || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '平均厚度',
        unit: 'mm',
        values: compareData.map((d) =>
          d.finishing
            ? Number(((d.finishing.headThickness + d.finishing.midThickness + d.finishing.tailThickness) / 3).toFixed(3))
            : null
        ),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '凸度',
        unit: 'μm',
        values: compareData.map((d) => d.finishing?.crown || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '卷取温度',
        unit: '℃',
        values: compareData.map((d) => d.coiling?.coilingTemp || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '屈服强度',
        unit: 'MPa',
        values: compareData.map((d) => d.inspection?.yieldStrength || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '抗拉强度',
        unit: 'MPa',
        values: compareData.map((d) => d.inspection?.tensileStrength || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '延伸率',
        unit: '%',
        values: compareData.map((d) => d.inspection?.elongation || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '冲击功',
        unit: 'J',
        values: compareData.map((d) => d.inspection?.impactEnergy || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '检验结果',
        unit: '',
        values: compareData.map((d) => d.inspection?.result || 'pending'),
        isNumeric: false,
        higherIsBetter: false,
      },
    ];

    return rows.map((row) => {
      const numericValues = row.values.filter((v): v is number => typeof v === 'number');
      let bestIndex = -1;
      let worstIndex = -1;

      if (row.isNumeric && numericValues.length > 1) {
        const best = row.higherIsBetter ? Math.max(...numericValues) : Math.min(...numericValues);
        const worst = row.higherIsBetter ? Math.min(...numericValues) : Math.max(...numericValues);
        bestIndex = row.values.indexOf(best);
        worstIndex = row.values.indexOf(worst);
        if (bestIndex === worstIndex) {
          worstIndex = -1;
        }
      }

      const avg = numericValues.length > 0
        ? Number((numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2))
        : null;

      return { ...row, bestIndex, worstIndex, avg };
    });
  }, [compareData]);

  const formatCellValue = (row: typeof tableRows[0], value: unknown) => {
    if (value === null || value === undefined) return '--';
    if (row.label === '检验结果') {
      return formatInspectionResult(String(value));
    }
    if (!row.isNumeric) return String(value);
    const num = Number(value);
    if (row.label === '出炉温度' || row.label === '终轧温度' || row.label === '卷取温度') {
      return formatTemperature(num);
    }
    if (row.label === '平均厚度') {
      return formatThickness(num, 3);
    }
    if (row.label === '凸度') {
      return `${num.toFixed(0)}μm`;
    }
    if (row.label === '屈服强度' || row.label === '抗拉强度') {
      return formatStrength(num);
    }
    if (row.label === '延伸率') {
      return formatElongation(num);
    }
    if (row.label === '冲击功') {
      return formatImpactEnergy(num);
    }
    return formatNumber(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <GitCompare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">板坯对比</h1>
            <p className="text-gray-400 text-sm">多板坯全流程工艺与质量数据横向对比分析</p>
          </div>
        </div>
      </div>

      <SectionCard
        title="对比板坯选择"
        subtitle={`已选择 ${effectiveCompareSlabNos.length} 块板坯，最多可对比 4 块`}
        icon={<BarChart3 className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={effectiveCompareSlabNos.length >= 4}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              添加板坯
            </button>
            <button
              onClick={clearCompareSlabs}
              disabled={effectiveCompareSlabNos.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              清空对比
            </button>
          </div>
        }
      >
        {effectiveCompareSlabNos.length < 2 ? (
          <div className="py-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-sm">
              <Flame className="w-4 h-4" />
              请至少选择2块板坯进行对比
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {compareData.map((d, idx) => {
              const color = SLAB_COLORS[idx % SLAB_COLORS.length];
              return (
                <div
                  key={d.slab.slabNo}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${color.bg} ${color.border}`}
                >
                  <div className={`w-3 h-3 rounded-full ${color.bg.replace('/20', '')}`} style={{ backgroundColor: color.fill }} />
                  <div className="flex flex-col">
                    <span className={`font-mono text-sm font-medium ${color.text}`}>{d.slab.slabNo}</span>
                    <span className="text-gray-400 text-xs">{d.slab.steelGrade}</span>
                  </div>
                  <button
                    onClick={() => removeCompareSlab(d.slab.slabNo)}
                    className={`ml-2 w-5 h-5 rounded flex items-center justify-center ${color.text} hover:bg-white/10 transition-colors`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {effectiveCompareSlabNos.length >= 2 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="加热温度对比"
              subtitle="预热段、加热段、均热段与出炉温度"
              icon={<Thermometer className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatingChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      domain={[700, 1350]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: any, name: string) => {
                        const map: Record<string, string> = {
                          preheatTemp: '预热段',
                          heatingTemp: '加热段',
                          soakingTemp: '均热段',
                          dischargeTemp: '出炉温度',
                        };
                        return [`${value}℃`, map[name] || name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          preheatTemp: '预热段',
                          heatingTemp: '加热段',
                          soakingTemp: '均热段',
                          dischargeTemp: '出炉温度',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    {heatingChartData.map((_, idx) => {
                      const color = SLAB_COLORS[idx % SLAB_COLORS.length];
                      return null;
                    })}
                    <Bar dataKey="preheatTemp" fill="#f97316" name="preheatTemp" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="heatingTemp" fill="#3b82f6" name="heatingTemp" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="soakingTemp" fill="#22c55e" name="soakingTemp" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="dischargeTemp" fill="#a855f7" name="dischargeTemp" radius={[2, 2, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="终轧厚度对比"
              subtitle="头部、中部、尾部厚度与目标值"
              icon={<Ruler className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={thicknessChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '厚度 (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: any, name: string) => {
                        const map: Record<string, string> = {
                          headThickness: '头部厚度',
                          midThickness: '中部厚度',
                          tailThickness: '尾部厚度',
                          targetThickness: '目标厚度',
                        };
                        return [`${value}mm`, map[name] || name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          headThickness: '头部厚度',
                          midThickness: '中部厚度',
                          tailThickness: '尾部厚度',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    <ReferenceLine
                      y={thicknessChartData.length > 0 ? thicknessChartData[0].targetThickness : 0}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: '目标厚度', position: 'right', fill: '#dc2626', fontSize: 10 }}
                    />
                    <Bar dataKey="headThickness" fill="#f97316" name="headThickness" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="midThickness" fill="#3b82f6" name="midThickness" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="tailThickness" fill="#22c55e" name="tailThickness" radius={[2, 2, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="卷取温度对比"
              subtitle="实际卷取温度与目标公差带"
              icon={<Coins className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coilingChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="toleranceBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      domain={[550, 700]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: any, name: string) => {
                        const map: Record<string, string> = {
                          coilingTemp: '卷取温度',
                          targetTemp: '目标温度',
                        };
                        return [`${value}℃`, map[name] || name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          coilingTemp: '卷取温度',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    <ReferenceLine
                      y={600}
                      stroke="#22c55e"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{ value: '公差下限 600℃', position: 'right', fill: '#22c55e', fontSize: 9 }}
                    />
                    <ReferenceLine
                      y={620}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: '目标 620℃', position: 'right', fill: '#f59e0b', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={640}
                      stroke="#22c55e"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{ value: '公差上限 640℃', position: 'right', fill: '#22c55e', fontSize: 9 }}
                    />
                    <Bar dataKey="coilingTemp" fill="#f97316" name="coilingTemp" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="力学性能对比"
              subtitle="屈服强度、抗拉强度与延伸率"
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={performanceChartData} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[150, 600]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '强度 (MPa)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[15, 45]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '延伸率 (%)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: any, name: string) => {
                        const map: Record<string, { label: string; unit: string }> = {
                          yieldStrength: { label: '屈服强度', unit: 'MPa' },
                          tensileStrength: { label: '抗拉强度', unit: 'MPa' },
                          elongation: { label: '延伸率', unit: '%' },
                        };
                        const cfg = map[name];
                        return cfg ? [`${value} ${cfg.unit}`, cfg.label] : [value, name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          yieldStrength: '屈服强度',
                          tensileStrength: '抗拉强度',
                          elongation: '延伸率',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={235}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'σs下限 235MPa', position: 'right', fill: '#dc2626', fontSize: 9 }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={370}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'σb下限 370MPa', position: 'right', fill: '#dc2626', fontSize: 9 }}
                    />
                    <ReferenceLine
                      yAxisId="right"
                      y={26}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'δ下限 26%', position: 'right', fill: '#f59e0b', fontSize: 9 }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="yieldStrength"
                      fill="#f97316"
                      name="yieldStrength"
                      radius={[2, 2, 0, 0]}
                      barSize={14}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="tensileStrength"
                      fill="#3b82f6"
                      name="tensileStrength"
                      radius={[2, 2, 0, 0]}
                      barSize={14}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="elongation"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#22c55e', stroke: '#fff', strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                      name="elongation"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="对比数据表"
            subtitle="全流程关键指标横向对比，绿色为最优，橙色为最差"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-3 font-medium w-32">指标</th>
                    {compareData.map((d, idx) => {
                      const color = SLAB_COLORS[idx % SLAB_COLORS.length];
                      return (
                        <th key={d.slab.slabNo} className="pb-3 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.fill }} />
                            <span className={`font-mono ${color.text}`}>{d.slab.slabNo.slice(-5)}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="pb-3 font-medium text-gray-300">平均值</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 pr-4 text-gray-300 font-medium whitespace-nowrap">
                        {row.label}
                        {row.unit && <span className="text-gray-500 text-xs ml-1">({row.unit})</span>}
                      </td>
                      {row.values.map((value, colIdx) => {
                        const isBest = row.bestIndex === colIdx;
                        const isWorst = row.worstIndex === colIdx;
                        let cellClass = 'text-gray-300';
                        if (isBest) cellClass = 'text-green-400 font-semibold';
                        else if (isWorst) cellClass = 'text-orange-400';

                        if (row.label === '检验结果') {
                          const result = String(value || 'pending');
                          const resultMap: Record<string, { text: string; bg: string; border: string }> = {
                            qualified: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                            unqualified: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                            pending: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                          };
                          const cfg = resultMap[result] || resultMap.pending;
                          return (
                            <td key={colIdx} className="py-3 pr-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                {formatCellValue(row, value)}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={colIdx} className={`py-3 pr-4 ${cellClass} font-mono`}>
                            {formatCellValue(row, value)}
                            {isBest && <span className="ml-1 text-green-500 text-xs">↑</span>}
                            {isWorst && <span className="ml-1 text-orange-500 text-xs">↓</span>}
                          </td>
                        );
                      })}
                      <td className="py-3 pr-4 text-gray-400 font-mono">
                        {row.isNumeric && row.avg !== null ? formatCellValue(row, row.avg) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg mx-4 max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">添加对比板坯</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {availableSlabs.length === 0 ? (
                <div className="py-8 text-center text-gray-500">暂无可添加的板坯</div>
              ) : (
                <div className="space-y-2">
                  {availableSlabs.map((slab) => (
                    <button
                      key={slab.id}
                      onClick={() => {
                        addCompareSlab(slab.slabNo);
                        setShowAddModal(false);
                      }}
                      disabled={effectiveCompareSlabNos.length >= 4}
                      className="w-full flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-md hover:border-orange-500/50 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div>
                        <div className="text-orange-400 font-mono text-sm font-medium">{slab.slabNo}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{slab.steelGrade} · {slab.thickness}×{slab.width}mm</div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
