import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import DataCard from '@/components/common/DataCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Factory,
  Droplets,
  Gauge,
  Layers,
  Zap,
  Activity,
  ArrowRightLeft,
} from 'lucide-react';
import type { DescalingRecord, RoughingPass } from '@/types';
import {
  formatPressure,
  formatFlow,
  formatNumber,
  formatThickness,
  formatForce,
  formatSpeed,
  formatPercent,
  formatDateTime,
} from '@/utils/format';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

export default function RoughingMill() {
  const { descalingRecords, roughingPasses, currentSlabNo, getEntitiesBySlabNo, coilingRecords } = useStore();

  const descaling: DescalingRecord[] = currentSlabNo
    ? (getEntitiesBySlabNo('descalingRecords', currentSlabNo) as DescalingRecord[])
    : descalingRecords;

  const passes: RoughingPass[] = currentSlabNo
    ? (getEntitiesBySlabNo('roughingPasses', currentSlabNo) as RoughingPass[])
    : roughingPasses;

  const qualifiedCount = descaling.filter((d) => d.waterPressure >= 18 && d.descalingCount >= 1).length;
  const descalingPassRate = descaling.length > 0 ? qualifiedCount / descaling.length : 0;
  const avgWaterPressure = descaling.length > 0
    ? descaling.reduce((sum, d) => sum + d.waterPressure, 0) / descaling.length
    : 0;
  const totalPasses = passes.length;
  const avgRollingForce = passes.length > 0
    ? passes.reduce((sum, p) => sum + p.rollingForce, 0) / passes.length
    : 0;

  const latestDescaling = descaling.length > 0 ? descaling[descaling.length - 1] : null;

  const targetSlabNo = currentSlabNo || 'PB240617001';
  const targetSlabPasses = passes.filter((p) => p.slabNo === targetSlabNo);
  const fullPassData = [1, 2, 3, 4, 5, 6, 7].map((passNo) => {
    const existing = targetSlabPasses.find((p) => p.passNo === passNo);
    if (existing) {
      return {
        passNo: `${passNo}道`,
        inletThickness: existing.inletThickness,
        outletThickness: existing.outletThickness,
        reduction: existing.reduction,
        rollingForce: existing.rollingForce,
      };
    }
    const prevPass = targetSlabPasses.find((p) => p.passNo === passNo - 2);
    if (prevPass) {
      const estReduction = Math.max(15, prevPass.reduction - 6);
      const estOutlet = Math.max(10, prevPass.outletThickness - estReduction);
      const estInlet = prevPass.outletThickness;
      const estForce = Math.max(8000, prevPass.rollingForce - 2200);
      return {
        passNo: `${passNo}道`,
        inletThickness: estInlet,
        outletThickness: estOutlet,
        reduction: estReduction,
        rollingForce: estForce,
      };
    }
    return {
      passNo: `${passNo}道`,
      inletThickness: 0,
      outletThickness: 0,
      reduction: 0,
      rollingForce: 0,
    };
  });

  const getDescalingStatus = (record: DescalingRecord): 'normal' | 'abnormal' => {
    return record.waterPressure >= 18 && record.descalingCount >= 1 ? 'normal' : 'abnormal';
  };

  const getCoilNo = (slabNo: string): string => {
    const coil = coilingRecords.find((c) => c.slabNo === slabNo);
    return coil?.coilNo || slabNo;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Factory className="w-7 h-7 text-orange-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">粗轧除鳞</h1>
          <p className="text-gray-400 text-sm">高压水除鳞监控与粗轧道次压下规程</p>
        </div>
      </div>

      {currentSlabNo && (
        <div className="text-sm text-gray-400">
          当前板坯: <span className="text-orange-400 font-mono">{currentSlabNo}</span>
          <span className="mx-2 text-gray-600">|</span>
          钢卷号: <span className="text-data-400 font-mono">{getCoilNo(currentSlabNo)}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard
          title="除鳞合格率"
          value={formatPercent(descalingPassRate, 1)}
          icon={Activity}
          iconColor="from-safe-500 to-safe-700"
          trend={descalingPassRate >= 0.9 ? 'up' : descalingPassRate >= 0.75 ? 'flat' : 'down'}
          trendValue={descalingPassRate >= 0.9 ? '良好' : descalingPassRate >= 0.75 ? '达标' : '偏低'}
        />
        <DataCard
          title="平均水压"
          value={formatNumber(avgWaterPressure, 1)}
          unit="MPa"
          icon={Droplets}
          iconColor="from-data-500 to-data-700"
          trend={avgWaterPressure >= 19 ? 'up' : avgWaterPressure >= 17.5 ? 'flat' : 'down'}
          trendValue={avgWaterPressure >= 19 ? '充足' : avgWaterPressure >= 17.5 ? '正常' : '偏低'}
        />
        <DataCard
          title="粗轧道次总数"
          value={totalPasses}
          icon={Layers}
          iconColor="from-warm-500 to-warm-700"
          description="累计道次记录"
        />
        <DataCard
          title="平均轧制力"
          value={formatNumber(avgRollingForce, 0)}
          unit="kN"
          icon={Zap}
          iconColor="from-steel-500 to-steel-700"
          description="各道次平均"
        />
      </div>

      <SectionCard title="高压水除鳞" subtitle="实时除鳞参数监控与历史记录" icon={<Droplets className="w-5 h-5" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-data-400" />
              <span className="text-gray-400 text-sm font-medium">当前水压</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white font-numeric">
                {latestDescaling ? formatNumber(latestDescaling.waterPressure, 1) : '--'}
              </span>
              <span className="text-gray-500 text-sm">MPa</span>
            </div>
            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  latestDescaling && latestDescaling.waterPressure >= 18
                    ? 'bg-gradient-to-r from-safe-500 to-safe-400'
                    : 'bg-gradient-to-r from-alert-500 to-alert-400'
                }`}
                style={{ width: `${Math.min(100, ((latestDescaling?.waterPressure || 0) / 25) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="text-gray-400">目标 ≥18MPa</span>
              <span>25</span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft className="w-4 h-4 text-data-400" />
              <span className="text-gray-400 text-sm font-medium">流量</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white font-numeric">
                {latestDescaling ? formatNumber(latestDescaling.waterFlow, 0) : '--'}
              </span>
              <span className="text-gray-500 text-sm">m³/h</span>
            </div>
            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-data-600 to-data-400 transition-all duration-500"
                style={{ width: `${Math.min(100, ((latestDescaling?.waterFlow || 0) / 1500) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="text-gray-400">标称 1000m³/h</span>
              <span>1500</span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-warm-400" />
              <span className="text-gray-400 text-sm font-medium">除鳞次数</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white font-numeric">
                {latestDescaling ? latestDescaling.descalingCount : '--'}
              </span>
              <span className="text-gray-500 text-sm">次</span>
            </div>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`flex-1 h-8 rounded-md flex items-center justify-center text-sm font-medium border transition-colors ${
                    latestDescaling && latestDescaling.descalingCount >= n
                      ? 'bg-warm-500/20 border-warm-500/40 text-warm-300'
                      : 'bg-gray-700/30 border-gray-700 text-gray-500'
                  }`}
                >
                  {n}次
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {latestDescaling && latestDescaling.descalingCount >= 2 ? (
                <span className="text-safe-400">✓ 除鳞充分</span>
              ) : latestDescaling && latestDescaling.descalingCount === 1 ? (
                <span className="text-warm-400">⚠ 单次除鳞</span>
              ) : (
                <span className="text-gray-500">待检测</span>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 font-medium">板坯号</th>
                <th className="pb-3 font-medium">除鳞时间</th>
                <th className="pb-3 font-medium">水压(MPa)</th>
                <th className="pb-3 font-medium">流量(m³/h)</th>
                <th className="pb-3 font-medium">除鳞次数</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {descaling.slice().reverse().slice(0, 10).map((record) => (
                <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 pr-4 text-white font-mono">{record.slabNo}</td>
                  <td className="py-3 pr-4 text-gray-400">{formatDateTime(record.recordTime)}</td>
                  <td className="py-3 pr-4 text-gray-300 font-numeric">{formatPressure(record.waterPressure)}</td>
                  <td className="py-3 pr-4 text-gray-300 font-numeric">{formatFlow(record.waterFlow)}</td>
                  <td className="py-3 pr-4 text-warm-400 font-medium font-numeric">{record.descalingCount}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      status={getDescalingStatus(record)}
                      label={getDescalingStatus(record) === 'normal' ? '合格' : '不合格'}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="粗轧道次压下规程" subtitle={`板坯 ${targetSlabNo} 各道次压下量与厚度变化`} icon={<Factory className="w-5 h-5" />}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={fullPassData} margin={{ top: 20, right: 40, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="passNo"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
                label={{ value: '厚度(mm)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
                domain={[0, 'auto']}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
                label={{ value: '压下量(mm)', angle: 90, position: 'insideRight', fill: '#9ca3af', fontSize: 12 }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#e5e7eb',
                }}
                labelStyle={{ color: '#f97316', fontWeight: 600 }}
                cursor={{ stroke: '#4b5563', strokeDasharray: '3 3' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar
                yAxisId="right"
                dataKey="reduction"
                name="压下量"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                barSize={28}
              >
                <LabelList
                  dataKey="rollingForce"
                  position="top"
                  formatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
                  fill="#fbbf24"
                  fontSize={11}
                  fontWeight={500}
                />
              </Bar>
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="inletThickness"
                name="入口厚度"
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#60a5fa', stroke: '#1f2937', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="outletThickness"
                name="出口厚度"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#34d399', stroke: '#1f2937', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          * 柱顶数值为该道次轧制力 (kN)
        </div>
      </SectionCard>

      <SectionCard title="粗轧道次参数表" subtitle="各板坯粗轧道次详细参数记录" icon={<Layers className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 font-medium">板坯号</th>
                <th className="pb-3 font-medium">道次</th>
                <th className="pb-3 font-medium">入口厚度(mm)</th>
                <th className="pb-3 font-medium">出口厚度(mm)</th>
                <th className="pb-3 font-medium">压下量(mm)</th>
                <th className="pb-3 font-medium">压下率(%)</th>
                <th className="pb-3 font-medium">轧制力(kN)</th>
                <th className="pb-3 font-medium">轧制速度(m/s)</th>
              </tr>
            </thead>
            <tbody>
              {passes.map((pass) => {
                const reductionRate = pass.inletThickness > 0 ? pass.reduction / pass.inletThickness : 0;
                return (
                  <tr key={pass.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 pr-4 text-white font-mono">{pass.slabNo}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-steel-500/30 text-steel-200 border border-steel-500/40">
                        第{pass.passNo}道
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-300 font-numeric">{formatThickness(pass.inletThickness)}</td>
                    <td className="py-3 pr-4 text-gray-300 font-numeric">{formatThickness(pass.outletThickness)}</td>
                    <td className="py-3 pr-4 text-warm-400 font-medium font-numeric">{formatNumber(pass.reduction, 1)}mm</td>
                    <td className="py-3 pr-4 text-data-400 font-numeric">{formatPercent(reductionRate, 1)}</td>
                    <td className="py-3 pr-4 text-gray-300 font-numeric">{formatForce(pass.rollingForce)}</td>
                    <td className="py-3 pr-4 text-gray-300 font-numeric">{formatSpeed(pass.rollingSpeed)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
