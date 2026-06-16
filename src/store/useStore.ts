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

  setCurrentSlabNo: (slabNo: string | null) => void;

  getEntities: <T extends Entity>(type: EntityType) => T[];
  getEntityById: <T extends Entity>(type: EntityType, id: string) => T | undefined;
  getEntitiesBySlabNo: <T extends Entity>(type: EntityType, slabNo: string) => T[];

  addEntity: <T extends Entity>(type: EntityType, entity: T) => void;
  updateEntity: <T extends Entity>(type: EntityType, id: string, updates: Partial<T>) => void;
  deleteEntity: (type: EntityType, id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentSlabNo: null,
  slabs: mockSlabs,
  heatingRecords: mockHeatingRecords,
  descalingRecords: mockDescalingRecords,
  roughingPasses: mockRoughingPasses,
  finishingRecords: mockFinishingRecords,
  coolingRecords: mockCoolingRecords,
  coilingRecords: mockCoilingRecords,
  inspectionRecords: mockInspectionRecords,

  setCurrentSlabNo: (slabNo) => set({ currentSlabNo: slabNo }),

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
    return entities.filter((e) => 'slabNo' in e && e.slabNo === slabNo) as T[];
  },

  addEntity: <T extends Entity>(type: EntityType, entity: T) => {
    set((state) => ({
      [type]: [...(state[type] as Entity[]), entity],
    }));
  },

  updateEntity: <T extends Entity>(type: EntityType, id: string, updates: Partial<T>) => {
    set((state) => ({
      [type]: (state[type] as Entity[]).map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  deleteEntity: (type: EntityType, id: string) => {
    set((state) => ({
      [type]: (state[type] as Entity[]).filter((e) => e.id !== id),
    }));
  },
}));
