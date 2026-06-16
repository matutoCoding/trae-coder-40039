import { CheckCircle, XCircle, Clock, Loader, AlertTriangle, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StatusType = "normal" | "abnormal" | "running" | "pending" | "warning" | "paused";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    label: string;
    icon: LucideIcon;
    dotClass: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
    iconClass: string;
  }
> = {
  normal: {
    label: "正常",
    icon: CheckCircle,
    dotClass: "bg-green-500",
    textClass: "text-green-400",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/20",
    iconClass: "text-green-400",
  },
  abnormal: {
    label: "异常",
    icon: XCircle,
    dotClass: "bg-red-500",
    textClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
    iconClass: "text-red-400",
  },
  running: {
    label: "运行中",
    icon: Loader,
    dotClass: "bg-blue-500",
    textClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    iconClass: "text-blue-400",
  },
  pending: {
    label: "待处理",
    icon: Clock,
    dotClass: "bg-amber-500",
    textClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    iconClass: "text-amber-400",
  },
  warning: {
    label: "警告",
    icon: AlertTriangle,
    dotClass: "bg-orange-500",
    textClass: "text-orange-400",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/20",
    iconClass: "text-orange-400",
  },
  paused: {
    label: "已暂停",
    icon: Pause,
    dotClass: "bg-gray-500",
    textClass: "text-gray-400",
    bgClass: "bg-gray-500/10",
    borderClass: "border-gray-500/20",
    iconClass: "text-gray-400",
  },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

const iconSizeConfig = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
};

export default function StatusBadge({
  status,
  label,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium",
        config.bgClass,
        config.borderClass,
        config.textClass,
        sizeConfig[size],
        className
      )}
    >
      {status === "running" ? (
        <span className={cn("relative flex h-2 w-2")}>
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              config.dotClass
            )}
          />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", config.dotClass)} />
        </span>
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      )}
      {showIcon && (
        <Icon className={cn(iconSizeConfig[size], config.iconClass, status === "running" && "animate-spin")} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
