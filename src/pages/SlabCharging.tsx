import { useState, useMemo, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import StatusBadge from '@/components/common/StatusBadge';
import ProductionTimeline from '@/components/common/ProductionTimeline';
import {
  ArrowRightToLine,
  Search,
  Filter,
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
import type { Slab, SlabStatus } from '@/types';

export default function SlabCharging() {
  const {
    slabs,
    setCurrentSlabNo,
    currentSlabNo,
    chargeSlab,
    reorderSlabs,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'charged'>('pending');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [chargedStatusFilter, setChargedStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const pageSize = 8;

  const pendingSlabs = useMemo(() => {
    return slabs.filter((s) => s.status === 'pending');
  }, [slabs]);

  const filteredPendingSlabs = useMemo(() => {
    let list = pendingSlabs;
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      list = list.filter(
        (s) =>
          s.slabNo.toLowerCase().includes(keyword) ||
          s.steelGrade.toLowerCase().includes(keyword)
      );
    }
    return list;
  }, [pendingSlabs, searchKeyword]);

  const chargedSlabs = useMemo(() => {
    let list = slabs.filter((s) => s.status !== 'pending');
    if (searchKeyword && activeTab === 'charged') {
      const keyword = searchKeyword.toLowerCase();
      list = list.filter(
        (s) =>
          s.slabNo.toLowerCase().includes(keyword) ||
          s.steelGrade.toLowerCase().includes(keyword)
      );
    }
    if (chargedStatusFilter !== 'all') {
      list = list.filter((s) => s.status === chargedStatusFilter);
    }
    return list;
  }, [slabs, searchKeyword, chargedStatusFilter, activeTab]);

  const totalPages = Math.ceil(chargedSlabs.length / pageSize);
  const pagedChargedSlabs = chargedSlabs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const selectedSlab = useMemo(() => {
    return slabs.find((s) => s.slabNo === currentSlabNo) || null;
  }, [slabs, currentSlabNo]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === toIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    reorderSlabs(draggedIndex, toIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, reorderSlabs]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleCharge = useCallback((slab: Slab) => {
    chargeSlab(slab.id);
  }, [chargeSlab]);

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

  const chargedStatusOptions: { value: string; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'heating', label: '加热中' },
    { value: 'rolling', label: '轧制中' },
    { value: 'cooling', label: '冷却中' },
    { value: 'coiling', label: '卷取中' },
    { value: 'inspecting', label: '检验中' },
    { value: 'finished', label: '已完成' },
  ];

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
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64 h-9 pl-9 pr-3 bg-[#1e293b] border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e86a2c] transition-colors"
            />
          </div>
          {activeTab === 'charged' && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={chargedStatusFilter}
                onChange={(e) => {
                  setChargedStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-40 h-9 pl-9 pr-8 bg-[#1e293b] border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#e86a2c] transition-colors appearance-none cursor-pointer"
              >
                {chargedStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-700">
        <button
          onClick={() => {
            setActiveTab('pending');
            setCurrentPage(1);
          }}
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
          onClick={() => {
            setActiveTab('charged');
            setCurrentPage(1);
          }}
          className={`px-5 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'charged'
              ? 'text-[#e86a2c]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          已入炉记录
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
            {slabs.filter((s) => s.status !== 'pending').length}
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
                {filteredPendingSlabs.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无待入炉板坯</p>
                  </div>
                ) : (
                  filteredPendingSlabs.map((slab, index) => {
                    const originalIndex = pendingSlabs.findIndex((s) => s.id === slab.id);
                    const isDragging = draggedIndex === originalIndex;
                    const isDragOver = dragOverIndex === originalIndex;
                    
                    return (
                      <div
                        key={slab.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, originalIndex)}
                        onDragOver={(e) => handleDragOver(e, originalIndex)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, originalIndex)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setCurrentSlabNo(slab.slabNo)}
                        className={`flex items-center gap-3 p-3 rounded-md border cursor-move transition-all ${
                          index % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#1a2332]'
                        } border-gray-700 hover:border-[#e86a2c]/50 ${
                          currentSlabNo === slab.slabNo
                            ? 'ring-1 ring-[#e86a2c] border-[#e86a2c]'
                            : ''
                        } ${isDragging ? 'opacity-50' : ''} ${
                          isDragOver && !isDragging ? 'border-[#e86a2c] bg-[#e86a2c]/5' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-700/50 rounded text-sm font-mono text-gray-300">
                          {originalIndex + 1}
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
                        </div>
                      </div>
                    );
                  })
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
                    </tr>
                  </thead>
                  <tbody>
                    {pagedChargedSlabs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <Factory className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p>暂无已入炉记录</p>
                        </td>
                      </tr>
                    ) : (
                      pagedChargedSlabs.map((slab, index) => (
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
                          <td className="py-3 pr-4 text-gray-300 whitespace-nowrap font-mono text-xs">
                            {formatDateTime(slab.chargingTime)}
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            <StatusBadge
                              status={getSlabStatusBadge(slab.status)}
                              label={formatSlabStatus(slab.status)}
                              size="sm"
                              showIcon={false}
                            />
                          </td>
                        </tr>
                      ))
                    )}
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
                  <ProductionTimeline slabNo={selectedSlab.slabNo} />
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
