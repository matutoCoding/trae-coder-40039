import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import DataCard from '@/components/common/DataCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  LayoutDashboard,
  Factory,
  CheckCircle2,
  Cpu,
  Boxes,
  Flame,
  Thermometer,
  Wind,
  ClipboardList,
  Activity,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  formatTemperature,
  formatThickness,
  formatNumber,
  formatDuration,
  formatInspectionResult,
} from '@/utils/format';
import type { TrendDirection } from '@/components/common/DataCard';
import type { StatusType } from '@/components/common/StatusBadge';

const TREND_COLORS = {
  orange: '#e86a2c',
  green: '#2ea043',
  red: '#dc2626',
  blue: '#3b82f6',
};

interface TrendData {
  time: string;
  discharge: number;
  finishing: number;
  coiling: number;
}

interface ProcessStep {
  name: string;
  slabNo: string;
  progress: number;
  status: StatusType;
}

interface Equipment {
  name: string;
  status: 'running' | 'paused' | 'warning';
  runHours: number;
}

function generateTemperatureData(): TrendData[] {
  const data: TrendData[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0');
    data.push({
      time: `${hour}:00`,
      discharge: 1200 + Math.random() * 60 - 30,
      finishing: 850 + Math.random() * 40 - 20,
      coiling: 610 + Math.random() * 50 - 25,
    });
  }
  return data;
}

const processSteps: ProcessStep[] = [
  { name: '板坯入炉', slabNo: 'PB240617012', progress: 25, status: 'running' },
  { name: '加热炉', slabNo: 'PB240617011', progress: 72, status: 'running' },
  { name: '粗轧除鳞', slabNo: 'PB240617010', progress: 45, status: 'running' },
  { name: '精轧机组', slabNo: 'PB240617009', progress: 88, status: 'running' },
  { name: '层流冷却', slabNo: 'PB240617008', progress: 60, status: 'running' },
  { name: '卷取打捆', slabNo: 'PB240617007', progress: 95, status: 'running' },
  { name: '性能检验', slabNo: 'PB240617006', progress: 30, status: 'pending' },
];

const equipmentList: Equipment[] = [
  { name: '加热炉1号', status: 'running', runHours: 8640 },
  { name: '加热炉2号', status: 'running', runHours: 7820 },
  { name: '粗轧机R1', status: 'running', runHours: 9250 },
  { name: '粗轧机R2', status: 'running', runHours: 8900 },
  { name: '精轧机F1', status: 'running', runHours: 7680 },
  { name: '精轧机F2', status: 'running', runHours: 7680 },
  { name: '精轧机F3', status: 'running', runHours: 7680 },
  { name: '精轧机F4', status: 'paused', runHours: 7680 },
  { name: '精轧机F5', status: 'running', runHours: 7680 },
  { name: '精轧机F6', status: 'running', runHours: 7680 },
  { name: '精轧机F7', status: 'running', runHours: 7680 },
  { name: '卷取机1号', status: 'running', runHours: 6520 },
  { name: '卷取机2号', status: 'warning', runHours: 6520 },
];

export default function Dashboard() {
  const {
    slabs,
    heatingRecords,
    finishingRecords,
    coilingRecords,
    inspectionRecords,
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [tempChartData] = useState<TrendData[]>(generateTemperatureData());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayOutput = coilingRecords.reduce((sum, r) => sum + r.netWeight, 0);
  const qualifiedCount = inspectionRecords.filter((r) => r.result === 'qualified').length;
  const passRate = inspectionRecords.length > 0 ? qualifiedCount / inspectionRecords.length : 0;
  const equipmentRate = 96.5;
  const inProgressCount = slabs.filter((s) => s.status !== 'finished').length;
  const avgDischargeTemp =
    heatingRecords.length > 0
      ? heatingRecords.reduce((sum, r) => sum + r.dischargeTemp, 0) / heatingRecords.length
      : 0;
  const avgFinishingTemp =
    finishingRecords.length > 0
      ? finishingRecords.reduce((sum, r) => sum + r.finishingTemp, 0) / finishingRecords.length
      : 0;
  const avgCoilingTemp =
    coilingRecords.length > 0
      ? coilingRecords.reduce((sum, r) => sum + r.coilingTemp, 0) / coilingRecords.length
      : 0;
  const pendingInspection = inspectionRecords.filter((r) => r.result === 'pending').length;

  const kpiData = [
    {
      title: '今日产量',
      value: formatNumber(todayOutput, 1),
      unit: '吨',
      icon: Factory,
      iconColor: 'from-orange-500 to-orange-700',
      trend: 'up' as TrendDirection,
      trendValue: '5.2%',
    },
    {
      title: '合格率',
      value: formatNumber(passRate * 100, 1),
      unit: '%',
      icon: CheckCircle2,
      iconColor: 'from-green-500 to-green-700',
      trend: 'up' as TrendDirection,
      trendValue: '0.8%',
    },
    {
      title: '设备运行率',
      value: formatNumber(equipmentRate, 1),
      unit: '%',
      icon: Cpu,
      iconColor: 'from-blue-500 to-blue-700',
      trend: 'flat' as TrendDirection,
      trendValue: '0.0%',
    },
    {
      title: '当前在制',
      value: inProgressCount,
      unit: '块',
      icon: Boxes,
      iconColor: 'from-purple-500 to-purple-700',
      trend: 'down' as TrendDirection,
      trendValue: '2.1%',
    },
    {
      title: '平均出炉温度',
      value: formatNumber(avgDischargeTemp, 0),
      unit: '℃',
      icon: Flame,
      iconColor: 'from-red-500 to-red-700',
      trend: 'up' as TrendDirection,
      trendValue: '1.5%',
    },
    {
      title: '平均终轧温度',
      value: formatNumber(avgFinishingTemp, 0),
      unit: '℃',
      icon: Thermometer,
      iconColor: 'from-blue-500 to-blue-700',
      trend: 'down' as TrendDirection,
      trendValue: '0.6%',
    },
    {
      title: '平均卷取温度',
      value: formatNumber(avgCoilingTemp, 0),
      unit: '℃',
      icon: Wind,
      iconColor: 'from-green-500 to-green-700',
      trend: 'up' as TrendDirection,
      trendValue: '0.9%',
    },
    {
      title: '待检验',
      value: pendingInspection,
      unit: '卷',
      icon: ClipboardList,
      iconColor: 'from-amber-500 to-amber-700',
      trend: 'down' as TrendDirection,
      trendValue: '3.4%',
    },
  ];

  const formatTimeDisplay = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
    const week = weekMap[date.getDay()];
    return `${y}-${m}-${d} 星期${week} ${h}:${min}:${s}`;
  };

  const latestRecords = coilingRecords
    .slice(-10)
    .reverse()
    .map((coil) => {
      const slab = slabs.find((s) => s.slabNo === coil.slabNo);
      const heating = heatingRecords.find((h) => h.slabNo === coil.slabNo);
      const finishing = finishingRecords.find((f) => f.slabNo === coil.slabNo);
      const inspection = inspectionRecords.find((i) => i.slabNo === coil.slabNo);
      return {
        coilNo: coil.coilNo,
        steelGrade: slab?.steelGrade || '--',
        spec: slab
          ? `${formatThickness(finishing?.midThickness || slab.thickness, 2)} × ${formatNumber(slab.width, 0)}mm`
          : '--',
        dischargeTemp: heating?.dischargeTemp,
        finishingTemp: finishing?.finishingTemp,
        coilingTemp: coil.coilingTemp,
        thickness: finishing?.midThickness,
        status: inspection?.result || 'pending',
      };
    });

  const getStatusBadgeType = (result: string): StatusType => {
    if (result === 'qualified') return 'normal';
    if (result === 'unqualified') return 'abnormal';
    return 'pending';
  };

  const getEquipmentStatusLabel = (status: Equipment['status']): string => {
    const map = { running: '运行', paused: '待机', warning: '维护' };
    return map[status];
  };

  const getEquipmentBadgeType = (status: Equipment['status']): StatusType => {
    if (status === 'running') return 'running';
    if (status === 'paused') return 'paused';
    return 'warning';
  };

  return (
    <div className="space-y-6" style={{ backgroundColor: '#0f172a', minHeight: '100%' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(232, 106, 44, 0.15)' }}
          >
            <LayoutDashboard className="w-6 h-6" style={{ color: TREND_COLORS.orange }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">生产总览</h1>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              热轧生产线实时监控与数据分析看板
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#1e293b' }}>
          <Clock className="w-4 h-4" style={{ color: TREND_COLORS.orange }} />
          <span className="text-sm font-mono text-white">{formatTimeDisplay(currentTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <DataCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
          />
        ))}
      </div>

      <SectionCard
        title="实时温度趋势"
        subtitle="最近24小时工艺温度监控曲线"
        icon={<Activity className="w-5 h-5" />}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={{ stroke: '#475569' }}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis
                domain={[500, 1300]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={{ stroke: '#475569' }}
                axisLine={{ stroke: '#475569' }}
                label={{ value: '℃', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                itemStyle={{ color: '#cbd5e1' }}
              />
              <Legend
                wrapperStyle={{ color: '#94a3b8' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="discharge"
                name="出炉温度"
                stroke={TREND_COLORS.orange}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="finishing"
                name="终轧温度"
                stroke={TREND_COLORS.blue}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="coiling"
                name="卷取温度"
                stroke={TREND_COLORS.green}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="生产工序实时状态"
          subtitle="7道工序联动监控"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          <div className="space-y-4">
            {processSteps.map((step, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{step.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(232, 106, 44, 0.15)', color: TREND_COLORS.orange }}>
                      {step.slabNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={step.status} size="sm" showIcon={false} />
                    <span className="text-sm font-semibold text-white">{step.progress}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#334155' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${step.progress}%`,
                      background: `linear-gradient(90deg, ${TREND_COLORS.orange}, #f97316)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="主要设备运行状态"
          subtitle="核心设备在线监控"
          icon={<Cpu className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {equipmentList.map((eq, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: '#334155' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="relative flex h-2.5 w-2.5"
                  >
                    {eq.status === 'running' && (
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: TREND_COLORS.blue }}
                      />
                    )}
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{
                        backgroundColor:
                          eq.status === 'running'
                            ? TREND_COLORS.blue
                            : eq.status === 'warning'
                            ? TREND_COLORS.orange
                            : '#64748b',
                      }}
                    />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white">{eq.name}</div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>
                      运行 {formatDuration(eq.runHours * 60)}
                    </div>
                  </div>
                </div>
                <StatusBadge
                  status={getEquipmentBadgeType(eq.status)}
                  label={getEquipmentStatusLabel(eq.status)}
                  size="sm"
                  showIcon={false}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="最新生产记录"
        subtitle={`最近 ${latestRecords.length} 条带钢生产数据`}
        icon={<ClipboardList className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>钢卷号</th>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>钢种</th>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>规格(厚×宽)</th>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>出炉温度</th>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>终轧温度</th>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>卷取温度</th>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>厚度</th>
                <th className="text-left py-3 px-3 font-semibold" style={{ color: '#94a3b8' }}>状态</th>
              </tr>
            </thead>
            <tbody>
              {latestRecords.map((record, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.5)',
                    borderBottom: '1px solid #1e293b',
                  }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-white font-medium">{record.coilNo}</td>
                  <td className="py-3 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: TREND_COLORS.blue }}
                    >
                      {record.steelGrade}
                    </span>
                  </td>
                  <td className="py-3 px-3" style={{ color: '#cbd5e1' }}>{record.spec}</td>
                  <td className="py-3 px-3" style={{ color: TREND_COLORS.orange }}>
                    {record.dischargeTemp ? formatTemperature(record.dischargeTemp) : '--'}
                  </td>
                  <td className="py-3 px-3" style={{ color: TREND_COLORS.blue }}>
                    {record.finishingTemp ? formatTemperature(record.finishingTemp) : '--'}
                  </td>
                  <td className="py-3 px-3" style={{ color: TREND_COLORS.green }}>
                    {formatTemperature(record.coilingTemp)}
                  </td>
                  <td className="py-3 px-3" style={{ color: '#cbd5e1' }}>
                    {record.thickness ? formatThickness(record.thickness, 2) : '--'}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={getStatusBadgeType(record.status)} label={formatInspectionResult(record.status)} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
