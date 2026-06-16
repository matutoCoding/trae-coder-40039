import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import DataCard from '@/components/common/DataCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  ChevronDown,
} from 'lucide-react';
import type { CoolingRecord } from '@/types';
import {
  formatCoolingRate,
  formatFlow,
  formatTemperature,
  formatNumber,
} from '@/utils/format';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

type CoolingMode = '前段冷却' | '后段冷却' | '均匀冷却';

export default function LaminarCooling() {
  const { coolingRecords, currentSlabNo, getEntitiesBySlabNo, coilingRecords } = useStore();
  const [coolingMode, setCoolingMode] = useState<CoolingMode>('均匀冷却');

  const records: CoolingRecord[] = useMemo(
    () =>
      currentSlabNo
        ? (getEntitiesBySlabNo('coolingRecords', currentSlabNo) as CoolingRecord[])
        : coolingRecords,
    [coolingRecords, currentSlabNo, getEntitiesBySlabNo]
  );

  const avgCoolingRate = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.coolingRate, 0) / records.length;
  }, [records]);

  const qualifiedRate = useMemo(() => {
    if (records.length === 0) return 0;
    const qualified = records.filter((r) => {
      const deviation = Math.abs(r.preCoolingTemp - r.postCoolingTemp - 240);
      return deviation <= 30;
    }).length;
    return (qualified / records.length) * 100;
  }, [records]);

  const avgWaterVolume = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.waterVolume, 0) / records.length;
  }, [records]);

  const avgTempDeviation = useMemo(() => {
    if (records.length === 0) return 0;
    const deviations = records.map((r) => Math.abs(r.preCoolingTemp - r.postCoolingTemp - 240));
    return deviations.reduce((a, b) => a + b, 0) / deviations.length;
  }, [records]);

  const headersData = useMemo(() => {
    const headers: { id: number; on: boolean; percentage: number }[] = [];
    for (let i = 1; i <= 10; i++) {
      let on = false;
      let percentage = 0;
      if (coolingMode === '前段冷却') {
        on = i <= 6;
        percentage = on ? Math.round(60 + (7 - i) * 6) : 0;
      } else if (coolingMode === '后段冷却') {
        on = i >= 5;
        percentage = on ? Math.round(40 + (i - 4) * 10) : 0;
      } else {
        on = true;
        percentage = 65 + Math.round(Math.sin(i * 0.8) * 15);
      }
      headers.push({ id: i, on, percentage });
    }
    return headers;
  }, [coolingMode]);

  const temperatureData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= 100; i += 5) {
      const t = i / 100;
      const actualTemp = 870 - 250 * Math.pow(t, 0.85) + (Math.sin(i * 0.3) * 8);
      const targetTemp = 870 - 260 * t;
      data.push({
        distance: i,
        actual: Math.round(actualTemp),
        target: Math.round(targetTemp),
      });
    }
    return data;
  }, []);

  const latestRecord = records[records.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Wind className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">层流冷却</h1>
          <p className="text-gray-400 text-sm">层流冷却工艺参数实时监控与集管控制</p>
        </div>
      </div>

      {currentSlabNo && (
        <div className="text-sm text-gray-400">
          当前板坯: <span className="text-orange-400 font-mono">{currentSlabNo}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard
          title="平均冷却速率"
          value={formatNumber(avgCoolingRate, 1)}
          unit="℃/s"
          icon={Gauge}
          iconColor="from-orange-500 to-red-500"
          description="工艺目标: 25~35℃/s"
        />
        <DataCard
          title="冷却合格率"
          value={formatNumber(qualifiedRate, 1)}
          unit="%"
          icon={Thermometer}
          iconColor="from-green-500 to-emerald-600"
          description={`共 ${records.length} 卷记录`}
        />
        <DataCard
          title="平均水量"
          value={formatNumber(avgWaterVolume, 0)}
          unit="m³/h"
          icon={Droplets}
          iconColor="from-blue-500 to-cyan-600"
          description="集管总流量"
        />
        <DataCard
          title="温度偏差"
          value={formatNumber(avgTempDeviation, 1)}
          unit="℃"
          icon={Thermometer}
          iconColor="from-amber-500 to-orange-600"
          description="目标冷却温差 240℃"
        />
      </div>

      <SectionCard
        title="层流冷却集管布置"
        subtitle="10组冷却集管开关状态与水量分布"
        icon={<Wind className="w-5 h-5" />}
        actions={
          <div className="relative">
            <select
              value={coolingMode}
              onChange={(e) => setCoolingMode(e.target.value as CoolingMode)}
              className="appearance-none bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-orange-500"
            >
              <option value="前段冷却">前段冷却</option>
              <option value="后段冷却">后段冷却</option>
              <option value="均匀冷却">均匀冷却</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-end gap-2 h-36">
            {headersData.map((header) => (
              <div key={header.id} className="flex-1 flex flex-col items-center gap-2">
                <span
                  className={`text-xs font-mono font-medium ${
                    header.on ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  {header.percentage}%
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      header.on
                        ? 'bg-gradient-to-t from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                        : 'bg-gray-700'
                    }`}
                    style={{ height: `${header.on ? header.percentage : 15}%` }}
                  />
                </div>
                <div
                  className={`w-full h-2 rounded ${
                    header.on ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                />
                <span className="text-xs text-gray-400 font-mono">#{header.id}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                <span className="text-sm text-gray-300">开启</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-700" />
                <span className="text-sm text-gray-300">关闭</span>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              当前模式: <span className="text-orange-400 font-medium">{coolingMode}</span>
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="温度监控曲线"
        subtitle="冷却过程温度变化实时追踪"
        icon={<Thermometer className="w-5 h-5" />}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temperatureData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e86a2c" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#e86a2c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="distance"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                label={{ value: '冷却距离 (m)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                domain={[500, 900]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
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
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#e86a2c"
                strokeWidth={2.5}
                fill="url(#tempGradient)"
                name="实测温度"
                dot={false}
                activeDot={{ r: 5, fill: '#e86a2c', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="目标温度"
              />
              {latestRecord && (
                <>
                  <ReferenceLine
                    x={0}
                    stroke="#2ea043"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: `终轧 ${latestRecord.preCoolingTemp}℃`, position: 'top', fill: '#2ea043', fontSize: 11 }}
                  />
                  <ReferenceDot
                    x={0}
                    y={latestRecord.preCoolingTemp}
                    r={6}
                    fill="#2ea043"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <ReferenceLine
                    x={100}
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: `卷取 ${latestRecord.postCoolingTemp}℃`, position: 'top', fill: '#dc2626', fontSize: 11 }}
                  />
                  <ReferenceDot
                    x={100}
                    y={latestRecord.postCoolingTemp}
                    r={6}
                    fill="#dc2626"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-orange-500" />
            <span className="text-sm text-gray-400">实测温度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-blue-500" style={{ borderStyle: 'dashed' }} />
            <span className="text-sm text-gray-400">目标温度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-400">终轧温度点</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-400">卷取温度点</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="冷却记录"
        subtitle={`共 ${records.length} 条冷却记录`}
        icon={<Droplets className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 font-medium">钢卷号</th>
                <th className="pb-3 font-medium">冷却模式</th>
                <th className="pb-3 font-medium">水量</th>
                <th className="pb-3 font-medium">冷却速率</th>
                <th className="pb-3 font-medium">冷却前温度</th>
                <th className="pb-3 font-medium">冷却后温度</th>
                <th className="pb-3 font-medium">偏差</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const deviation = Math.abs(record.preCoolingTemp - record.postCoolingTemp - 240);
                const isNormal = deviation <= 30;
                const coilRecord = coilingRecords.find((c) => c.slabNo === record.slabNo);
                return (
                  <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 pr-4 text-white font-mono">
                      {coilRecord?.coilNo || record.slabNo}
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{record.coolingMode}</td>
                    <td className="py-3 pr-4 text-blue-400 font-medium">{formatFlow(record.waterVolume)}</td>
                    <td className="py-3 pr-4 text-orange-400 font-medium">{formatCoolingRate(record.coolingRate)}</td>
                    <td className="py-3 pr-4 text-gray-300">{formatTemperature(record.preCoolingTemp)}</td>
                    <td className="py-3 pr-4 text-gray-300">{formatTemperature(record.postCoolingTemp)}</td>
                    <td
                      className={`py-3 pr-4 font-medium ${
                        isNormal ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {isNormal ? '+' : ''}{formatNumber(record.preCoolingTemp - record.postCoolingTemp - 240, 0)}℃
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={isNormal ? 'normal' : 'abnormal'} size="sm" />
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
