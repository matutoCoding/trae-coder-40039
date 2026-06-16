import { create } from 'zustand';
import type {
  Slab,
  HeatingRecord,
  DescalingRecord,
  RoughingPass,
  FinishingRecord,
  CoolingRecord,
  CoilingRecord,
  InspectionRecord,
} from '@/types';
import {
  mockSlabs,
  mockHeatingRecords,
  mockDescalingRecords,
  mockRoughingPasses,
  mockFinishingRecords,
  mockCoolingRecords,
  mockCoilingRecords,
  mockInspectionRecords,
} from '@/data/mockData';

export type EntityType =
  | 'slabs'
  | 'heatingRecords'
  | 'descalingRecords'
  | 'roughingPasses'
  | 'finishingRecords'
  | 'coolingRecords'
  | 'coilingRecords'
  | 'inspectionRecords';

export type Entity =
  | Slab
  | HeatingRecord
  | DescalingRecord
  | RoughingPass
  | FinishingRecord
  | CoolingRecord
  | CoilingRecord
  | InspectionRecord;

const STORAGE_KEY = 'hot-rolling-store';

interface PersistedState {
  slabs: Slab[];
  currentSlabNo: string | null;
}

const loadPersistedState = (): Partial<PersistedState> => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PersistedState;
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return {};
};

const savePersistedState = (state: PersistedState) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
};

const persisted = loadPersistedState();

const isDateInRange = (dateStr: string, startDate: string, endDate: string): boolean => {
  if (!startDate && !endDate) return true;
  const date = new Date(dateStr);
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (date < start) return false;
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
};

interface StoreState {
  currentSlabNo: string | null;
  slabs: Slab[];
  heatingRecords: HeatingRecord[];
  descalingRecords: DescalingRecord[];
  roughingPasses: RoughingPass[];
  finishingRecords: FinishingRecord[];
  coolingRecords: CoolingRecord[];
  coilingRecords: CoilingRecord[];
  inspectionRecords: InspectionRecord[];

  filterSteelGrade: string;
  filterSlabNo: string;
  filterStartDate: string;
  filterEndDate: string;

  setCurrentSlabNo: (slabNo: string | null) => void;

  setFilterSteelGrade: (grade: string) => void;
  setFilterSlabNo: (slabNo: string) => void;
  setFilterStartDate: (date: string) => void;
  setFilterEndDate: (date: string) => void;
  resetFilters: () => void;

  getEntities: <T extends Entity>(type: EntityType) => T[];
  getEntityById: <T extends Entity>(type: EntityType, id: string) => T | undefined;
  getEntitiesBySlabNo: <T extends Entity>(type: EntityType, slabNo: string) => T[];

  getFilteredSlabs: () => Slab[];
  getFilteredHeatingRecords: () => HeatingRecord[];
  getFilteredFinishingRecords: () => FinishingRecord[];
  getFilteredCoilingRecords: () => CoilingRecord[];

  addEntity: <T extends Entity>(type: EntityType, entity: T) => void;
  updateEntity: <T extends Entity>(type: EntityType, id: string, updates: Partial<T>) => void;
  deleteEntity: (type: EntityType, id: string) => void;

  reorderSlabs: (fromIndex: number, toIndex: number) => void;
  chargeSlab: (slabId: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentSlabNo: persisted.currentSlabNo ?? null,
  slabs: persisted.slabs ?? mockSlabs,
  heatingRecords: mockHeatingRecords,
  descalingRecords: mockDescalingRecords,
  roughingPasses: mockRoughingPasses,
  finishingRecords: mockFinishingRecords,
  coolingRecords: mockCoolingRecords,
  coilingRecords: mockCoilingRecords,
  inspectionRecords: mockInspectionRecords,

  filterSteelGrade: '',
  filterSlabNo: '',
  filterStartDate: '',
  filterEndDate: '',

  setCurrentSlabNo: (slabNo) => {
    set({ currentSlabNo: slabNo });
    savePersistedState({ slabs: get().slabs, currentSlabNo: slabNo });
  },

  setFilterSteelGrade: (grade) => {
    set({ filterSteelGrade: grade });
  },

  setFilterSlabNo: (slabNo) => {
    set({ filterSlabNo: slabNo });
  },

  setFilterStartDate: (date) => {
    set({ filterStartDate: date });
  },

  setFilterEndDate: (date) => {
    set({ filterEndDate: date });
  },

  resetFilters: () => {
    set({
      filterSteelGrade: '',
      filterSlabNo: '',
      filterStartDate: '',
      filterEndDate: '',
    });
  },

  getEntities: <T extends Entity>(type: EntityType): T[] => {
    return (get()[type] as unknown) as T[];
  },

  getEntityById: <T extends Entity>(type: EntityType, id: string): T | undefined => {
    const entities = get()[type] as Entity[];
    return entities.find((e) => e.id === id) as T | undefined;
  },

  getEntitiesBySlabNo: <T extends Entity>(type: EntityType, slabNo: string): T[] => {
    const entities = get()[type] as Entity[];
    if (type === 'slabs') {
      return entities.filter((e) => (e as Slab).slabNo === slabNo) as T[];
    }
    return entities.filter((e) => 'slabNo' in e && (e as { slabNo: string }).slabNo === slabNo) as T[];
  },

  getFilteredSlabs: (): Slab[] => {
    const { slabs, filterSteelGrade, filterSlabNo, filterStartDate, filterEndDate } = get();

    return slabs.filter((slab) => {
      if (filterSteelGrade && slab.steelGrade !== filterSteelGrade) {
        return false;
      }

      if (filterSlabNo && !slab.slabNo.toLowerCase().includes(filterSlabNo.toLowerCase())) {
        return false;
      }

      if ((filterStartDate || filterEndDate) && slab.chargingTime) {
        if (!isDateInRange(slab.chargingTime, filterStartDate, filterEndDate)) {
          return false;
        }
      }

      return true;
    });
  },

  getFilteredHeatingRecords: (): HeatingRecord[] => {
    const { heatingRecords, slabs, filterSteelGrade, filterSlabNo, filterStartDate, filterEndDate } = get();

    let matchedSlabNos: string[] | null = null;
    if (filterSteelGrade) {
      matchedSlabNos = slabs
        .filter((s) => s.steelGrade === filterSteelGrade)
        .map((s) => s.slabNo);
    }

    return heatingRecords.filter((record) => {
      if (matchedSlabNos && !matchedSlabNos.includes(record.slabNo)) {
        return false;
      }

      if (filterSlabNo && !record.slabNo.toLowerCase().includes(filterSlabNo.toLowerCase())) {
        return false;
      }

      if (filterStartDate || filterEndDate) {
        const timeToCheck = record.outTime || record.inTime;
        if (!isDateInRange(timeToCheck, filterStartDate, filterEndDate)) {
          return false;
        }
      }

      return true;
    });
  },

  getFilteredFinishingRecords: (): FinishingRecord[] => {
    const { finishingRecords, slabs, heatingRecords, filterSteelGrade, filterSlabNo, filterStartDate, filterEndDate } = get();

    let matchedSlabNos: string[] | null = null;
    if (filterSteelGrade) {
      matchedSlabNos = slabs
        .filter((s) => s.steelGrade === filterSteelGrade)
        .map((s) => s.slabNo);
    }

    const heatingTimeMap = new Map<string, string>();
    if (filterStartDate || filterEndDate) {
      heatingRecords.forEach((hr) => {
        const time = hr.outTime || hr.inTime;
        if (time) {
          heatingTimeMap.set(hr.slabNo, time);
        }
      });
    }

    return finishingRecords.filter((record) => {
      if (matchedSlabNos && !matchedSlabNos.includes(record.slabNo)) {
        return false;
      }

      if (filterSlabNo && !record.slabNo.toLowerCase().includes(filterSlabNo.toLowerCase())) {
        return false;
      }

      if (filterStartDate || filterEndDate) {
        const heatingTime = heatingTimeMap.get(record.slabNo);
        if (!heatingTime || !isDateInRange(heatingTime, filterStartDate, filterEndDate)) {
          return false;
        }
      }

      return true;
    });
  },

  getFilteredCoilingRecords: (): CoilingRecord[] => {
    const { coilingRecords, slabs, heatingRecords, filterSteelGrade, filterSlabNo, filterStartDate, filterEndDate } = get();

    let matchedSlabNos: string[] | null = null;
    if (filterSteelGrade) {
      matchedSlabNos = slabs
        .filter((s) => s.steelGrade === filterSteelGrade)
        .map((s) => s.slabNo);
    }

    const heatingTimeMap = new Map<string, string>();
    if (filterStartDate || filterEndDate) {
      heatingRecords.forEach((hr) => {
        const time = hr.outTime || hr.inTime;
        if (time) {
          heatingTimeMap.set(hr.slabNo, time);
        }
      });
    }

    return coilingRecords.filter((record) => {
      if (matchedSlabNos && !matchedSlabNos.includes(record.slabNo)) {
        return false;
      }

      if (filterSlabNo && !record.slabNo.toLowerCase().includes(filterSlabNo.toLowerCase())) {
        return false;
      }

      if (filterStartDate || filterEndDate) {
        const heatingTime = heatingTimeMap.get(record.slabNo);
        if (!heatingTime || !isDateInRange(heatingTime, filterStartDate, filterEndDate)) {
          return false;
        }
      }

      return true;
    });
  },

  addEntity: <T extends Entity>(type: EntityType, entity: T) => {
    set((state) => ({
      [type]: [...(state[type] as Entity[]), entity],
    }));
    if (type === 'slabs') {
      savePersistedState({ slabs: get().slabs, currentSlabNo: get().currentSlabNo });
    }
  },

  updateEntity: <T extends Entity>(type: EntityType, id: string, updates: Partial<T>) => {
    set((state) => ({
      [type]: (state[type] as Entity[]).map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
    if (type === 'slabs') {
      savePersistedState({ slabs: get().slabs, currentSlabNo: get().currentSlabNo });
    }
  },

  deleteEntity: (type: EntityType, id: string) => {
    set((state) => ({
      [type]: (state[type] as Entity[]).filter((e) => e.id !== id),
    }));
    if (type === 'slabs') {
      savePersistedState({ slabs: get().slabs, currentSlabNo: get().currentSlabNo });
    }
  },

  reorderSlabs: (fromIndex: number, toIndex: number) => {
    const state = get();
    const pendingSlabs = state.slabs.filter((s) => s.status === 'pending');
    const otherSlabs = state.slabs.filter((s) => s.status !== 'pending');

    if (fromIndex < 0 || fromIndex >= pendingSlabs.length ||
        toIndex < 0 || toIndex >= pendingSlabs.length) {
      return;
    }

    const newPendingSlabs = [...pendingSlabs];
    const [removed] = newPendingSlabs.splice(fromIndex, 1);
    newPendingSlabs.splice(toIndex, 0, removed);

    const newSlabs = [...newPendingSlabs, ...otherSlabs];

    set({ slabs: newSlabs });
    savePersistedState({ slabs: newSlabs, currentSlabNo: get().currentSlabNo });
  },

  chargeSlab: (slabId: string) => {
    set((state) => {
      const newSlabs = state.slabs.map((slab) => {
        if (slab.id === slabId && slab.status === 'pending') {
          return {
            ...slab,
            status: 'charging' as const,
            chargingTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return slab;
      });
      return { slabs: newSlabs };
    });
    savePersistedState({ slabs: get().slabs, currentSlabNo: get().currentSlabNo });
  },
}));
