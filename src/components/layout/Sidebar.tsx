import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Flame,
  Factory,
  Wind,
  Cog,
  Droplets,
  Package,
  ClipboardCheck,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "看板总览",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "板坯入炉",
    path: "/slab-charging",
    icon: Package,
  },
  {
    title: "加热炉",
    path: "/heating-furnace",
    icon: Flame,
  },
  {
    title: "粗轧除鳞",
    path: "/roughing-mill",
    icon: Wind,
  },
  {
    title: "精轧机组",
    path: "/finishing-mill",
    icon: Cog,
  },
  {
    title: "层流冷却",
    path: "/laminar-cooling",
    icon: Droplets,
  },
  {
    title: "卷取打捆",
    path: "/coiling",
    icon: Factory,
  },
  {
    title: "性能检验",
    path: "/inspection",
    icon: ClipboardCheck,
  },
  {
    title: "板坯对比",
    path: "/slab-compare",
    icon: GitCompare,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
          <Factory className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm tracking-wide">热轧产线</span>
          <span className="text-gray-500 text-xs">Hot Rolling MES</span>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2">
          <span className="text-gray-600 text-xs font-medium uppercase tracking-wider">
            生产流程
          </span>
        </div>
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-orange-600/20 text-orange-400 border border-orange-600/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-transparent"
                  )
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-300 text-xs">系统运行正常</span>
          </div>
          <div className="text-gray-500 text-[11px]">
            班次: 甲班 · 机台: HR-01
          </div>
        </div>
      </div>
    </aside>
  );
}
