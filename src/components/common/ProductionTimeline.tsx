import { useMemo } from 'react';
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
} from '@/types';
import {
  formatDateTime,
  formatTemperature,
  formatThickness,
  formatPressure,
  formatFlow,
  formatStrength,
  formatElongation,
} from '@/utils/format';

type NodeStatus = 'completed' | 'in-progress' | 'pending';

interface TimelineNodeData {
  id: string;
  title: string;
  icon: typeof Package;
  time?: string;
  params: { label: string; value: string }[];
  status: NodeStatus;
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

function TimelineNode({
  node,
  isLast,
}: {
  node: TimelineNodeData;
  isLast: boolean;
}) {
  const colors = statusColorMap[node.status];
  const Icon = node.icon;

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
        <div className="flex items-center gap-3 mb-1.5">
          <h4
            className={cn(
              'text-base font-semibold',
              node.status === 'pending' ? 'text-gray-500' : 'text-white'
            )}
          >
            {node.title}
          </h4>
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
          {node.time || '--'}
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
                    node.status === 'pending' ? 'text-gray-600' : 'text-gray-500'
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

  const nodes: TimelineNodeData[] = useMemo(() => {
    const slabStatus = slab?.status ?? 'pending';

    const heatingRecord = heatingRecords[0];
    const descalingRecord = descalingRecords[0];
    const lastRoughingPass = [...roughingPasses].sort(
      (a, b) => b.passNo - a.passNo
    )[0];
    const finishingRecord = finishingRecords[0];
    const coolingRecord = coolingRecords[0];
    const coilingRecord = coilingRecords[0];
    const inspectionRecord = inspectionRecords[0];

    return [
      {
        id: 'charging',
        title: '板坯入炉',
        icon: Package,
        status: getNodeStatus(0, slabStatus),
        time: slab?.chargingTime ? formatDateTime(slab.chargingTime) : undefined,
        params: slab
          ? [
              { label: '钢种', value: slab.steelGrade },
              { label: '厚度', value: formatThickness(slab.thickness, 0) },
            ]
          : [],
      },
      {
        id: 'heating',
        title: '加热炉',
        icon: Flame,
        status: getNodeStatus(1, slabStatus),
        time: heatingRecord?.inTime ? formatDateTime(heatingRecord.inTime) : undefined,
        params: heatingRecord
          ? [
              { label: '出炉温度', value: formatTemperature(heatingRecord.dischargeTemp) },
              { label: '加热时长', value: `${heatingRecord.heatingDuration}分钟` },
            ]
          : [],
      },
      {
        id: 'descaling',
        title: '高压除鳞',
        icon: Droplets,
        status: getNodeStatus(2, slabStatus),
        time: descalingRecord?.recordTime ? formatDateTime(descalingRecord.recordTime) : undefined,
        params: descalingRecord
          ? [
              { label: '水压', value: formatPressure(descalingRecord.waterPressure) },
              { label: '流量', value: formatFlow(descalingRecord.waterFlow) },
            ]
          : [],
      },
      {
        id: 'roughing',
        title: '粗轧机组',
        icon: Wind,
        status: getNodeStatus(3, slabStatus),
        time: undefined,
        params: lastRoughingPass
          ? [
              { label: '出口厚度', value: formatThickness(lastRoughingPass.outletThickness, 1) },
              { label: '道次数', value: `${lastRoughingPass.passNo}道次` },
            ]
          : [],
      },
      {
        id: 'finishing',
        title: '精轧机组',
        icon: Cog,
        status: getNodeStatus(4, slabStatus),
        time: undefined,
        params: finishingRecord
          ? [
              { label: '终轧温度', value: formatTemperature(finishingRecord.finishingTemp) },
              { label: '厚度', value: formatThickness(finishingRecord.midThickness) },
            ]
          : [],
      },
      {
        id: 'cooling',
        title: '层流冷却',
        icon: Waves,
        status: getNodeStatus(5, slabStatus),
        time: undefined,
        params: coolingRecord
          ? [
              { label: '冷却后温度', value: formatTemperature(coolingRecord.postCoolingTemp) },
              { label: '冷却速率', value: `${coolingRecord.coolingRate}℃/s` },
            ]
          : [],
      },
      {
        id: 'coiling',
        title: '卷取打捆',
        icon: Factory,
        status: getNodeStatus(6, slabStatus),
        time: undefined,
        params: coilingRecord
          ? [
              { label: '卷取温度', value: formatTemperature(coilingRecord.coilingTemp) },
              { label: '卷号', value: coilingRecord.coilNo },
            ]
          : [],
      },
      {
        id: 'inspection',
        title: '性能检验',
        icon: ClipboardCheck,
        status: getNodeStatus(7, slabStatus),
        time: inspectionRecord?.inspectTime ? formatDateTime(inspectionRecord.inspectTime) : undefined,
        params: inspectionRecord
          ? [
              { label: '屈服强度', value: formatStrength(inspectionRecord.yieldStrength) },
              { label: '伸长率', value: formatElongation(inspectionRecord.elongation) },
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">生产履历</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            板坯编号：<span className="font-numeric text-gray-400">{slab.slabNo}</span>
          </p>
        </div>
        <div className="text-right">
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
