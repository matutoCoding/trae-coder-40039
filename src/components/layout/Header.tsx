import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronRight,
  Home,
  Bell,
  Search,
  Settings,
  User,
} from "lucide-react";

const pathNameMap: Record<string, string> = {
  "/": "看板总览",
  "/slab-charging": "板坯入炉",
  "/heating-furnace": "加热炉",
  "/roughing-mill": "粗轧除鳞",
  "/finishing-mill": "精轧机组",
  "/laminar-cooling": "层流冷却",
  "/coiling": "卷取打捆",
  "/inspection": "性能检验",
};

export default function Header() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPageName = pathNameMap[location.pathname] || "未知页面";

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const weekDay = weekDays[date.getDay()];
    return `${year}-${month}-${day} ${weekDay}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <nav className="flex items-center text-sm">
          <div className="flex items-center text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
            <Home className="w-4 h-4" />
          </div>
          <ChevronRight className="w-4 h-4 text-gray-700 mx-1" />
          <span className="text-gray-400">生产管理</span>
          <ChevronRight className="w-4 h-4 text-gray-700 mx-1" />
          <span className="text-white font-medium">{currentPageName}</span>
        </nav>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-white font-mono text-lg tracking-wider">
            {formatTime(currentTime)}
          </span>
          <span className="text-gray-500 text-xs">
            {formatDate(currentTime)}
          </span>
        </div>

        <div className="h-8 w-px bg-gray-800" />

        <div className="relative hidden lg:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索..."
            className="w-48 h-9 pl-9 pr-4 text-sm bg-gray-800/50 border border-gray-700 rounded-md text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-600/50 focus:bg-gray-800 transition-all"
          />
        </div>

        <button className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
          <Settings className="w-[18px] h-[18px]" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-white text-sm font-medium">张工程师</span>
            <span className="text-gray-500 text-xs">生产管理员</span>
          </div>
        </div>
      </div>
    </header>
  );
}
