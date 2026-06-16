import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import DataCard from '@/components/common/DataCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Gauge,
  Thermometer,
  Ruler,
  Waves,
  TrendingUp,
  Activity,
  Target,
} from 'lucide-react';
import type { FinishingRecord } from '@/types';
import {
  formatTemperature,
  formatThickness,
  formatNumber,
  formatPercent,
} from '@/utils/format';
import {
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

export default function FinishingMill() {
  const { finishingRecords, currentSlabNo, getEntitiesBySlabNo, coilingRecords } = useStore();

  const records: FinishingRecord[] = currentSlabNo
    ? (getEntitiesBySlabNo('finishingRecords', currentSlabNo) as FinishingRecord[])
    : finishingRecords;

  const avgFinishingTemp = records.length > 0
    ? records.reduce((sum, r) => sum + r.finishingTemp, 0) / records.length
    : 0;

  const thicknessDeviationQualified = records.filter((r) => {
    const target = r.midThickness;
    const deviation = Math.max(
      Math.abs(r.headThickness - target),
      Math.abs(r.tailThickness - target)
    );
    return deviation <= target * 0.015;
  }).length;
  const thicknessPassRate = records.length > 0 ? thicknessDeviationQualified / records.length : 0;

  const shapeQualified = records.filter((r) => r.crown <= 60 && r.wedge <= 25 && r.flatness <= 50).length;
  const shapePassRate = records.length > 0 ? shapeQualified / records.length : 0;

  const avgCrown = records.length > 0
    ? records.reduce((sum, r) => sum + r.crown, 0) / records.length
    : 0;
  const avgWedge = records.length > 0
    ? records.reduce((sum, r) => sum + r.wedge, 0) / records.length
    : 0;
  const avgFlatness = records.length > 0
    ? records.reduce((sum, r) => sum + r.flatness, 0) / records.length
    : 0;

  const getCoilNo = (slabNo: string): string => {
    const coil = coilingRecords.find((c) => c.slabNo === slabNo);
    return coil?.coilNo || slabNo;
  };

  const tempTrendData = records.slice(-20).map((r) => ({
    coilNo: getCoilNo(r.slabNo).slice(-6),
    slabNo: r.slabNo,
    actual: r.finishingTemp,
    target: 860,
    upper: 890,
    lower: 830,
  }));

  const thicknessData = records.slice(-10).map((r) => ({
    coilNo: getCoilNo(r.slabNo).slice(-6),
    head: r.headThickness,
    mid: r.midThickness,
    tail: r.tailThickness,
    target: r.midThickness,
  }));

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  const crownPercent = Math.min(100, (latestRecord?.crown || 0) / 80 * 100);
  const wedgePercent = Math.min(100, (latestRecord?.wedge || 0) / 40 * 100);
  const flatnessPercent = Math.min(100, (latestRecord?.flatness || 0) / 80 * 100);

  const getShapeStatus = (record: FinishingRecord): 'normal' | 'warning' | 'abnormal' => {
    const crownOk = record.crown <= 60;
    const wedgeOk = record.wedge <= 25;
    const flatOk = record.flatness <= 50;
    if (crownOk && wedgeOk && flatOk) return 'normal';
    if (record.crown > 75 || record.wedge > 35 || record.flatness > 65) return 'abnormal';
    return 'warning';
  };

  const getShapeLabel = (status: 'normal' | 'warning' | 'abnormal'): string => {
    const map = { normal: '合格', warning: '临界', abnormal: '不合格' };
    return map[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gauge className="w-7 h-7 text-orange-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">精轧机组</h1>
          <p className="text-gray-400 text-sm">终轧温度、厚度精度与板形质量监控</p>
        </div>
      </div>

      {currentSlabNo && (
        <div className="text-sm text-gray-400">
          当前板坯: <span className="text-orange-400 font-mono">{currentSlabNo}</span>
          <span className="mx-2 text-gray-600">|</span>
          钢卷号: <span className="text-data-400 font-mono">{getCoilNo(currentSlabNo)}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DataCard
          title="平均终轧温度"
          value={formatNumber(avgFinishingTemp, 0)}
          unit="℃"
          icon={Thermometer}
          iconColor="from-warm-500 to-warm-700"
          trend={avgFinishingTemp >= 855 && avgFinishingTemp <= 875 ? 'flat' : avgFinishingTemp > 875 ? 'up' : 'down'}
          trendValue={avgFinishingTemp >= 855 && avgFinishingTemp <= 875 ? '正常' : avgFinishingTemp > 875 ? '偏高' : '偏低'}
        />
        <DataCard
          title="厚度偏差合格率"
          value={formatPercent(thicknessPassRate, 1)}
          icon={Ruler}
          iconColor="from-data-500 to-data-700"
          trend={thicknessPassRate >= 0.95 ? 'up' : thicknessPassRate >= 0.85 ? 'flat' : 'down'}
          trendValue={thicknessPassRate >= 0.95 ? '优秀' : thicknessPassRate >= 0.85 ? '达标' : '偏低'}
        />
        <DataCard
          title="板形合格率"
          value={formatPercent(shapePassRate, 1)}
          icon={Waves}
          iconColor="from-safe-500 to-safe-700"
          trend={shapePassRate >= 0.9 ? 'up' : shapePassRate >= 0.75 ? 'flat' : 'down'}
          trendValue={shapePassRate >= 0.9 ? '良好' : shapePassRate >= 0.75 ? '达标' : '偏低'}
        />
        <DataCard
          title="平均凸度"
          value={formatNumber(avgCrown, 1)}
          unit="μm"
          icon={TrendingUp}
          iconColor="from-steel-500 to-steel-700"
          description="目标 ≤60μm"
        />
        <DataCard
          title="平均楔形"
          value={formatNumber(avgWedge, 1)}
          unit="μm"
          icon={Activity}
          iconColor="from-alert-500 to-alert-700"
          description="目标 ≤25μm"
        />
        <DataCard
          title="平均平直度"
          value={formatNumber(avgFlatness, 1)}
          unit="IU"
          icon={Target}
          iconColor="from-purple-500 to-purple-700"
          description="目标 ≤50IU"
        />
      </div>

      <SectionCard title="终轧温度趋势" subtitle="最近20卷终轧温度波动监控 (目标 830~890℃)" icon={<Thermometer className="w-5 h-5" />}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={tempTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="tempRange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="coilNo"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[800, 950]}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
                label={{ value: '温度(℃)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
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
                formatter={(value: number, name: string) => {
                  const labelMap: Record<string, string> = {
                    actual: '实际温度',
                    target: '目标温度',
                    upper: '上限',
                    lower: '下限',
                  };
                  return [`${value}℃`, labelMap[name] || name];
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '5px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="transparent"
                fill="url(#tempRange)"
                name="允许范围"
              />
              <Line
                type="monotone"
                dataKey="lower"
                stroke="#6b7280"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                name="下限(830℃)"
              />
              <Line
                type="monotone"
                dataKey="upper"
                stroke="#6b7280"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                name="上限(890℃)"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="目标温度"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f97316', stroke: '#1f2937', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name="实际温度"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="带钢厚度检测" subtitle="最近10卷头/中/尾厚度对比" icon={<Ruler className="w-5 h-5" />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={thicknessData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="coilNo"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: '#374151' }}
                  tickLine={{ stroke: '#374151' }}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                  tickLine={{ stroke: '#374151' }}
                  label={{ value: '厚度(mm)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
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
                  formatter={(value: number, name: string) => {
                    const labelMap: Record<string, string> = {
                      head: '头部厚度',
                      mid: '中部厚度',
                      tail: '尾部厚度',
                      target: '目标厚度',
                    };
                    return [`${value.toFixed(3)}mm`, labelMap[name] || name];
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '5px' }}
                  iconType="circle"
                />
                <ReferenceLine
                  y={thicknessData.length > 0 ? thicknessData.reduce((s, d) => s + d.target, 0) / thicknessData.length : 0}
                  stroke="#fbbf24"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{ value: '目标厚度参考', fill: '#fbbf24', fontSize: 11, position: 'right' }}
                />
                <Bar dataKey="head" name="头部厚度" fill="#60a5fa" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="mid" name="中部厚度" fill="#34d399" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="tail" name="尾部厚度" fill="#f472b6" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="板形凸度监控" subtitle="凸度、楔形、平直度实时指标" icon={<Waves className="w-5 h-5" />}>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-gray-400 text-xs mb-2">凸度</div>
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={crownPercent <= 75 ? '#34d399' : crownPercent <= 90 ? '#fbbf24' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${crownPercent * 2.51} 251`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white font-numeric">
                    {latestRecord ? latestRecord.crown : '--'}
                  </span>
                  <span className="text-xs text-gray-500">μm</span>
                </div>
              </div>
              <div className="mt-2 text-xs">
                {crownPercent <= 75 ? (
                  <span className="text-safe-400">✓ 正常</span>
                ) : crownPercent <= 90 ? (
                  <span className="text-warm-400">⚠ 临界</span>
                ) : (
                  <span className="text-alert-400">✗ 超标</span>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-gray-400 text-xs mb-2">楔形</div>
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={wedgePercent <= 62 ? '#34d399' : wedgePercent <= 87 ? '#fbbf24' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${wedgePercent * 2.51} 251`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white font-numeric">
                    {latestRecord ? latestRecord.wedge : '--'}
                  </span>
                  <span className="text-xs text-gray-500">μm</span>
                </div>
              </div>
              <div className="mt-2 text-xs">
                {wedgePercent <= 62 ? (
                  <span className="text-safe-400">✓ 正常</span>
                ) : wedgePercent <= 87 ? (
                  <span className="text-warm-400">⚠ 临界</span>
                ) : (
                  <span className="text-alert-400">✗ 超标</span>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-gray-400 text-xs mb-2">平直度</div>
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={flatnessPercent <= 62 ? '#34d399' : flatnessPercent <= 81 ? '#fbbf24' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${flatnessPercent * 2.51} 251`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white font-numeric">
                    {latestRecord ? latestRecord.flatness : '--'}
                  </span>
                  <span className="text-xs text-gray-500">IU</span>
                </div>
              </div>
              <div className="mt-2 text-xs">
                {flatnessPercent <= 62 ? (
                  <span className="text-safe-400">✓ 正常</span>
                ) : flatnessPercent <= 81 ? (
                  <span className="text-warm-400">⚠ 临界</span>
                ) : (
                  <span className="text-alert-400">✗ 超标</span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-700">
                  <th className="pb-3 font-medium">钢卷号</th>
                  <th className="pb-3 font-medium">凸度(μm)</th>
                  <th className="pb-3 font-medium">楔形(μm)</th>
                  <th className="pb-3 font-medium">平直度(IU)</th>
                  <th className="pb-3 font-medium">判定</th>
                </tr>
              </thead>
              <tbody>
                {records.slice().reverse().slice(0, 10).map((record) => {
                  const status = getShapeStatus(record);
                  return (
                    <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2.5 pr-4 text-white font-mono text-xs">{getCoilNo(record.slabNo)}</td>
                      <td className="py-2.5 pr-4 text-gray-300 font-numeric">{formatNumber(record.crown, 1)}</td>
                      <td className="py-2.5 pr-4 text-gray-300 font-numeric">{formatNumber(record.wedge, 1)}</td>
                      <td className="py-2.5 pr-4 text-gray-300 font-numeric">{formatNumber(record.flatness, 1)}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge
                          status={status === 'normal' ? 'normal' : status === 'warning' ? 'warning' : 'abnormal'}
                          label={getShapeLabel(status)}
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="精轧参数总表" subtitle="精轧机组综合工艺参数与质量判定" icon={<Gauge className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 font-medium">板坯号/钢卷号</th>
                <th className="pb-3 font-medium">终轧温度(℃)</th>
                <th className="pb-3 font-medium">头厚(mm)</th>
                <th className="pb-3 font-medium">中厚(mm)</th>
                <th className="pb-3 font-medium">尾厚(mm)</th>
                <th className="pb-3 font-medium">凸度(μm)</th>
                <th className="pb-3 font-medium">楔形(μm)</th>
                <th className="pb-3 font-medium">平直度(IU)</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const tempOk = record.finishingTemp >= 830 && record.finishingTemp <= 890;
                const thicknessOk = Math.abs(record.headThickness - record.midThickness) <= record.midThickness * 0.015
                  && Math.abs(record.tailThickness - record.midThickness) <= record.midThickness * 0.015;
                const shapeOk = record.crown <= 60 && record.wedge <= 25 && record.flatness <= 50;
                const overallOk = tempOk && thicknessOk && shapeOk;
                return (
                  <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 pr-4">
                      <div className="text-white font-mono text-xs">{record.slabNo}</div>
                      <div className="text-data-400 font-mono text-xs mt-0.5">{getCoilNo(record.slabNo)}</div>
                    </td>
                    <td className={`py-3 pr-4 font-numeric font-medium ${tempOk ? 'text-warm-400' : 'text-alert-400'}`}>
                      {formatTemperature(record.finishingTemp)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 font-numeric">{formatThickness(record.headThickness)}</td>
                    <td className="py-3 pr-4 text-safe-400 font-numeric font-medium">{formatThickness(record.midThickness)}</td>
                    <td className="py-3 pr-4 text-gray-300 font-numeric">{formatThickness(record.tailThickness)}</td>
                    <td className={`py-3 pr-4 font-numeric ${record.crown <= 60 ? 'text-gray-300' : 'text-alert-400'}`}>
                      {formatNumber(record.crown, 1)}
                    </td>
                    <td className={`py-3 pr-4 font-numeric ${record.wedge <= 25 ? 'text-gray-300' : 'text-alert-400'}`}>
                      {formatNumber(record.wedge, 1)}
                    </td>
                    <td className={`py-3 pr-4 font-numeric ${record.flatness <= 50 ? 'text-gray-300' : 'text-alert-400'}`}>
                      {formatNumber(record.flatness, 1)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge
                        status={overallOk ? 'normal' : 'abnormal'}
                        label={overallOk ? '合格' : '异常'}
                        size="sm"
                      />
                    </td>
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
