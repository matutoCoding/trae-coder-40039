import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  ArrowRightToLine,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Flame,
  Factory,
  Info,
  Package,
} from 'lucide-react';
import {
  formatThickness,
  formatLength,
  formatWeight,
  formatDateTime,
  formatSlabStatus,
} from '@/utils/format';
import type { Slab, HeatingRecord, RoughingPass } from '@/types';

export default function SlabCharging() {
  const {
    slabs,
    setCurrentSlabNo,
    currentSlabNo,
    updateEntity,
    getEntitiesBySlabNo,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'charged'>('pending');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [pendingList, setPendingList] = useState<Slab[]>([]);

  const pageSize = 8;

  const pendingSlabs = useMemo(() => {
    let list = slabs.filter((s) => s.status === 'pending' || s.status === 'charging');
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      list = list.filter(
        (s) =>
          s.slabNo.toLowerCase().includes(keyword) ||
          s.steelGrade.toLowerCase().includes(keyword)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    return list;
  }, [slabs, searchKeyword, statusFilter]);

  const displayPendingList = pendingList.length > 0 ? pendingList : pendingList;

  const chargedSlabs = useMemo(() => {
    let list = slabs.filter(
      (s) =>
        s.status === 'heating' ||
        s.status === 'rolling' ||
        s.status === 'cooling' ||
        s.status === 'coiling' ||
        s.status === 'inspecting' ||
        s.status === 'finished'
    );
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      list = list.filter(
        (s) =>
          s.slabNo.toLowerCase().includes(keyword) ||
          s.steelGrade.toLowerCase().includes(keyword)
      );
    }
    return list;
  }, [slabs, searchKeyword]);

  const totalPages = Math.ceil(chargedSlabs.length / pageSize);
  const pagedChargedSlabs = chargedSlabs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const selectedSlab = useMemo(() => {
    return slabs.find((s) => s.slabNo === currentSlabNo) || null;
  }, [slabs, currentSlabNo]);

  const selectedHeatingRecords = useMemo(() => {
    if (!currentSlabNo) return [];
    return getEntitiesBySlabNo('heatingRecords', currentSlabNo) as HeatingRecord[];
  }, [currentSlabNo, getEntitiesBySlabNo]);

  const selectedRoughingPasses = useMemo(() => {
    if (!currentSlabNo) return [];
    return getEntitiesBySlabNo('roughingPasses', currentSlabNo) as RoughingPass[];
  }, [currentSlabNo, getEntitiesBySlabNo]);

  const handleCharge = (slab: Slab) => {
    updateEntity('slabs', slab.id, {
      status: 'charging',
      chargingTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newList = [...displayPendingList];
    const [draggedItem] = newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);
    setPendingList(newList);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getSlabStatusBadge = (status: string) => {
    const statusMap: Record<string, 'normal' | 'running' | 'pending' | 'warning' | 'paused'> = {
      pending: 'pending',
      charging: 'running',
      heating: 'running',
      rolling: 'running',
      cooling: 'warning',
      coiling: 'warning',
      inspecting: 'pending',
      finished: 'normal',
    };
    return statusMap[status] || 'pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ArrowRightToLine className="w-7 h-7 text-[#e86a2c]" />
        <div>
          <h1 className="text-2xl font-bold text-white">板坯入炉管理</h1>
          <p className="text-gray-400 text-sm">管理待入炉板坯队列和已入炉生产记录</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索板坯号 / 钢种..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-64 h-9 pl-9 pr-3 bg-[#1e293b] border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e86a2c] transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 h-9 pl-9 pr-8 bg-[#1e293b] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] transition-colors appearance-none cursor-pointer"
            >
              <option value="all">全部状态</option>
              <option value="pending">待入炉</option>
              <option value="charging">入炉中</option>
            </select>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 bg-[#e86a2c] hover:bg-[#d45e24] text-white text-sm font-medium rounded-md transition-colors">
          <Plus className="w-4 h-4" />
          新增板坯
        </button>
      </div>

      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-[#e86a2c]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          待入炉队列
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
            {pendingSlabs.length}
          </span>
          {activeTab === 'pending' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e86a2c]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('charged')}
          className={`px-5 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'charged'
              ? 'text-[#e86a2c]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          已入炉记录
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
            {chargedSlabs.length}
          </span>
          {activeTab === 'charged' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e86a2c]" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {activeTab === 'pending' ? (
            <SectionCard
              title="待入炉板坯队列"
              subtitle="拖拽调整入炉顺序"
              icon={<ArrowRightToLine className="w-5 h-5" />}
            >
              <div className="space-y-2">
                {displayPendingList.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无待入炉板坯</p>
                  </div>
                ) : (
                  displayPendingList.map((slab, index) => (
                    <div
                      key={slab.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setCurrentSlabNo(slab.slabNo)}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-move transition-all ${
                        index % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#1a2332]'
                      } border-gray-700 hover:border-[#e86a2c]/50 ${
                        currentSlabNo === slab.slabNo
                          ? 'ring-1 ring-[#e86a2c] border-[#e86a2c]'
                          : ''
                      } ${draggedIndex === index ? 'opacity-50' : ''}`}
                    >
                      <div className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-700/50 rounded text-sm font-mono text-gray-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 mb-0.5">板坯号</div>
                          <div className="text-sm text-white font-mono truncate">{slab.slabNo}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">钢种</div>
                          <div className="text-sm text-gray-200">{slab.steelGrade}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">规格</div>
                          <div className="text-sm text-gray-200">
                            {formatThickness(slab.thickness, 0)} × {formatLength(slab.width)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">重量</div>
                          <div className="text-sm text-gray-200">{formatWeight(slab.weight)}</div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 hidden lg:block">
                        <div className="text-xs text-gray-500 mb-0.5">来源</div>
                        <div className="text-sm text-gray-200">{slab.source}</div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <StatusBadge
                          status={getSlabStatusBadge(slab.status)}
                          label={formatSlabStatus(slab.status)}
                          size="sm"
                          showIcon={false}
                        />
                        {slab.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCharge(slab);
                            }}
                            className="inline-flex items-center gap-1 h-7 px-3 bg-[#e86a2c] hover:bg-[#d45e24] text-white text-xs font-medium rounded transition-colors"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            入炉
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          ) : (
            <SectionCard
              title="已入炉板坯记录"
              subtitle={`共 ${chargedSlabs.length} 条记录`}
              icon={<Factory className="w-5 h-5" />}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-gray-700">
                      <th className="pb-3 font-medium whitespace-nowrap">板坯号</th>
                      <th className="pb-3 font-medium whitespace-nowrap">钢种</th>
                      <th className="pb-3 font-medium whitespace-nowrap">规格</th>
                      <th className="pb-3 font-medium whitespace-nowrap">重量</th>
                      <th className="pb-3 font-medium whitespace-nowrap">来源</th>
                      <th className="pb-3 font-medium whitespace-nowrap">入炉时间</th>
                      <th className="pb-3 font-medium whitespace-nowrap">状态</th>
                      <th className="pb-3 font-medium whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedChargedSlabs.map((slab, index) => (
                      <tr
                        key={slab.id}
                        onClick={() => setCurrentSlabNo(slab.slabNo)}
                        className={`border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-[#1e293b]/30' : 'bg-transparent'
                        } ${currentSlabNo === slab.slabNo ? 'bg-[#e86a2c]/10' : ''}`}
                      >
                        <td className="py-3 pr-4 text-white font-mono whitespace-nowrap">{slab.slabNo}</td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{slab.steelGrade}</td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                          {formatThickness(slab.thickness, 0)}×{formatLength(slab.width)}×{formatLength(slab.length)}
                        </td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{formatWeight(slab.weight)}</td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{slab.source}</td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{formatDateTime(slab.chargingTime)}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <StatusBadge
                            status={getSlabStatusBadge(slab.status)}
                            label={formatSlabStatus(slab.status)}
                            size="sm"
                            showIcon={false}
                          />
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <button className="text-[#e86a2c] hover:text-[#ff7f3f] text-xs">
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                  <div className="text-xs text-gray-500">
                    显示 {(currentPage - 1) * pageSize + 1} -{' '}
                    {Math.min(currentPage * pageSize, chargedSlabs.length)} 条，共{' '}
                    {chargedSlabs.length} 条
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-8 h-8 px-2 rounded text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-[#e86a2c] text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </SectionCard>
          )}
        </div>

        <div className="xl:col-span-1">
          <SectionCard
            title="板坯详情"
            subtitle={selectedSlab ? selectedSlab.slabNo : '未选择板坯'}
            icon={<Info className="w-5 h-5" />}
          >
            {selectedSlab ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">钢种</div>
                    <div className="text-sm text-white font-medium">{selectedSlab.steelGrade}</div>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">状态</div>
                    <StatusBadge
                      status={getSlabStatusBadge(selectedSlab.status)}
                      label={formatSlabStatus(selectedSlab.status)}
                      size="sm"
                      showIcon={false}
                    />
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">厚度</div>
                    <div className="text-sm text-white font-mono">{formatThickness(selectedSlab.thickness)}</div>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">宽度</div>
                    <div className="text-sm text-white font-mono">{formatLength(selectedSlab.width)}</div>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">长度</div>
                    <div className="text-sm text-white font-mono">{formatLength(selectedSlab.length)}</div>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">重量</div>
                    <div className="text-sm text-white font-mono">{formatWeight(selectedSlab.weight)}</div>
                  </div>
                </div>
                <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">来源</div>
                  <div className="text-sm text-white">{selectedSlab.source}</div>
                </div>
                <div className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">入炉时间</div>
                  <div className="text-sm text-white font-mono">{formatDateTime(selectedSlab.chargingTime)}</div>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-[#e86a2c]" />
                    <span className="text-sm font-medium text-white">加热记录摘要</span>
                  </div>
                  {selectedHeatingRecords.length === 0 ? (
                    <div className="text-xs text-gray-500 py-3 text-center bg-[#0f172a] rounded-md border border-gray-700">
                      暂无加热记录
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedHeatingRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">{record.furnaceNo}</span>
                            <span className={`text-xs ${record.outTime ? 'text-[#2ea043]' : 'text-[#e86a2c]'}`}>
                              {record.outTime ? '已出炉' : '加热中'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">预热：</span>
                              <span className="text-gray-300">{record.preheatTemp}℃</span>
                            </div>
                            <div>
                              <span className="text-gray-500">加热：</span>
                              <span className="text-gray-300">{record.heatingTemp}℃</span>
                            </div>
                            <div>
                              <span className="text-gray-500">均热：</span>
                              <span className="text-gray-300">{record.soakingTemp}℃</span>
                            </div>
                            <div>
                              <span className="text-gray-500">出炉：</span>
                              <span className="text-[#e86a2c]">{record.dischargeTemp}℃</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Factory className="w-4 h-4 text-[#e86a2c]" />
                    <span className="text-sm font-medium text-white">轧制记录摘要</span>
                  </div>
                  {selectedRoughingPasses.length === 0 ? (
                    <div className="text-xs text-gray-500 py-3 text-center bg-[#0f172a] rounded-md border border-gray-700">
                      暂无轧制记录
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedRoughingPasses.slice(0, 3).map((pass) => (
                        <div key={pass.id} className="p-3 bg-[#0f172a] rounded-md border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-white">第 {pass.passNo} 道次</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">入口：</span>
                              <span className="text-gray-300">{pass.inletThickness}mm</span>
                            </div>
                            <div>
                              <span className="text-gray-500">出口：</span>
                              <span className="text-gray-300">{pass.outletThickness}mm</span>
                            </div>
                            <div>
                              <span className="text-gray-500">压下：</span>
                              <span className="text-[#e86a2c]">{pass.reduction}mm</span>
                            </div>
                            <div>
                              <span className="text-gray-500">轧制力：</span>
                              <span className="text-gray-300">{pass.rollingForce}kN</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">请从左侧列表选择一块板坯</p>
                <p className="text-xs mt-1">查看详细参数和生产记录</p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
