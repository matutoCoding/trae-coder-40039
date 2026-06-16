import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Flame,
  Droplets,
  Wind,
  Cog,
  Waves,
  Factory,
  ClipboardCheck,
  Check,
  X,
  Clock,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type {
  SlabStatus,
  HeatingRecord,
  DescalingRecord,
  RoughingPass,
  FinishingRecord,
  CoolingRecord,
  CoilingRecord,
  InspectionRecord,
  InspectionResult,
} from '@/types';
import {
  formatDateTime,
  formatTemperature,
  formatThickness,
  formatPressure,
  formatFlow,
  formatStrength,
  formatElongation,
  formatImpactEnergy,
  formatDuration,
} from '@/utils/format';

type NodeStatus = 'completed' | 'in-progress' | 'pending';

type ParamColor = 'default' | 'temperature' | 'thickness' | 'strength';

interface TimelineNodeParam {
  label: string;
  value: string;
  color?: ParamColor;
}

interface TimelineNodeData {
  id: string;
  title: string;
  icon: typeof Package;
  startTime?: string;
  endTime?: string;
  duration?: string;
  params: TimelineNodeParam[];
  status: NodeStatus;
  inspectionBadge?: InspectionResult;
}

interface ProductionTimelineProps {
  slabNo: string;
  className?: string;
}

const statusOrder: SlabStatus[] = [
  'pending',
  'charging',
  'heating',
  'rolling',
  'cooling',
  'coiling',
  'inspecting',
  'finished',
];

const getNodeStatus = (nodeIndex: number, slabStatus: SlabStatus): NodeStatus => {
  if (slabStatus === 'finished') {
    return 'completed';
  }

  const statusIndex = statusOrder.indexOf(slabStatus);

  if (statusIndex === -1 || statusIndex === 0) {
    return 'pending';
  }

  if (nodeIndex < statusIndex - 1) {
    return 'completed';
  }

  if (nodeIndex === statusIndex - 1) {
    return 'in-progress';
  }

  return 'pending';
};

const statusColorMap: Record<NodeStatus, { bg: string; icon: string; ring: string; glow: string; dot: string }> = {
  completed: {
    bg: 'bg-safe-500',
    icon: 'text-white',
    ring: 'ring-safe-500/30',
    glow: 'shadow-lg shadow-safe-500/20',
    dot: 'bg-safe-500',
  },
  'in-progress': {
    bg: 'bg-warm-500',
    icon: 'text-white',
    ring: 'ring-warm-500/50',
    glow: 'shadow-lg shadow-warm-500/40',
    dot: 'bg-warm-500',
  },
  pending: {
    bg: 'bg-gray-600',
    icon: 'text-gray-400',
    ring: 'ring-gray-600/30',
    glow: '',
    dot: 'bg-gray-600',
  },
};

const paramLabelColorMap: Record<ParamColor, string> = {
  default: '',
  temperature: 'text-orange-400',
  thickness: 'text-blue-400',
  strength: 'text-emerald-400',
};

const calcMinutesBetween = (startStr?: string, endStr?: string): number | null => {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  if (isNaN(start) || isNaN(end)) return null;
  return Math.max(0, Math.round((end - start) / 60000));
};

const formatTimeRange = (startTime?: string, endTime?: string, duration?: string): string => {
  if (startTime && endTime && duration) {
    return `${formatDateTime(startTime)} → ${formatDateTime(endTime)}（耗时 ${duration}）`;
  }
  if (startTime && endTime) {
    const mins = calcMinutesBetween(startTime, endTime);
    if (mins !== null) {
      return `${formatDateTime(startTime)} → ${formatDateTime(endTime)}（耗时 ${formatDuration(mins)}）`;
    }
    return `${formatDateTime(startTime)} → ${formatDateTime(endTime)}`;
  }
  if (startTime) {
    return `开始：${formatDateTime(startTime)}`;
  }
  return '--';
};

const buildInspectionBadge = (
  result: InspectionResult
): { text: string; className: string; icon: typeof Check } => {
  switch (result) {
    case 'qualified':
      return {
        text: '合格',
        className: 'bg-safe-500/20 text-safe-400 border-safe-500/50',
        icon: Check,
      };
    case 'unqualified':
      return {
        text: '不合格',
        className: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: X,
      };
    case 'pending':
    default:
      return {
        text: '待检',
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        icon: Clock,
      };
  }
};

function TimelineNode({
  node,
  isLast,
}: {
  node: TimelineNodeData;
  isLast: boolean;
}) {
  const colors = statusColorMap[node.status];
  const Icon = node.icon;
  const timeRange = formatTimeRange(node.startTime, node.endTime, node.duration);

  const inspectionBadge = node.inspectionBadge
    ? buildInspectionBadge(node.inspectionBadge)
    : null;
  const BadgeIcon = inspectionBadge?.icon;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            'relative w-12 h-12 rounded-full flex items-center justify-center ring-4',
            colors.bg,
            colors.ring,
            colors.glow,
            node.status === 'in-progress' && 'animate-pulse'
          )}
        >
          {node.status === 'completed' ? (
            <Check className={cn('w-6 h-6', colors.icon)} />
          ) : (
            <Icon className={cn('w-5 h-5', colors.icon)} />
          )}
          {node.status === 'in-progress' && (
            <span
              className={cn(
                'absolute inset-0 rounded-full animate-ping opacity-40',
                colors.bg
              )}
            />
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 mt-2',
              node.status === 'completed'
                ? 'bg-safe-500/60'
                : 'bg-gray-700/60'
            )}
          />
        )}
      </div>

      <div className="flex-1 pb-1">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <h4
            className={cn(
              'text-base font-semibold',
              node.status === 'pending' ? 'text-gray-500' : 'text-white'
            )}
          >
            {node.title}
          </h4>
          {inspectionBadge && BadgeIcon && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-base font-bold',
                inspectionBadge.className
              )}
            >
              <BadgeIcon className="w-5 h-5" />
              {inspectionBadge.text}
            </span>
          )}
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-md font-medium',
              node.status === 'completed' && 'bg-safe-500/15 text-safe-400',
              node.status === 'in-progress' && 'bg-warm-500/15 text-warm-400',
              node.status === 'pending' && 'bg-gray-700/50 text-gray-500'
            )}
          >
            {node.status === 'completed' && '已完成'}
            {node.status === 'in-progress' && '进行中'}
            {node.status === 'pending' && '未开始'}
          </span>
        </div>

        <p
          className={cn(
            'text-sm mb-2 font-numeric',
            node.status === 'pending' ? 'text-gray-600' : 'text-gray-400'
          )}
        >
          {timeRange}
        </p>

        {node.params.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {node.params.map((param, idx) => (
              <div
                key={idx}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-sm',
                  node.status === 'pending'
                    ? 'bg-gray-800/30 border-gray-700/50'
                    : 'bg-steel-900/50 border-steel-700/50'
                )}
              >
                <span
                  className={cn(
                    'text-xs mr-2',
                    node.status === 'pending'
                      ? 'text-gray-600'
                      : param.color && param.color !== 'default'
                        ? paramLabelColorMap[param.color]
                        : 'text-gray-500'
                  )}
                >
                  {param.label}
                </span>
                <span
                  className={cn(
                    'font-numeric font-medium',
                    node.status === 'pending'
                      ? 'text-gray-600'
                      : 'text-industrial-text'
                  )}
                >
                  {param.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductionTimeline({
  slabNo,
  className,
}: ProductionTimelineProps) {
  const getEntitiesBySlabNo = useStore((state) => state.getEntitiesBySlabNo);
  const slabs = useStore((state) => state.slabs);
  const compareSlabNos = useStore((state) => state.compareSlabNos);
  const navigate = useNavigate();

  const isInCompare = compareSlabNos.includes(slabNo);

  const slab = useMemo(
    () => slabs.find((s) => s.slabNo === slabNo),
    [slabs, slabNo]
  );

  const heatingRecords = useMemo(
    () => getEntitiesBySlabNo<HeatingRecord>('heatingRecords', slabNo),
    [getEntitiesBySlabNo, slabNo]
  );

  const descalingRecords = useMemo(
    () => getEntitiesBySlabNo<DescalingRecord>('descalingRecords', slabNo),
    [getEntitiesBySlabNo, slabNo]
  );

  const roughingPasses = useMemo(
    () => getEntitiesBySlabNo<RoughingPass>('roughingPasses', slabNo),
    [getEntitiesBySlabNo, slabNo]
  );

  const finishingRecords = useMemo(
    () => getEntitiesBySlabNo<FinishingRecord>('finishingRecords', slabNo),
    [getEntitiesBySlabNo, slabNo]
  );

  const coolingRecords = useMemo(
    () => getEntitiesBySlabNo<CoolingRecord>('coolingRecords', slabNo),
    [getEntitiesBySlabNo, slabNo]
  );

  const coilingRecords = useMemo(
    () => getEntitiesBySlabNo<CoilingRecord>('coilingRecords', slabNo),
    [getEntitiesBySlabNo, slabNo]
  );

  const inspectionRecords = useMemo(
    () => getEntitiesBySlabNo<InspectionRecord>('inspectionRecords', slabNo),
    [getEntitiesBySlabNo, slabNo]
  );

  const totalDuration = useMemo(() => {
    const start = slab?.chargingTime;
    const end = inspectionRecords[0]?.inspectTime;
    const mins = calcMinutesBetween(start, end);
    return mins !== null ? formatDuration(mins) : null;
  }, [slab, inspectionRecords]);

  const nodes: TimelineNodeData[] = useMemo(() => {
    const slabStatus = slab?.status ?? 'pending';

    const heatingRecord = heatingRecords[0];
    const descalingRecord = descalingRecords[0];
    const sortedRoughing = [...roughingPasses].sort((a, b) => b.passNo - a.passNo);
    const firstRoughingPass = sortedRoughing[sortedRoughing.length - 1];
    const lastRoughingPass = sortedRoughing[0];
    const finishingRecord = finishingRecords[0];
    const coolingRecord = coolingRecords[0];
    const coilingRecord = coilingRecords[0];
    const inspectionRecord = inspectionRecords[0];

    const addMinutes = (baseStr: string | undefined, mins: number): string | undefined => {
      if (!baseStr) return undefined;
      const d = new Date(baseStr);
      if (isNaN(d.getTime())) return undefined;
      d.setMinutes(d.getMinutes() + mins);
      return d.toISOString().replace('T', ' ').substring(0, 19);
    };

    const roughingStart = heatingRecord?.outTime;
    const roughingEnd = firstRoughingPass
      ? addMinutes(heatingRecord?.outTime, 2)
      : undefined;
    const roughingDuration = roughingStart && roughingEnd
      ? formatDuration(calcMinutesBetween(roughingStart, roughingEnd) ?? 0)
      : undefined;

    const finishingStart = roughingEnd;
    const finishingEnd = finishingRecord && roughingEnd
      ? addMinutes(roughingEnd, 3)
      : undefined;
    const finishingDuration = finishingStart && finishingEnd
      ? formatDuration(calcMinutesBetween(finishingStart, finishingEnd) ?? 0)
      : undefined;

    const coolingStart = finishingEnd;
    const coolingEnd = coolingRecord && finishingEnd
      ? addMinutes(finishingEnd, 1)
      : undefined;
    const coolingDuration = coolingStart && coolingEnd
      ? formatDuration(calcMinutesBetween(coolingStart, coolingEnd) ?? 0)
      : undefined;

    const coilingStart = coolingEnd;
    const coilingEnd = coilingRecord && coolingEnd
      ? addMinutes(coolingEnd, 1)
      : undefined;
    const coilingDuration = coilingStart && coilingEnd
      ? formatDuration(calcMinutesBetween(coilingStart, coilingEnd) ?? 0)
      : undefined;

    const buildCrownQualified = (crown: number): string => {
      const isQualified = Math.abs(crown) <= 50;
      return `${crown}μm ${isQualified ? '✓合格' : '✗不合格'}`;
    };

    const buildThicknessDeviation = (head: number, mid: number, tail: number, target?: number): TimelineNodeParam[] => {
      const base = target ?? mid;
      const makeDev = (name: string, val: number): TimelineNodeParam => ({
        label: `${name}偏差`,
        value: `${(val - base).toFixed(3)}mm`,
        color: 'thickness',
      });
      return [makeDev('头部', head), makeDev('中部', mid), makeDev('尾部', tail)];
    };

    return [
      {
        id: 'charging',
        title: '板坯入炉',
        icon: Package,
        status: getNodeStatus(0, slabStatus),
        startTime: slab?.chargingTime,
        endTime: slab?.chargingTime,
        params: slab
          ? [
              { label: '钢种', value: slab.steelGrade },
              { label: '厚度', value: formatThickness(slab.thickness, 0), color: 'thickness' },
            ]
          : [],
      },
      {
        id: 'heating',
        title: '加热炉',
        icon: Flame,
        status: getNodeStatus(1, slabStatus),
        startTime: heatingRecord?.inTime,
        endTime: heatingRecord?.outTime,
        duration: heatingRecord ? `${heatingRecord.heatingDuration}分钟` : undefined,
        params: heatingRecord
          ? [
              { label: '预热段', value: formatTemperature(heatingRecord.preheatTemp), color: 'temperature' },
              { label: '加热段', value: formatTemperature(heatingRecord.heatingTemp), color: 'temperature' },
              { label: '均热段', value: formatTemperature(heatingRecord.soakingTemp), color: 'temperature' },
              { label: '出炉温度', value: formatTemperature(heatingRecord.dischargeTemp), color: 'temperature' },
            ]
          : [],
      },
      {
        id: 'descaling',
        title: '高压除鳞',
        icon: Droplets,
        status: getNodeStatus(2, slabStatus),
        startTime: descalingRecord?.recordTime,
        endTime: descalingRecord?.recordTime,
        params: descalingRecord
          ? [
              { label: '水压', value: formatPressure(descalingRecord.waterPressure) },
              { label: '流量', value: formatFlow(descalingRecord.waterFlow) },
              { label: '除鳞次数', value: `${descalingRecord.descalingCount}次` },
            ]
          : [],
      },
      {
        id: 'roughing',
        title: '粗轧机组',
        icon: Wind,
        status: getNodeStatus(3, slabStatus),
        startTime: roughingStart,
        endTime: roughingEnd,
        duration: roughingDuration,
        params: lastRoughingPass
          ? [
              { label: '出口厚度', value: formatThickness(lastRoughingPass.outletThickness, 1), color: 'thickness' },
              { label: '道次数', value: `${lastRoughingPass.passNo}道次` },
            ]
          : [],
      },
      {
        id: 'finishing',
        title: '精轧机组',
        icon: Cog,
        status: getNodeStatus(4, slabStatus),
        startTime: finishingStart,
        endTime: finishingEnd,
        duration: finishingDuration,
        params: finishingRecord
          ? [
              { label: '终轧温度', value: formatTemperature(finishingRecord.finishingTemp), color: 'temperature' },
              ...buildThicknessDeviation(
                finishingRecord.headThickness,
                finishingRecord.midThickness,
                finishingRecord.tailThickness
              ),
              { label: '凸度', value: buildCrownQualified(finishingRecord.crown), color: 'thickness' },
            ]
          : [],
      },
      {
        id: 'cooling',
        title: '层流冷却',
        icon: Waves,
        status: getNodeStatus(5, slabStatus),
        startTime: coolingStart,
        endTime: coolingEnd,
        duration: coolingDuration,
        params: coolingRecord
          ? [
              { label: '冷却前温度', value: formatTemperature(coolingRecord.preCoolingTemp), color: 'temperature' },
              { label: '冷却后温度', value: formatTemperature(coolingRecord.postCoolingTemp), color: 'temperature' },
              { label: '冷却速率', value: `${coolingRecord.coolingRate}℃/s` },
            ]
          : [],
      },
      {
        id: 'coiling',
        title: '卷取打捆',
        icon: Factory,
        status: getNodeStatus(6, slabStatus),
        startTime: coilingStart,
        endTime: coilingEnd,
        duration: coilingDuration,
        params: coilingRecord
          ? [
              { label: '卷取温度', value: formatTemperature(coilingRecord.coilingTemp), color: 'temperature' },
              { label: '卷号', value: coilingRecord.coilNo },
            ]
          : [],
      },
      {
        id: 'inspection',
        title: '性能检验',
        icon: ClipboardCheck,
        status: getNodeStatus(7, slabStatus),
        startTime: inspectionRecord?.inspectTime,
        endTime: inspectionRecord?.inspectTime,
        inspectionBadge: inspectionRecord?.result,
        params: inspectionRecord
          ? [
              { label: '屈服强度', value: formatStrength(inspectionRecord.yieldStrength), color: 'strength' },
              { label: '抗拉强度', value: formatStrength(inspectionRecord.tensileStrength), color: 'strength' },
              { label: '伸长率', value: formatElongation(inspectionRecord.elongation) },
              { label: '冲击功', value: formatImpactEnergy(inspectionRecord.impactEnergy), color: 'strength' },
            ]
          : [],
      },
    ];
  }, [
    slab,
    heatingRecords,
    descalingRecords,
    roughingPasses,
    finishingRecords,
    coolingRecords,
    coilingRecords,
    inspectionRecords,
  ]);

  if (!slab) {
    return (
      <div
        className={cn(
          'bg-industrial-panel border border-industrial-border rounded-lg p-6',
          className
        )}
      >
        <p className="text-gray-500 text-center">未找到板坯数据</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-industrial-panel border border-industrial-border rounded-lg p-6',
        className
      )}
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">生产履历</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            板坯编号：<span className="font-numeric text-gray-400">{slab.slabNo}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {totalDuration && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-4 h-4" />
              总耗时 {totalDuration}
            </span>
          )}
          <span
            className={cn(
              'inline-block px-3 py-1 rounded-md text-sm font-medium',
              slab.status === 'finished' && 'bg-safe-500/15 text-safe-400',
              slab.status === 'inspecting' && 'bg-data-500/15 text-data-400',
              slab.status === 'coiling' && 'bg-warm-500/15 text-warm-400',
              slab.status === 'cooling' && 'bg-blue-500/15 text-blue-400',
              slab.status === 'rolling' && 'bg-warm-500/15 text-warm-400',
              slab.status === 'heating' && 'bg-orange-500/15 text-orange-400',
              slab.status === 'charging' && 'bg-amber-500/15 text-amber-400',
              slab.status === 'pending' && 'bg-gray-700/50 text-gray-500'
            )}
          >
            {
              {
                pending: '待入炉',
                charging: '入炉中',
                heating: '加热中',
                rolling: '轧制中',
                cooling: '冷却中',
                coiling: '卷取中',
                inspecting: '检验中',
                finished: '已完成',
              }[slab.status]
            }
          </span>
          {isInCompare && (
            <button
              onClick={() => navigate('/slab-compare')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              返回对比
            </button>
          )}
        </div>
      </div>

      <div className="space-y-0">
        {nodes.map((node, index) => (
          <TimelineNode
            key={node.id}
            node={node}
            isLast={index === nodes.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
