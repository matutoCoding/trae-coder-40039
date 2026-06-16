import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import DataCard from '@/components/common/DataCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Package,
  Scale,
  Thermometer,
  Gauge,
  CheckCircle2,
  CircleDot,
  Info,
  CircleAlert,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  CheckSquare,
  Square,
  X,
  GitCompare,
  XCircle,
} from 'lucide-react';
import type { CoilingRecord } from '@/types';
import {
  formatTemperature,
  formatTension,
  formatWeight,
  formatNumber,
  formatDateTime,
} from '@/utils/format';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
  Dot,
} from 'recharts';

export default function Coiling() {
  const {
    coilingRecords,
    currentSlabNo,
    getEntitiesBySlabNo,
    slabs,
    setCurrentSlabNo,
    compareSlabNos,
    toggleCompareSlab,
    clearCompareSlabs,
    clearCurrentSelection,
  } = useStore();

  const [searchCoilNo, setSearchCoilNo] = useState('');
  const [steelGradeFilter, setSteelGradeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const steelGradeOptions = useMemo(() => {
    const grades = [...new Set(slabs.map((s) => s.steelGrade))].sort();
    return [{ value: 'all', label: '全部钢种' }, ...grades.map((g) => ({ value: g, label: g }))];
  }, [slabs]);

  const baseRecords: CoilingRecord[] = useMemo(
    () =>
      currentSlabNo
        ? (getEntitiesBySlabNo('coilingRecords', currentSlabNo) as CoilingRecord[])
        : coilingRecords,
    [coilingRecords, currentSlabNo, getEntitiesBySlabNo]
  );

  const records: CoilingRecord[] = useMemo(() => {
    let list = baseRecords;

    if (searchCoilNo.trim()) {
      const keyword = searchCoilNo.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.coilNo.toLowerCase().includes(keyword) ||
          r.slabNo.toLowerCase().includes(keyword)
      );
    }

    if (steelGradeFilter !== 'all') {
      list = list.filter((r) => {
        const slab = slabs.find((s) => s.slabNo === r.slabNo);
        return slab?.steelGrade === steelGradeFilter;
      });
    }

    if (startDate || endDate) {
      list = list.filter((r) => {
        const slab = slabs.find((s) => s.slabNo === r.slabNo);
        if (!slab?.chargingTime) return true;
        const recordDate = slab.chargingTime.split(' ')[0];
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      });
    }

    return list;
  }, [baseRecords, searchCoilNo, steelGradeFilter, startDate, endDate, slabs]);

  const handleReset = () => {
    setSearchCoilNo('');
    setSteelGradeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const todayCount = records.length;

  const avgCoilingTemp = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.coilingTemp, 0) / records.length;
  }, [records]);

  const avgWeight = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.netWeight, 0) / records.length;
  }, [records]);

  const strappingQualifiedRate = useMemo(() => {
    if (records.length === 0) return 0;
    const qualified = records.filter((r) => r.strappingCount >= 3).length;
    return (qualified / records.length) * 100;
  }, [records]);

  const avgTension = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.coilingTension, 0) / records.length;
  }, [records]);

  const TARGET_TEMP = 620;
  const TEMP_TOLERANCE = 30;

  const tempChartData = useMemo(() => {
    return records.slice(-20).map((r) => {
      const deviation = Math.abs(r.coilingTemp - TARGET_TEMP);
      return {
        coilNo: r.coilNo.slice(-4),
        actual: r.coilingTemp,
        target: TARGET_TEMP,
        upper: TARGET_TEMP + TEMP_TOLERANCE,
        lower: TARGET_TEMP - TEMP_TOLERANCE,
        overLimit: deviation > TEMP_TOLERANCE,
      };
    });
  }, [records]);

  const latestRecord = records[records.length - 1];

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

  const strappingRecords = useMemo(() => {
    return [...records].reverse().slice(0, 6).map((r, idx) => ({
      ...r,
      status: r.strappingCount >= 3 ? '正常' : '异常',
      weighTime: `2026-06-17 ${String(14 + idx).padStart(2, '0')}:${String(10 + idx * 8).padStart(2, '0')}:00`,
    }));
  }, [records]);

  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.overLimit) {
      return (
        <Dot cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#fff" strokeWidth={2} />
      );
    }
    return <Dot cx={cx} cy={cy} r={4} fill="#e86a2c" stroke="#fff" strokeWidth={2} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">卷取打捆</h1>
          <p className="text-gray-400 text-sm">卷取温度控制、打捆称重与钢卷参数管理</p>
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
              onClick={clearCurrentSelection}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              清除选择
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 p-4 bg-[#1e293b] border border-gray-700 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="板坯号/钢卷号搜索..."
            value={searchCoilNo}
            onChange={(e) => setSearchCoilNo(e.target.value)}
            className="w-56 h-9 pl-9 pr-3 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e86a2c] transition-colors"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={steelGradeFilter}
            onChange={(e) => setSteelGradeFilter(e.target.value)}
            className="w-40 h-9 pl-9 pr-8 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] transition-colors appearance-none cursor-pointer"
          >
            {steelGradeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 px-3 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] transition-colors"
          />
          <span className="text-gray-500">至</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 px-3 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] transition-colors"
          />
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium rounded-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>

        <div className="ml-auto text-xs text-gray-500">
          共 <span className="text-orange-400 font-medium">{records.length}</span> 条记录
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <DataCard
          title="今日卷数"
          value={todayCount}
          unit="卷"
          icon={Package}
          iconColor="from-orange-500 to-red-500"
        />
        <DataCard
          title="平均卷取温度"
          value={formatNumber(avgCoilingTemp, 0)}
          unit="℃"
          icon={Thermometer}
          iconColor="from-amber-500 to-orange-600"
          description={`目标 ${TARGET_TEMP}℃`}
        />
        <DataCard
          title="平均重量"
          value={formatNumber(avgWeight, 2)}
          unit="t"
          icon={Scale}
          iconColor="from-blue-500 to-cyan-600"
        />
        <DataCard
          title="打捆合格率"
          value={formatNumber(strappingQualifiedRate, 1)}
          unit="%"
          icon={CheckCircle2}
          iconColor="from-green-500 to-emerald-600"
          description={`共 ${records.length} 卷记录`}
        />
        <DataCard
          title="平均张力"
          value={formatNumber(avgTension, 0)}
          unit="kN"
          icon={Gauge}
          iconColor="from-purple-500 to-indigo-600"
        />
      </div>

      <SectionCard
        title="卷取温度控制"
        subtitle={`最近 ${tempChartData.length} 卷卷取温度趋势（目标 ${TARGET_TEMP}℃ ±${TEMP_TOLERANCE}℃）`}
        icon={<Thermometer className="w-5 h-5" />}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="toleranceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ea043" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#2ea043" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="coilNo"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                label={{ value: '钢卷号', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                domain={[540, 700]}
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
                formatter={(value: any, name: string) => {
                  const names: Record<string, string> = {
                    actual: '实际温度',
                    target: '目标温度',
                  };
                  return [`${value}℃`, names[name] || name];
                }}
              />
              <Legend
                wrapperStyle={{ color: '#94a3b8' }}
                formatter={(value: string) => {
                const map: Record<string, string> = {
                  actual: '实际温度',
                  target: '目标温度',
                  upper: '公差上限',
                  lower: '公差下限',
                };
                return <span className="text-xs text-gray-400">{map[value] || value}</span>;
              }}
              />
              <ReferenceArea
                y1={TARGET_TEMP - TEMP_TOLERANCE}
                y2={TARGET_TEMP + TEMP_TOLERANCE}
                fill="url(#toleranceBand)"
                stroke="none"
              />
              <ReferenceLine
                y={TARGET_TEMP + TEMP_TOLERANCE}
                stroke="#2ea043"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <ReferenceLine
                y={TARGET_TEMP - TEMP_TOLERANCE}
                stroke="#2ea043"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="target"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#e86a2c"
                strokeWidth={2.5}
                dot={renderDot}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-gray-400">正常</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-400">超限</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-blue-500" style={{ borderStyle: 'dashed' }} />
            <span className="text-sm text-gray-400">目标温度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-green-500/30" />
            <span className="text-sm text-gray-400">公差带</span>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="称重仪表"
          subtitle="实时重量显示"
          icon={<Scale className="w-5 h-5" />}
          className="lg:col-span-1"
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 w-full">
                <div className="text-gray-400 text-sm text-center mb-2">当前称重</div>
                <div className="text-center">
                  <span className="text-6xl font-bold text-orange-400 font-mono tracking-tight">
                    {latestRecord ? formatNumber(latestRecord.grossWeight, 3) : '--'}
                  </span>
                  <span className="text-2xl text-gray-400 ml-2">t</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">净重</span>
                    <span className="text-white font-mono">
                      {latestRecord ? formatWeight(latestRecord.netWeight) : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-400">皮重</span>
                    <span className="text-gray-300 font-mono">
                      {latestRecord ? formatWeight(latestRecord.grossWeight - latestRecord.netWeight) : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">状态</span>
                      <StatusBadge status="normal" size="sm" showIcon={false} />
                    </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-300 font-medium mb-1">钢卷编号规则</div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      JC + 年月日(6位) + 流水号(3位)
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      例: JC240617001
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="最近打捆记录"
          subtitle={`共 ${strappingRecords.length} 条记录`}
          icon={<CircleDot className="w-5 h-5" />}
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-700">
                  <th className="pb-3 font-medium">钢卷号</th>
                  <th className="pb-3 font-medium">打捆道次</th>
                  <th className="pb-3 font-medium">净重</th>
                  <th className="pb-3 font-medium">毛重</th>
                  <th className="pb-3 font-medium">包装状态</th>
                  <th className="pb-3 font-medium">称重时间</th>
                </tr>
              </thead>
              <tbody>
                {strappingRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 pr-4 text-orange-400 font-mono font-medium">{record.coilNo}</td>
                    <td className="py-3 pr-4 text-gray-300">{record.strappingCount} 道</td>
                    <td className="py-3 pr-4 text-blue-400 font-medium">{formatWeight(record.netWeight)}</td>
                    <td className="py-3 pr-4 text-white font-medium">{formatWeight(record.grossWeight)}</td>
                    <td className="py-3 pr-4">
                      {record.status === '正常' ? (
                        <StatusBadge status="normal" size="sm" label="已完成" />
                      ) : (
                        <StatusBadge status="warning" size="sm" label="待复检" />
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{record.weighTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="卷取参数"
        subtitle={`共 ${records.length} 条卷取记录`}
        icon={<Package className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 w-10 font-medium">
                  <span className="sr-only">对比</span>
                </th>
                <th className="pb-3 font-medium">钢卷号</th>
                <th className="pb-3 font-medium">板坯号</th>
                <th className="pb-3 font-medium">卷取温度</th>
                <th className="pb-3 font-medium">卷取张力</th>
                <th className="pb-3 font-medium">卷筒直径</th>
                <th className="pb-3 font-medium">打捆道次</th>
                <th className="pb-3 font-medium">净重</th>
                <th className="pb-3 font-medium">毛重</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const deviation = Math.abs(record.coilingTemp - TARGET_TEMP);
                const isNormal = deviation <= TEMP_TOLERANCE;
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
                    <td className="py-3 pr-4 text-orange-400 font-mono font-medium">{record.coilNo}</td>
                    <td className="py-3 pr-4 text-white font-mono">{record.slabNo}</td>
                    <td
                      className={`py-3 pr-4 font-medium ${
                        isNormal ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatTemperature(record.coilingTemp)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{formatTension(record.coilingTension)}</td>
                    <td className="py-3 pr-4 text-gray-300">{record.drumDiameter} mm</td>
                    <td className="py-3 pr-4 text-gray-300">{record.strappingCount} 道</td>
                    <td className="py-3 pr-4 text-blue-400 font-medium">{formatWeight(record.netWeight)}</td>
                    <td className="py-3 pr-4 text-white font-medium">{formatWeight(record.grossWeight)}</td>
                    <td className="py-3 pr-4">
                      {isNormal ? (
                        <StatusBadge status="normal" size="sm" />
                      ) : (
                        <StatusBadge status="warning" size="sm" label="温度超限" />
                      )}
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
