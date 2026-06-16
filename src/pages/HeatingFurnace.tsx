import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Search, RotateCcw, CheckSquare, Square, X, GitCompare, XCircle, Info } from 'lucide-react';
import SectionCard from '@/components/common/SectionCard';
import StatusBadge from '@/components/common/StatusBadge';
import DataCard from '@/components/common/DataCard';
import {
  Flame,
  ThermometerSun,
  Clock,
  Layers,
  Activity,
  Play,
  Pause,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  formatTemperature,
  formatDateTime,
  formatDuration,
} from '@/utils/format';
import type { HeatingRecord } from '@/types';

const DISCHARGE_TEMP_LIMIT = 1260;

const heatingCurveData = [
  { time: 0, preheat: 600, heating: 600, soaking: 600 },
  { time: 10, preheat: 720, heating: 680, soaking: 620 },
  { time: 20, preheat: 810, heating: 760, soaking: 650 },
  { time: 30, preheat: 850, heating: 850, soaking: 700 },
  { time: 40, preheat: 860, heating: 960, soaking: 780 },
  { time: 50, preheat: 855, heating: 1080, soaking: 880 },
  { time: 60, preheat: 850, heating: 1180, soaking: 1000 },
  { time: 70, preheat: 845, heating: 1200, soaking: 1120 },
  { time: 80, preheat: 840, heating: 1205, soaking: 1200 },
  { time: 90, preheat: 835, heating: 1200, soaking: 1245 },
  { time: 100, preheat: 830, heating: 1195, soaking: 1250 },
  { time: 110, preheat: 825, heating: 1190, soaking: 1252 },
  { time: 120, preheat: 820, heating: 1185, soaking: 1250 },
];

interface FurnaceInfo {
  no: string;
  name: string;
  status: 'running' | 'paused';
  currentTemp: number;
  slabCount: number;
  runHours: number;
}

export default function HeatingFurnace() {
  const navigate = useNavigate();
  const {
    heatingRecords,
    slabs,
    setCurrentSlabNo,
    currentSlabNo,
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

  const [filterSlabNo, setFilterSlabNo] = useState('');
  const [filterSteelGrade, setFilterSteelGrade] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterFurnaceNo, setFilterFurnaceNo] = useState('');

  const steelGrades = useMemo(() => {
    const grades = new Set(slabs.map((s) => s.steelGrade));
    return Array.from(grades).sort();
  }, [slabs]);

  const furnaceOptions = ['加热炉1号', '加热炉2号', '加热炉3号'];

  const filteredHeatingRecords = useMemo(() => {
    return heatingRecords.filter((record) => {
      if (filterSlabNo && !record.slabNo.toLowerCase().includes(filterSlabNo.toLowerCase())) {
        return false;
      }

      if (filterFurnaceNo && record.furnaceNo !== filterFurnaceNo) {
        return false;
      }

      if (filterStartDate) {
        const recordDate = new Date(record.inTime).toISOString().split('T')[0];
        if (recordDate < filterStartDate) {
          return false;
        }
      }

      if (filterEndDate) {
        const recordDate = new Date(record.inTime).toISOString().split('T')[0];
        if (recordDate > filterEndDate) {
          return false;
        }
      }

      if (filterSteelGrade) {
        const slab = slabs.find((s) => s.slabNo === record.slabNo);
        if (!slab || slab.steelGrade !== filterSteelGrade) {
          return false;
        }
      }

      return true;
    });
  }, [heatingRecords, slabs, filterSlabNo, filterSteelGrade, filterStartDate, filterEndDate, filterFurnaceNo]);

  const handleResetFilters = () => {
    setFilterSlabNo('');
    setFilterSteelGrade('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterFurnaceNo('');
  };

  const handleClearSelection = () => {
    setFilterSlabNo('');
    setFilterSteelGrade('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterFurnaceNo('');
    clearCurrentSelection();
  };

  const furnaceInfoList: FurnaceInfo[] = useMemo(() => {
    const inFurnaceRecords = filteredHeatingRecords.filter((r) => !r.outTime);

    const furnaces: FurnaceInfo[] = [
      {
        no: 'F1',
        name: '加热炉1号',
        status: 'running',
        currentTemp: 1235,
        slabCount: 0,
        runHours: 146.5,
      },
      {
        no: 'F2',
        name: '加热炉2号',
        status: 'running',
        currentTemp: 1218,
        slabCount: 0,
        runHours: 98.2,
      },
      {
        no: 'F3',
        name: '加热炉3号',
        status: 'paused',
        currentTemp: 850,
        slabCount: 0,
        runHours: 203.8,
      },
    ];

    inFurnaceRecords.forEach((record) => {
      const furnace = furnaces.find((f) => f.name === record.furnaceNo);
      if (furnace) {
        furnace.slabCount++;
      }
    });

    return furnaces;
  }, [filteredHeatingRecords]);

  const inFurnaceSlabs = useMemo(() => {
    const inFurnaceRecords = filteredHeatingRecords.filter((r) => !r.outTime);
    return inFurnaceRecords
      .map((record) => {
        const slab = slabs.find((s) => s.slabNo === record.slabNo);
        const totalDuration = 120;
        const progress = Math.min(100, (record.heatingDuration / totalDuration) * 100);
        const inTime = new Date(record.inTime);
        const estOutTime = new Date(inTime.getTime() + totalDuration * 60 * 1000);
        const positions = ['预热段', '加热段', '均热段'];
        const positionIndex = Math.min(2, Math.floor(progress / 35));
        return {
          record,
          slab,
          progress,
          estOutTime,
          position: positions[positionIndex],
        };
      })
      .filter((item) => item.slab);
  }, [filteredHeatingRecords, slabs]);

  const sortedDischargeRecords = useMemo(() => {
    return [...filteredHeatingRecords]
      .filter((r) => r.outTime)
      .sort((a, b) => new Date(b.outTime!).getTime() - new Date(a.outTime!).getTime());
  }, [filteredHeatingRecords]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="w-7 h-7 text-[#e86a2c]" />
        <div>
          <h1 className="text-2xl font-bold text-white">加热炉管理</h1>
          <p className="text-gray-400 text-sm">加热炉运行监控与板坯加热过程管理</p>
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

      <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">板坯号搜索</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={filterSlabNo}
                onChange={(e) => setFilterSlabNo(e.target.value)}
                placeholder="输入板坯号..."
                className="w-full pl-8 pr-3 py-2 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e86a2c] focus:ring-1 focus:ring-[#e86a2c]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">钢种筛选</label>
            <select
              value={filterSteelGrade}
              onChange={(e) => setFilterSteelGrade(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] focus:ring-1 focus:ring-[#e86a2c]/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="">全部钢种</option>
              {steelGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">开始日期</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] focus:ring-1 focus:ring-[#e86a2c]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">结束日期</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] focus:ring-1 focus:ring-[#e86a2c]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">炉号筛选</label>
            <select
              value={filterFurnaceNo}
              onChange={(e) => setFilterFurnaceNo(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] focus:ring-1 focus:ring-[#e86a2c]/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="">全部炉号</option>
              {furnaceOptions.map((furnace) => (
                <option key={furnace} value={furnace}>
                  {furnace}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleResetFilters}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-700 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-600 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置筛选
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {furnaceInfoList.map((furnace) => (
          <div
            key={furnace.no}
            className={`bg-[#1e293b] border rounded-lg p-5 transition-colors ${
              furnace.status === 'running' ? 'border-gray-700 hover:border-[#e86a2c]/50' : 'border-gray-800'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                    furnace.status === 'running'
                      ? 'bg-gradient-to-br from-[#e86a2c] to-red-700'
                      : 'bg-gray-700'
                  }`}
                >
                  <Flame className={`w-6 h-6 ${furnace.status === 'running' ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="text-white font-semibold">{furnace.name}</div>
                  <div className="text-xs text-gray-500 font-mono">NO.{furnace.no}</div>
                </div>
              </div>
              <StatusBadge
                status={furnace.status}
                label={furnace.status === 'running' ? '运行中' : '待机'}
                showIcon={false}
                size="sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0f172a] rounded-md p-3 border border-gray-700/50">
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                  <ThermometerSun className="w-3.5 h-3.5" />
                  当前温度
                </div>
                <div
                  className={`text-lg font-bold font-mono ${
                    furnace.status === 'running' ? 'text-[#e86a2c]' : 'text-gray-400'
                  }`}
                >
                  {formatTemperature(furnace.currentTemp)}
                </div>
              </div>
              <div className="bg-[#0f172a] rounded-md p-3 border border-gray-700/50">
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  在炉板坯
                </div>
                <div className="text-lg font-bold text-white font-mono">{furnace.slabCount} 块</div>
              </div>
              <div className="bg-[#0f172a] rounded-md p-3 border border-gray-700/50">
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  运行时长
                </div>
                <div className="text-lg font-bold text-white font-mono">{furnace.runHours}h</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                className={`flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-md text-sm font-medium transition-colors ${
                  furnace.status === 'running'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-[#2ea043] text-white hover:bg-[#278a39]'
                }`}
              >
                {furnace.status === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    启动
                  </>
                )}
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors">
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SectionCard
            title="炉温制度曲线"
            subtitle="标准加热工艺：预热段 → 加热段 → 均热段"
            icon={<ThermometerSun className="w-5 h-5" />}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={heatingCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPreheat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorHeating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e86a2c" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#e86a2c" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorSoaking" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#475569' }}
                    axisLine={{ stroke: '#475569' }}
                    label={{ value: '时间 (分钟)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[600, 1350]}
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#475569' }}
                    axisLine={{ stroke: '#475569' }}
                    label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#fff',
                    }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    formatter={(value: number) => [`${value}℃`]}
                    labelFormatter={(label) => `时间: ${label} 分钟`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '12px' }}>{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="preheat"
                    name="预热段温度"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPreheat)"
                  />
                  <Area
                    type="monotone"
                    dataKey="heating"
                    name="加热段温度"
                    stroke="#e86a2c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHeating)"
                  />
                  <Area
                    type="monotone"
                    dataKey="soaking"
                    name="均热段温度"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSoaking)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <DataCard
              title="在炉板坯"
              value={inFurnaceSlabs.length}
              unit="块"
              icon={Layers}
              iconColor="from-[#e86a2c] to-red-700"
            />
            <DataCard
              title="今日出炉"
              value={sortedDischargeRecords.length}
              unit="块"
              icon={Flame}
              iconColor="from-[#2ea043] to-green-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DataCard
              title="平均加热时长"
              value={
                filteredHeatingRecords.length > 0
                  ? Math.round(
                      filteredHeatingRecords.reduce((sum, r) => sum + r.heatingDuration, 0) /
                        filteredHeatingRecords.length
                    )
                  : 0
              }
              unit="分钟"
              icon={Clock}
              iconColor="from-blue-500 to-blue-700"
            />
            <DataCard
              title="平均出炉温度"
              value={
                sortedDischargeRecords.length > 0
                  ? Math.round(
                      sortedDischargeRecords.reduce((sum, r) => sum + r.dischargeTemp, 0) /
                        sortedDischargeRecords.length
                    )
                  : 0
              }
              unit="℃"
              icon={ThermometerSun}
              iconColor="from-amber-500 to-amber-700"
            />
          </div>
        </div>
      </div>

      <SectionCard
        title="出炉温度记录"
        subtitle={`超限阈值: ${DISCHARGE_TEMP_LIMIT}℃`}
        icon={<AlertTriangle className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 w-10 font-medium">
                  <span className="sr-only">对比</span>
                </th>
                <th className="pb-3 font-medium whitespace-nowrap">板坯号</th>
                <th className="pb-3 font-medium whitespace-nowrap">炉号</th>
                <th className="pb-3 font-medium whitespace-nowrap">预热段</th>
                <th className="pb-3 font-medium whitespace-nowrap">加热段</th>
                <th className="pb-3 font-medium whitespace-nowrap">均热段</th>
                <th className="pb-3 font-medium whitespace-nowrap">出炉温度</th>
                <th className="pb-3 font-medium whitespace-nowrap">入炉时间</th>
                <th className="pb-3 font-medium whitespace-nowrap">出炉时间</th>
                <th className="pb-3 font-medium whitespace-nowrap">加热时长</th>
                <th className="pb-3 font-medium whitespace-nowrap">状态</th>
              </tr>
            </thead>
            <tbody>
              {sortedDischargeRecords.slice(0, 8).map((record: HeatingRecord, index: number) => {
                const isOverLimit = record.dischargeTemp > DISCHARGE_TEMP_LIMIT;
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
                    <td className="py-3 pr-4 text-white font-mono whitespace-nowrap">{record.slabNo}</td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{record.furnaceNo}</td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{record.preheatTemp}℃</td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{record.heatingTemp}℃</td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{record.soakingTemp}℃</td>
                    <td
                      className={`py-3 pr-4 font-medium whitespace-nowrap ${
                        isOverLimit ? 'text-red-400 bg-red-500/10' : 'text-[#e86a2c]'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isOverLimit && <AlertTriangle className="w-3.5 h-3.5" />}
                        {record.dischargeTemp}℃
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap font-mono text-xs">
                      {formatDateTime(record.inTime)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap font-mono text-xs">
                      {formatDateTime(record.outTime)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {formatDuration(record.heatingDuration)}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <StatusBadge
                        status={isOverLimit ? 'warning' : 'normal'}
                        label={isOverLimit ? '温度超限' : '正常'}
                        size="sm"
                        showIcon={false}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="当前在炉板坯"
        subtitle={`共 ${inFurnaceSlabs.length} 块板坯正在加热`}
        icon={<Flame className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-3 w-10 font-medium">
                  <span className="sr-only">对比</span>
                </th>
                <th className="pb-3 font-medium whitespace-nowrap">板坯号</th>
                <th className="pb-3 font-medium whitespace-nowrap">钢种</th>
                <th className="pb-3 font-medium whitespace-nowrap">炉号</th>
                <th className="pb-3 font-medium whitespace-nowrap">入炉时间</th>
                <th className="pb-3 font-medium whitespace-nowrap">当前位置</th>
                <th className="pb-3 font-medium whitespace-nowrap">已加热时长</th>
                <th className="pb-3 font-medium whitespace-nowrap">预计出炉时间</th>
                <th className="pb-3 font-medium whitespace-nowrap min-w-[180px]">加热进度</th>
              </tr>
            </thead>
            <tbody>
              {inFurnaceSlabs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <Flame className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>当前无在炉板坯</p>
                  </td>
                </tr>
              ) : (
                inFurnaceSlabs.map((item) => {
                  const isSelected = currentSlabNo === item.record.slabNo;
                  const isInCompare = compareSlabNos.includes(item.record.slabNo);
                  return (
                    <tr
                      key={item.record.id}
                      onClick={() => setCurrentSlabNo(item.record.slabNo)}
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
                            toggleCompareSlab(item.record.slabNo);
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
                      <td className="py-3 pr-4 text-white font-mono whitespace-nowrap">
                        {item.record.slabNo}
                      </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {item.slab?.steelGrade}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {item.record.furnaceNo}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap font-mono text-xs">
                      {formatDateTime(item.record.inTime)}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          item.position === '预热段'
                            ? 'bg-amber-500/15 text-amber-400'
                            : item.position === '加热段'
                            ? 'bg-[#e86a2c]/15 text-[#e86a2c]'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {item.position}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                      {formatDuration(item.record.heatingDuration)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 whitespace-nowrap font-mono text-xs">
                      {formatDateTime(item.estOutTime)}
                    </td>
                    <td className="py-3 pr-4 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#e86a2c] to-red-500 transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-mono w-10 text-right">
                          {Math.round(item.progress)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
