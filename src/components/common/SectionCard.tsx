import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export default function SectionCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  contentClassName,
  noPadding = false,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "bg-gray-900 border border-gray-800 rounded-lg overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="flex items-center justify-center text-orange-400 flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
            {subtitle && (
              <p className="text-gray-500 text-xs mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>

      <div className={cn(!noPadding && "p-5", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
