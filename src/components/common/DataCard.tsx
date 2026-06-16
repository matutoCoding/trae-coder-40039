import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "flat";

interface DataCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: TrendDirection;
  trendValue?: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  description?: string;
  className?: string;
}

const trendConfig: Record<
  TrendDirection,
  {
    icon: LucideIcon;
    textClass: string;
    bgClass: string;
    iconClass: string;
  }
> = {
  up: {
    icon: TrendingUp,
    textClass: "text-green-400",
    bgClass: "bg-green-500/10",
    iconClass: "text-green-400",
  },
  down: {
    icon: TrendingDown,
    textClass: "text-red-400",
    bgClass: "bg-red-500/10",
    iconClass: "text-red-400",
  },
  flat: {
    icon: Minus,
    textClass: "text-gray-400",
    bgClass: "bg-gray-500/10",
    iconClass: "text-gray-400",
  },
};

export default function DataCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon: Icon,
  iconColor = "from-orange-500 to-red-600",
  description,
  className,
}: DataCardProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div
      className={cn(
        "bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {Icon && (
              <div
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center bg-gradient-to-br",
                  iconColor
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-gray-400 text-sm font-medium">{title}</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-gray-500 text-sm font-medium">{unit}</span>
            )}
          </div>

          {description && (
            <p className="text-gray-500 text-xs mt-1.5">{description}</p>
          )}
        </div>

        {trend && TrendIcon && (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
              trendConfig[trend].bgClass,
              trendConfig[trend].textClass
            )}
          >
            <TrendIcon className={cn("w-3.5 h-3.5", trendConfig[trend].iconClass)} />
            {trendValue !== undefined && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
