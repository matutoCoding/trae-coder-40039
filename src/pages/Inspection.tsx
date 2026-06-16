import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import DataCard from '@/components/common/DataCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  ClipboardCheck,
  Beaker,
  Gauge,
  ShieldCheck,
  Award,
  Zap,
  FileCheck2,
  ScanLine,
  CheckSquare,
  Square,
  X,
  GitCompare,
  XCircle,
  Info,
} from 'lucide-react';
import type { InspectionRecord, InspectionResult } from '@/types';
import {
  formatStrength,
  formatElongation,
  formatImpactEnergy,
  formatNumber,
  formatDateTime,
  formatInspectionResult,
} from '@/utils/format';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

export default function Inspection() {
  const navigate = useNavigate();
  const {
    inspectionRecords,
    currentSlabNo,
    getEntitiesBySlabNo,
    slabs,
    coilingRecords,
    setCurrentSlabNo,
    clearCurrentSelection,
    compareSlabNos,
    toggleCompareSlab,
    clearCompareSlabs,
  } = useStore();

  const currentSlab = useMemo(() => {
    if (!currentSlabNo) return null;
    return slabs.find((s) => s.slabNo === currentSlabNo) || null;
  }, [currentSlabNo, slabs]);

  const isCurrentInCompare = currentSlabNo ? compareSlabNos.includes(currentSlabNo) : false;

  const compareSlabList = useMemo(() => {
    return compareSlabNos
      .map((no) => slabs.find((s) => s.slabNo === no))
      .filter(Boolean) as typeof slabs;
  }, [compareSlabNos, slabs]);

  const handleClearSelection = () => {
    clearCurrentSelection();
  };

  const records: InspectionRecord[] = useMemo(
    () =>
      currentSlabNo
        ? (getEntitiesBySlabNo('inspectionRecords', currentSlabNo) as InspectionRecord[])
        : inspectionRecords,
    [inspectionRecords, currentSlabNo, getEntitiesBySlabNo]
  );

  const todayCount = records.length;

  const qualifiedRecords = records.filter((r) => r.result === 'qualified');
  const passRate = records.length > 0 ? (qualifiedRecords.length / records.length) * 100 : 0;

  const avgYieldStrength = useMemo(() => {
    if (qualifiedRecords.length === 0) return 0;
    return qualifiedRecords.reduce((sum, r) => sum + r.yieldStrength, 0) / qualifiedRecords.length;
  }, [qualifiedRecords]);

  const avgTensileStrength = useMemo(() => {
    if (qualifiedRecords.length === 0) return 0;
    return qualifiedRecords.reduce((sum, r) => sum + r.tensileStrength, 0) / qualifiedRecords.length;
  }, [qualifiedRecords]);

  const avgElongation = useMemo(() => {
    if (qualifiedRecords.length === 0) return 0;
    return qualifiedRecords.reduce((sum, r) => sum + r.elongation, 0) / qualifiedRecords.length;
  }, [qualifiedRecords]);

  const avgImpactEnergy = useMemo(() => {
    if (qualifiedRecords.length === 0) return 0;
    return qualifiedRecords.reduce((sum, r) => sum + r.impactEnergy, 0) / qualifiedRecords.length;
  }, [qualifiedRecords]);

  const pendingSamples = useMemo(() => {
    return records.filter((r) => r.result === 'pending').map((r) => {
      const slab = slabs.find((s) => s.slabNo === r.slabNo);
      return {
        ...r,
        steelGrade: slab?.steelGrade || '--',
      };
    });
  }, [records, slabs]);

  const performanceChartData = useMemo(() => {
    return records.slice(-15).map((r) => ({
      coilNo: r.sampleNo.slice(-5),
      yieldStrength: r.yieldStrength,
      tensileStrength: r.tensileStrength,
      elongation: r.elongation,
      yieldStandard: 235,
      tensileStandard: 370,
      elongationStandard: 26,
    }));
  }, [records]);

  const latestQualified = useMemo(() => {
    return [...records].reverse().find((r) => r.result === 'qualified');
  }, [records]);

  const latestCoil = useMemo(() => {
    if (!latestQualified) return null;
    const slab = slabs.find((s) => s.slabNo === latestQualified.slabNo);
    const coil = coilingRecords.find((c) => c.slabNo === latestQualified.slabNo);
    return { slab, coil, inspection: latestQualified };
  }, [latestQualified, slabs, coilingRecords]);

  const resultBadgeConfig: Record<InspectionResult, { label: string; bgClass: string; textClass: string; borderClass: string }> = {
    qualified: { label: '合格', bgClass: 'bg-green-500/10', textClass: 'text-green-400', borderClass: 'border-green-500/20' },
    unqualified: { label: '不合格', bgClass: 'bg-red-500/10', textClass: 'text-red-400', borderClass: 'border-red-500/20' },
    pending: { label: '待检', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400', borderClass: 'border-amber-500/20' },
  };

  const samplePositions = [
    { name: '头部', position: 15 },
    { name: '中部', position: 50 },
    { name: '尾部', position: 85 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <ClipboardCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">性能检验</h1>
          <p className="text-gray-400 text-sm">力学性能检验、取样管理与质量报告</p>
        </div>
      </div>

      {compareSlabList.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#1e293b] border border-orange-600/40 rounded-lg">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300">
              已选择 <span className="text-orange-400 font-bold">{compareSlabList.length}</span>/4 块板坯对比
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {compareSlabList.map((slab) => (
              <div
                key={slab.slabNo}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/15 border border-orange-500/40 rounded-md text-sm"
              >
                <span className="text-orange-300 font-mono">{slab.slabNo}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-300">{slab.steelGrade}</span>
                <button
                  onClick={() => toggleCompareSlab(slab.slabNo)}
                  className="ml-1 p-0.5 hover:bg-orange-500/30 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-orange-400" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {compareSlabList.length >= 2 && (
              <button
                onClick={() => navigate('/slab-compare')}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                跳转对比视图
              </button>
            )}
            <button
              onClick={clearCompareSlabs}
              className="inline-flex items-center gap-1 h-8 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium rounded-md transition-colors"
            >
              <XCircle className="w-4 h-4" />
              清空对比
            </button>
          </div>
        </div>
      )}

      {currentSlab && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#1e293b] border border-amber-600/40 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-300">
              当前选择：
              <span className="text-amber-400 font-mono font-bold ml-1">{currentSlab.slabNo}</span>
              <span className="text-gray-500 mx-2">·</span>
              <span className="text-gray-200">{currentSlab.steelGrade}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => toggleCompareSlab(currentSlab.slabNo)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-md transition-colors ${
                isCurrentInCompare
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                  : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40'
              }`}
            >
              {isCurrentInCompare ? (
                <>
                  <XCircle className="w-4 h-4" />
                  移出对比
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" />
                  加入对比
                </>
              )}
            </button>
            <button
              onClick={handleClearSelection}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              清除选择
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DataCard
          title="今日检验数"
          value={todayCount}
          unit="件"
          icon={Beaker}
          iconColor="from-orange-500 to-red-500"
        />
        <DataCard
          title="合格率"
          value={formatNumber(passRate, 1)}
          unit="%"
          icon={ShieldCheck}
          iconColor="from-green-500 to-emerald-600"
          description={`合格 ${qualifiedRecords.length} 件`}
        />
        <DataCard
          title="平均屈服强度"
          value={formatNumber(avgYieldStrength, 0)}
          unit="MPa"
          icon={Gauge}
          iconColor="from-blue-500 to-cyan-600"
        />
        <DataCard
          title="平均抗拉强度"
          value={formatNumber(avgTensileStrength, 0)}
          unit="MPa"
          icon={Award}
          iconColor="from-indigo-500 to-purple-600"
        />
        <DataCard
          title="平均延伸率"
          value={formatNumber(avgElongation, 1)}
          unit="%"
          icon={Zap}
          iconColor="from-amber-500 to-orange-600"
        />
        <DataCard
          title="平均冲击功"
          value={formatNumber(avgImpactEnergy, 0)}
          unit="J"
          icon={Zap}
          iconColor="from-rose-500 to-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="待取样列表"
          subtitle={`${pendingSamples.length} 件待检验`}
          icon={<ScanLine className="w-5 h-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {pendingSamples.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">暂无待检试样</div>
            ) : (
              pendingSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-400 font-mono text-sm font-medium">{sample.sampleNo}</span>
                    <StatusBadge status="pending" size="sm" showIcon={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">钢卷号: </span>
                      <span className="text-gray-300 font-mono">{sample.slabNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">钢种: </span>
                      <span className="text-gray-300">{sample.steelGrade}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">位置: </span>
                      <span className="text-blue-400">{sample.samplePosition}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">检验员: </span>
                      <span className="text-gray-300">{sample.inspector}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-400 mb-3">取样位置示意图</div>
            <div className="relative h-12 bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded" />
              {samplePositions.map((pos, idx) => (
                <div
                  key={pos.name}
                  className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${pos.position}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  <span className="text-[10px] text-gray-400 mt-1">{pos.name}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="力学性能趋势"
          subtitle="最近15卷屈服强度、抗拉强度与延伸率"
          icon={<Beaker className="w-5 h-5" />}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceChartData} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="coilNo"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  label={{ value: '试样编号', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 12 }}
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
                      yieldStandard: '屈服标准下限',
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
                  label={{ value: 'σs下限 235MPa', position: 'right', fill: '#dc2626', fontSize: 10 }}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={370}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'σb下限 370MPa', position: 'right', fill: '#dc2626', fontSize: 10 }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={26}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'δ下限 26%', position: 'right', fill: '#f59e0b', fontSize: 10 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="yieldStrength"
                  fill="#e86a2c"
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
                  stroke="#2ea043"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2ea043', stroke: '#fff', strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                  name="elongation"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="力学性能数据"
        subtitle={`共 ${records.length} 条检验记录`}
        icon={<ClipboardCheck className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 w-10 font-medium">
                  <span className="sr-only">对比</span>
                </th>
                <th className="pb-3 font-medium">试样编号</th>
                <th className="pb-3 font-medium">钢卷号</th>
                <th className="pb-3 font-medium">钢种</th>
                <th className="pb-3 font-medium">取样位置</th>
                <th className="pb-3 font-medium">屈服强度</th>
                <th className="pb-3 font-medium">抗拉强度</th>
                <th className="pb-3 font-medium">延伸率</th>
                <th className="pb-3 font-medium">冲击功</th>
                <th className="pb-3 font-medium">判定结果</th>
                <th className="pb-3 font-medium">检验员</th>
                <th className="pb-3 font-medium">检验时间</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const slab = slabs.find((s) => s.slabNo === record.slabNo);
                const badgeCfg = resultBadgeConfig[record.result];
                const isSelected = currentSlabNo === record.slabNo;
                const isInCompare = compareSlabNos.includes(record.slabNo);
                return (
                  <tr
                    key={record.id}
                    onClick={() => setCurrentSlabNo(record.slabNo)}
                    className={`border-b transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/15'
                        : 'border-gray-800 hover:bg-gray-800/50'
                    }`}
                  >
                    <td className="py-3 pr-4 w-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompareSlab(record.slabNo);
                        }}
                        className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                      >
                        {isInCompare ? (
                          <CheckSquare className="w-5 h-5 text-orange-400" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-orange-400 font-mono font-medium">{record.sampleNo}</td>
                    <td className="py-3 pr-4 text-white font-mono">{record.slabNo}</td>
                    <td className="py-3 pr-4 text-gray-300">{slab?.steelGrade || '--'}</td>
                    <td className="py-3 pr-4 text-blue-400">{record.samplePosition}</td>
                    <td className="py-3 pr-4 text-orange-400 font-medium">{formatStrength(record.yieldStrength)}</td>
                    <td className="py-3 pr-4 text-blue-400 font-medium">{formatStrength(record.tensileStrength)}</td>
                    <td className="py-3 pr-4 text-green-400 font-medium">{formatElongation(record.elongation)}</td>
                    <td className="py-3 pr-4 text-purple-400 font-medium">{formatImpactEnergy(record.impactEnergy)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${badgeCfg.bgClass} ${badgeCfg.textClass} ${badgeCfg.borderClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          record.result === 'qualified' ? 'bg-green-500' :
                          record.result === 'unqualified' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        {badgeCfg.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{record.inspector}</td>
                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{formatDateTime(record.inspectTime)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="质量证明书预览"
        subtitle="产品质量检验报告"
        icon={<FileCheck2 className="w-5 h-5" />}
      >
        {latestCoil ? (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-white">热轧钢带产品质量证明书</h3>
                <p className="text-gray-400 text-sm mt-1">HOT ROLLED STEEL COIL QUALITY CERTIFICATE</p>
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-green-500/50 flex items-center justify-center bg-green-500/10 transform rotate-[-15deg]">
                  <div className="text-center">
                    <ShieldCheck className="w-6 h-6 text-green-400 mx-auto" />
                    <span className="text-green-400 text-xs font-bold block mt-1">检验合格</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">钢卷号:</span>
                <span className="text-white font-mono font-medium">{latestCoil.coil?.coilNo || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">板坯号:</span>
                <span className="text-white font-mono">{latestCoil.slab?.slabNo || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">钢种牌号:</span>
                <span className="text-orange-400 font-medium">{latestCoil.slab?.steelGrade || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">规格:</span>
                <span className="text-white font-mono">
                  {latestCoil.slab ? `${latestCoil.slab.thickness}×${latestCoil.slab.width}mm` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">重量:</span>
                <span className="text-white font-mono">
                  {latestCoil.coil ? `${latestCoil.coil.netWeight.toFixed(3)}t` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">检验日期:</span>
                <span className="text-gray-300 font-mono">
                  {latestCoil.inspection ? formatDateTime(latestCoil.inspection.inspectTime, false) : '--'}
                </span>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
              <div className="text-gray-400 text-xs font-medium mb-3 pb-2 border-b border-gray-700/50">力学性能检验结果</div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-gray-400 text-xs mb-1">屈服强度 σs</div>
                  <div className="text-lg font-bold text-orange-400">
                    {formatStrength(latestCoil.inspection.yieldStrength)}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">≥235MPa</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">抗拉强度 σb</div>
                  <div className="text-lg font-bold text-blue-400">
                    {formatStrength(latestCoil.inspection.tensileStrength)}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">≥370MPa</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">延伸率 δ</div>
                  <div className="text-lg font-bold text-green-400">
                    {formatElongation(latestCoil.inspection.elongation)}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">≥26%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">冲击功 Akv</div>
                  <div className="text-lg font-bold text-purple-400">
                    {formatImpactEnergy(latestCoil.inspection.impactEnergy)}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">≥27J</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between text-xs">
              <div className="text-gray-500">
                检验员: <span className="text-gray-300">{latestCoil.inspection.inspector}</span>
              </div>
              <div className="text-gray-500">
                证书编号: <span className="text-orange-400 font-mono">{latestCoil.inspection.sampleNo}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">暂无合格检验记录</div>
        )}
      </SectionCard>
    </div>
  );
}
