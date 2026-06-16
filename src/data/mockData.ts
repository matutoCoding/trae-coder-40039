// 热轧生产线Mock数据
// 数据符合实际轧钢工艺参数范围，包含8种实体各15条记录

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

// 常用钢种列表
const STEEL_GRADES = ['Q235B', 'Q345B', 'SPHC', 'SS400', 'Q355B', 'Q235A', 'DC01', 'DC03'];

// 板坯来源
export const mockSlabs: Slab[] = [
  { id: 'slab-001', slabNo: 'PB240617001', steelGrade: 'Q235B', thickness: 220, width: 1250, length: 8500, weight: 18.350, source: '连铸机1号', status: 'finished', chargingTime: '2026-06-17 08:15:00' },
  { id: 'slab-002', slabNo: 'PB240617002', steelGrade: 'Q345B', thickness: 230, width: 1500, length: 9200, weight: 24.960, source: '连铸机2号', status: 'finished', chargingTime: '2026-06-17 08:32:00' },
  { id: 'slab-003', slabNo: 'PB240617003', steelGrade: 'SPHC', thickness: 200, width: 1080, length: 7800, weight: 13.240, source: '连铸机1号', status: 'finished', chargingTime: '2026-06-17 08:50:00' },
  { id: 'slab-004', slabNo: 'PB240617004', steelGrade: 'SS400', thickness: 250, width: 1600, length: 10500, weight: 32.970, source: '外购', status: 'finished', chargingTime: '2026-06-17 09:10:00' },
  { id: 'slab-005', slabNo: 'PB240617005', steelGrade: 'Q235B', thickness: 220, width: 1350, length: 8800, weight: 20.520, source: '连铸机1号', status: 'finished', chargingTime: '2026-06-17 09:35:00' },
  { id: 'slab-006', slabNo: 'PB240617006', steelGrade: 'Q355B', thickness: 240, width: 1450, length: 9500, weight: 25.980, source: '连铸机2号', status: 'inspecting', chargingTime: '2026-06-17 10:02:00' },
  { id: 'slab-007', slabNo: 'PB240617007', steelGrade: 'Q235A', thickness: 210, width: 1150, length: 8200, weight: 15.540, source: '连铸机1号', status: 'coiling', chargingTime: '2026-06-17 10:28:00' },
  { id: 'slab-008', slabNo: 'PB240617008', steelGrade: 'DC01', thickness: 190, width: 1000, length: 7500, weight: 11.180, source: '外购', status: 'cooling', chargingTime: '2026-06-17 10:55:00' },
  { id: 'slab-009', slabNo: 'PB240617009', steelGrade: 'SPHC', thickness: 200, width: 1200, length: 8600, weight: 16.200, source: '连铸机2号', status: 'rolling', chargingTime: '2026-06-17 11:20:00' },
  { id: 'slab-010', slabNo: 'PB240617010', steelGrade: 'Q345B', thickness: 230, width: 1400, length: 9000, weight: 22.740, source: '连铸机1号', status: 'heating', chargingTime: '2026-06-17 11:45:00' },
  { id: 'slab-011', slabNo: 'PB240617011', steelGrade: 'Q235B', thickness: 220, width: 1300, length: 8400, weight: 18.820, source: '连铸机2号', status: 'charging', chargingTime: '2026-06-17 12:10:00' },
  { id: 'slab-012', slabNo: 'PB240617012', steelGrade: 'SS400', thickness: 240, width: 1500, length: 9800, weight: 27.700, source: '连铸机1号', status: 'pending' },
  { id: 'slab-013', slabNo: 'PB240617013', steelGrade: 'DC03', thickness: 180, width: 1050, length: 7200, weight: 10.680, source: '外购', status: 'pending' },
  { id: 'slab-014', slabNo: 'PB240617014', steelGrade: 'Q355B', thickness: 250, width: 1550, length: 10000, weight: 30.420, source: '连铸机2号', status: 'pending' },
  { id: 'slab-015', slabNo: 'PB240617015', steelGrade: 'SPHC', thickness: 210, width: 1180, length: 8000, weight: 15.540, source: '连铸机1号', status: 'pending' },
];

// 加热记录
export const mockHeatingRecords: HeatingRecord[] = [
  { id: 'heat-001', slabNo: 'PB240617001', furnaceNo: '加热炉1号', preheatTemp: 860, heatingTemp: 1180, soakingTemp: 1240, dischargeTemp: 1225, inTime: '2026-06-17 08:15:00', outTime: '2026-06-17 10:05:00', heatingDuration: 110 },
  { id: 'heat-002', slabNo: 'PB240617002', furnaceNo: '加热炉2号', preheatTemp: 880, heatingTemp: 1200, soakingTemp: 1255, dischargeTemp: 1238, inTime: '2026-06-17 08:32:00', outTime: '2026-06-17 10:28:00', heatingDuration: 116 },
  { id: 'heat-003', slabNo: 'PB240617003', furnaceNo: '加热炉1号', preheatTemp: 840, heatingTemp: 1160, soakingTemp: 1225, dischargeTemp: 1210, inTime: '2026-06-17 08:50:00', outTime: '2026-06-17 10:38:00', heatingDuration: 108 },
  { id: 'heat-004', slabNo: 'PB240617004', furnaceNo: '加热炉3号', preheatTemp: 890, heatingTemp: 1210, soakingTemp: 1265, dischargeTemp: 1248, inTime: '2026-06-17 09:10:00', outTime: '2026-06-17 11:15:00', heatingDuration: 125 },
  { id: 'heat-005', slabNo: 'PB240617005', furnaceNo: '加热炉2号', preheatTemp: 855, heatingTemp: 1175, soakingTemp: 1235, dischargeTemp: 1220, inTime: '2026-06-17 09:35:00', outTime: '2026-06-17 11:32:00', heatingDuration: 117 },
  { id: 'heat-006', slabNo: 'PB240617006', furnaceNo: '加热炉1号', preheatTemp: 875, heatingTemp: 1195, soakingTemp: 1250, dischargeTemp: 1232, inTime: '2026-06-17 10:02:00', outTime: '2026-06-17 11:58:00', heatingDuration: 116 },
  { id: 'heat-007', slabNo: 'PB240617007', furnaceNo: '加热炉3号', preheatTemp: 845, heatingTemp: 1165, soakingTemp: 1230, dischargeTemp: 1215, inTime: '2026-06-17 10:28:00', outTime: '2026-06-17 12:22:00', heatingDuration: 114 },
  { id: 'heat-008', slabNo: 'PB240617008', furnaceNo: '加热炉2号', preheatTemp: 820, heatingTemp: 1140, soakingTemp: 1210, dischargeTemp: 1195, inTime: '2026-06-17 10:55:00', outTime: '2026-06-17 12:42:00', heatingDuration: 107 },
  { id: 'heat-009', slabNo: 'PB240617009', furnaceNo: '加热炉1号', preheatTemp: 835, heatingTemp: 1155, soakingTemp: 1220, dischargeTemp: 1205, inTime: '2026-06-17 11:20:00', outTime: '2026-06-17 13:08:00', heatingDuration: 108 },
  { id: 'heat-010', slabNo: 'PB240617010', furnaceNo: '加热炉3号', preheatTemp: 870, heatingTemp: 1190, soakingTemp: 1248, dischargeTemp: 1230, inTime: '2026-06-17 11:45:00', outTime: undefined, heatingDuration: 95 },
  { id: 'heat-011', slabNo: 'PB240617011', furnaceNo: '加热炉2号', preheatTemp: 850, heatingTemp: 1170, soakingTemp: 1232, dischargeTemp: 1218, inTime: '2026-06-17 12:10:00', outTime: undefined, heatingDuration: 72 },
  { id: 'heat-012', slabNo: 'PB240617012', furnaceNo: '加热炉1号', preheatTemp: 885, heatingTemp: 1205, soakingTemp: 1260, dischargeTemp: 1242, inTime: '2026-06-17 12:35:00', outTime: undefined, heatingDuration: 48 },
  { id: 'heat-013', slabNo: 'PB240617013', furnaceNo: '加热炉3号', preheatTemp: 815, heatingTemp: 1135, soakingTemp: 1205, dischargeTemp: 1190, inTime: '2026-06-17 12:52:00', outTime: undefined, heatingDuration: 31 },
  { id: 'heat-014', slabNo: 'PB240617014', furnaceNo: '加热炉2号', preheatTemp: 895, heatingTemp: 1215, soakingTemp: 1270, dischargeTemp: 1252, inTime: '2026-06-17 13:08:00', outTime: undefined, heatingDuration: 15 },
  { id: 'heat-015', slabNo: 'PB240617015', furnaceNo: '加热炉1号', preheatTemp: 830, heatingTemp: 1150, soakingTemp: 1218, dischargeTemp: 1202, inTime: '2026-06-17 13:25:00', outTime: undefined, heatingDuration: 2 },
];

// 除鳞记录
export const mockDescalingRecords: DescalingRecord[] = [
  { id: 'desc-001', slabNo: 'PB240617001', waterPressure: 18.5, waterFlow: 980, descalingCount: 2, recordTime: '2026-06-17 10:08:00' },
  { id: 'desc-002', slabNo: 'PB240617002', waterPressure: 20.2, waterFlow: 1150, descalingCount: 2, recordTime: '2026-06-17 10:31:00' },
  { id: 'desc-003', slabNo: 'PB240617003', waterPressure: 17.8, waterFlow: 860, descalingCount: 1, recordTime: '2026-06-17 10:41:00' },
  { id: 'desc-004', slabNo: 'PB240617004', waterPressure: 21.0, waterFlow: 1280, descalingCount: 3, recordTime: '2026-06-17 11:18:00' },
  { id: 'desc-005', slabNo: 'PB240617005', waterPressure: 19.2, waterFlow: 1050, descalingCount: 2, recordTime: '2026-06-17 11:35:00' },
  { id: 'desc-006', slabNo: 'PB240617006', waterPressure: 19.8, waterFlow: 1120, descalingCount: 2, recordTime: '2026-06-17 12:01:00' },
  { id: 'desc-007', slabNo: 'PB240617007', waterPressure: 18.0, waterFlow: 920, descalingCount: 2, recordTime: '2026-06-17 12:25:00' },
  { id: 'desc-008', slabNo: 'PB240617008', waterPressure: 16.5, waterFlow: 820, descalingCount: 1, recordTime: '2026-06-17 12:45:00' },
  { id: 'desc-009', slabNo: 'PB240617009', waterPressure: 17.5, waterFlow: 950, descalingCount: 2, recordTime: '2026-06-17 13:11:00' },
  { id: 'desc-010', slabNo: 'PB240617010', waterPressure: 20.5, waterFlow: 1180, descalingCount: 2, recordTime: '2026-06-17 13:35:00' },
  { id: 'desc-011', slabNo: 'PB240617011', waterPressure: 18.8, waterFlow: 1000, descalingCount: 2, recordTime: '2026-06-17 13:58:00' },
  { id: 'desc-012', slabNo: 'PB240617012', waterPressure: 21.5, waterFlow: 1320, descalingCount: 3, recordTime: '2026-06-17 14:20:00' },
  { id: 'desc-013', slabNo: 'PB240617013', waterPressure: 16.0, waterFlow: 780, descalingCount: 1, recordTime: '2026-06-17 14:38:00' },
  { id: 'desc-014', slabNo: 'PB240617014', waterPressure: 20.8, waterFlow: 1220, descalingCount: 2, recordTime: '2026-06-17 14:55:00' },
  { id: 'desc-015', slabNo: 'PB240617015', waterPressure: 17.2, waterFlow: 890, descalingCount: 2, recordTime: '2026-06-17 15:12:00' },
];

// 粗轧道次（每块板坯取第1、3、5道次作为示例，共15条）
export const mockRoughingPasses: RoughingPass[] = [
  { id: 'rough-001', slabNo: 'PB240617001', passNo: 1, inletThickness: 220, outletThickness: 175, reduction: 45, rollingForce: 22500, rollingSpeed: 2.15 },
  { id: 'rough-002', slabNo: 'PB240617001', passNo: 3, inletThickness: 135, outletThickness: 98, reduction: 37, rollingForce: 19800, rollingSpeed: 2.68 },
  { id: 'rough-003', slabNo: 'PB240617001', passNo: 5, inletThickness: 72, outletThickness: 48, reduction: 24, rollingForce: 15600, rollingSpeed: 3.25 },
  { id: 'rough-004', slabNo: 'PB240617002', passNo: 1, inletThickness: 230, outletThickness: 182, reduction: 48, rollingForce: 24200, rollingSpeed: 2.08 },
  { id: 'rough-005', slabNo: 'PB240617002', passNo: 3, inletThickness: 142, outletThickness: 102, reduction: 40, rollingForce: 21500, rollingSpeed: 2.55 },
  { id: 'rough-006', slabNo: 'PB240617002', passNo: 5, inletThickness: 75, outletThickness: 50, reduction: 25, rollingForce: 16800, rollingSpeed: 3.12 },
  { id: 'rough-007', slabNo: 'PB240617003', passNo: 1, inletThickness: 200, outletThickness: 160, reduction: 40, rollingForce: 18500, rollingSpeed: 2.35 },
  { id: 'rough-008', slabNo: 'PB240617003', passNo: 3, inletThickness: 125, outletThickness: 92, reduction: 33, rollingForce: 16200, rollingSpeed: 2.85 },
  { id: 'rough-009', slabNo: 'PB240617003', passNo: 5, inletThickness: 68, outletThickness: 45, reduction: 23, rollingForce: 13500, rollingSpeed: 3.40 },
  { id: 'rough-010', slabNo: 'PB240617004', passNo: 1, inletThickness: 250, outletThickness: 198, reduction: 52, rollingForce: 28500, rollingSpeed: 1.92 },
  { id: 'rough-011', slabNo: 'PB240617004', passNo: 3, inletThickness: 155, outletThickness: 112, reduction: 43, rollingForce: 25200, rollingSpeed: 2.42 },
  { id: 'rough-012', slabNo: 'PB240617004', passNo: 5, inletThickness: 82, outletThickness: 55, reduction: 27, rollingForce: 19200, rollingSpeed: 2.98 },
  { id: 'rough-013', slabNo: 'PB240617005', passNo: 1, inletThickness: 220, outletThickness: 178, reduction: 42, rollingForce: 21800, rollingSpeed: 2.22 },
  { id: 'rough-014', slabNo: 'PB240617005', passNo: 3, inletThickness: 140, outletThickness: 105, reduction: 35, rollingForce: 18900, rollingSpeed: 2.72 },
  { id: 'rough-015', slabNo: 'PB240617005', passNo: 5, inletThickness: 78, outletThickness: 52, reduction: 26, rollingForce: 15100, rollingSpeed: 3.18 },
];

// 精轧记录
export const mockFinishingRecords: FinishingRecord[] = [
  { id: 'fin-001', slabNo: 'PB240617001', finishingTemp: 865, headThickness: 3.02, midThickness: 3.00, tailThickness: 2.98, crown: 38, wedge: 12, flatness: 28 },
  { id: 'fin-002', slabNo: 'PB240617002', finishingTemp: 852, headThickness: 5.85, midThickness: 5.82, tailThickness: 5.80, crown: 45, wedge: 18, flatness: 35 },
  { id: 'fin-003', slabNo: 'PB240617003', finishingTemp: 878, headThickness: 2.52, midThickness: 2.50, tailThickness: 2.48, crown: 32, wedge: 8, flatness: 22 },
  { id: 'fin-004', slabNo: 'PB240617004', finishingTemp: 845, headThickness: 8.05, midThickness: 8.00, tailThickness: 7.96, crown: 55, wedge: 22, flatness: 42 },
  { id: 'fin-005', slabNo: 'PB240617005', finishingTemp: 860, headThickness: 4.28, midThickness: 4.25, tailThickness: 4.22, crown: 42, wedge: 15, flatness: 32 },
  { id: 'fin-006', slabNo: 'PB240617006', finishingTemp: 848, headThickness: 6.52, midThickness: 6.50, tailThickness: 6.48, crown: 48, wedge: 16, flatness: 38 },
  { id: 'fin-007', slabNo: 'PB240617007', finishingTemp: 872, headThickness: 3.56, midThickness: 3.55, tailThickness: 3.52, crown: 36, wedge: 11, flatness: 26 },
  { id: 'fin-008', slabNo: 'PB240617008', finishingTemp: 885, headThickness: 1.82, midThickness: 1.80, tailThickness: 1.78, crown: 28, wedge: 6, flatness: 18 },
  { id: 'fin-009', slabNo: 'PB240617009', finishingTemp: 870, headThickness: 2.85, midThickness: 2.82, tailThickness: 2.80, crown: 35, wedge: 10, flatness: 25 },
  { id: 'fin-010', slabNo: 'PB240617010', finishingTemp: 855, headThickness: 5.25, midThickness: 5.22, tailThickness: 5.20, crown: 44, wedge: 17, flatness: 34 },
  { id: 'fin-011', slabNo: 'PB240617011', finishingTemp: 862, headThickness: 3.85, midThickness: 3.82, tailThickness: 3.80, crown: 40, wedge: 14, flatness: 30 },
  { id: 'fin-012', slabNo: 'PB240617012', finishingTemp: 842, headThickness: 7.50, midThickness: 7.48, tailThickness: 7.45, crown: 52, wedge: 20, flatness: 40 },
  { id: 'fin-013', slabNo: 'PB240617013', finishingTemp: 882, headThickness: 1.55, midThickness: 1.52, tailThickness: 1.50, crown: 25, wedge: 5, flatness: 15 },
  { id: 'fin-014', slabNo: 'PB240617014', finishingTemp: 850, headThickness: 6.85, midThickness: 6.82, tailThickness: 6.80, crown: 50, wedge: 19, flatness: 36 },
  { id: 'fin-015', slabNo: 'PB240617015', finishingTemp: 875, headThickness: 2.75, midThickness: 2.72, tailThickness: 2.70, crown: 34, wedge: 9, flatness: 24 },
];

// 冷却记录
export const mockCoolingRecords: CoolingRecord[] = [
  { id: 'cool-001', slabNo: 'PB240617001', coolingMode: '均匀冷却', waterVolume: 3200, coolingRate: 28.5, preCoolingTemp: 865, postCoolingTemp: 625 },
  { id: 'cool-002', slabNo: 'PB240617002', coolingMode: '后段冷却', waterVolume: 2800, coolingRate: 22.3, preCoolingTemp: 852, postCoolingTemp: 648 },
  { id: 'cool-003', slabNo: 'PB240617003', coolingMode: '前段集中冷却', waterVolume: 4100, coolingRate: 35.2, preCoolingTemp: 878, postCoolingTemp: 595 },
  { id: 'cool-004', slabNo: 'PB240617004', coolingMode: '均匀冷却', waterVolume: 3500, coolingRate: 25.8, preCoolingTemp: 845, postCoolingTemp: 638 },
  { id: 'cool-005', slabNo: 'PB240617005', coolingMode: '前段集中冷却', waterVolume: 3800, coolingRate: 30.5, preCoolingTemp: 860, postCoolingTemp: 612 },
  { id: 'cool-006', slabNo: 'PB240617006', coolingMode: '后段冷却', waterVolume: 2600, coolingRate: 20.2, preCoolingTemp: 848, postCoolingTemp: 658 },
  { id: 'cool-007', slabNo: 'PB240617007', coolingMode: '均匀冷却', waterVolume: 3000, coolingRate: 26.7, preCoolingTemp: 872, postCoolingTemp: 628 },
  { id: 'cool-008', slabNo: 'PB240617008', coolingMode: '前段集中冷却', waterVolume: 4500, coolingRate: 38.0, preCoolingTemp: 885, postCoolingTemp: 578 },
  { id: 'cool-009', slabNo: 'PB240617009', coolingMode: '均匀冷却', waterVolume: 3300, coolingRate: 29.2, preCoolingTemp: 870, postCoolingTemp: 620 },
  { id: 'cool-010', slabNo: 'PB240617010', coolingMode: '后段冷却', waterVolume: 2900, coolingRate: 23.5, preCoolingTemp: 855, postCoolingTemp: 642 },
  { id: 'cool-011', slabNo: 'PB240617011', coolingMode: '前段集中冷却', waterVolume: 3900, coolingRate: 31.8, preCoolingTemp: 862, postCoolingTemp: 608 },
  { id: 'cool-012', slabNo: 'PB240617012', coolingMode: '均匀冷却', waterVolume: 3600, coolingRate: 27.0, preCoolingTemp: 842, postCoolingTemp: 645 },
  { id: 'cool-013', slabNo: 'PB240617013', coolingMode: '前段集中冷却', waterVolume: 4300, coolingRate: 36.5, preCoolingTemp: 882, postCoolingTemp: 585 },
  { id: 'cool-014', slabNo: 'PB240617014', coolingMode: '后段冷却', waterVolume: 2700, coolingRate: 21.5, preCoolingTemp: 850, postCoolingTemp: 652 },
  { id: 'cool-015', slabNo: 'PB240617015', coolingMode: '均匀冷却', waterVolume: 3100, coolingRate: 27.8, preCoolingTemp: 875, postCoolingTemp: 622 },
];

// 卷取记录
export const mockCoilingRecords: CoilingRecord[] = [
  { id: 'coil-001', slabNo: 'PB240617001', coilNo: 'JC240617001', coilingTemp: 625, coilingTension: 95, drumDiameter: 762, strappingCount: 3, netWeight: 18.120, grossWeight: 18.480 },
  { id: 'coil-002', slabNo: 'PB240617002', coilNo: 'JC240617002', coilingTemp: 648, coilingTension: 118, drumDiameter: 762, strappingCount: 4, netWeight: 24.680, grossWeight: 25.120 },
  { id: 'coil-003', slabNo: 'PB240617003', coilNo: 'JC240617003', coilingTemp: 595, coilingTension: 82, drumDiameter: 762, strappingCount: 3, netWeight: 13.050, grossWeight: 13.380 },
  { id: 'coil-004', slabNo: 'PB240617004', coilNo: 'JC240617004', coilingTemp: 638, coilingTension: 135, drumDiameter: 762, strappingCount: 5, netWeight: 32.550, grossWeight: 33.080 },
  { id: 'coil-005', slabNo: 'PB240617005', coilNo: 'JC240617005', coilingTemp: 612, coilingTension: 102, drumDiameter: 762, strappingCount: 3, netWeight: 20.280, grossWeight: 20.680 },
  { id: 'coil-006', slabNo: 'PB240617006', coilNo: 'JC240617006', coilingTemp: 658, coilingTension: 122, drumDiameter: 762, strappingCount: 4, netWeight: 25.700, grossWeight: 26.180 },
  { id: 'coil-007', slabNo: 'PB240617007', coilNo: 'JC240617007', coilingTemp: 628, coilingTension: 88, drumDiameter: 762, strappingCount: 3, netWeight: 15.320, grossWeight: 15.680 },
  { id: 'coil-008', slabNo: 'PB240617008', coilNo: 'JC240617008', coilingTemp: 578, coilingTension: 72, drumDiameter: 762, strappingCount: 3, netWeight: 11.000, grossWeight: 11.320 },
  { id: 'coil-009', slabNo: 'PB240617009', coilNo: 'JC240617009', coilingTemp: 620, coilingTension: 90, drumDiameter: 762, strappingCount: 3, netWeight: 16.000, grossWeight: 16.380 },
  { id: 'coil-010', slabNo: 'PB240617010', coilNo: 'JC240617010', coilingTemp: 642, coilingTension: 110, drumDiameter: 762, strappingCount: 4, netWeight: 22.480, grossWeight: 22.950 },
  { id: 'coil-011', slabNo: 'PB240617011', coilNo: 'JC240617011', coilingTemp: 608, coilingTension: 98, drumDiameter: 762, strappingCount: 3, netWeight: 18.580, grossWeight: 18.980 },
  { id: 'coil-012', slabNo: 'PB240617012', coilNo: 'JC240617012', coilingTemp: 645, coilingTension: 128, drumDiameter: 762, strappingCount: 5, netWeight: 27.400, grossWeight: 27.920 },
  { id: 'coil-013', slabNo: 'PB240617013', coilNo: 'JC240617013', coilingTemp: 585, coilingTension: 68, drumDiameter: 762, strappingCount: 3, netWeight: 10.500, grossWeight: 10.820 },
  { id: 'coil-014', slabNo: 'PB240617014', coilNo: 'JC240617014', coilingTemp: 652, coilingTension: 130, drumDiameter: 762, strappingCount: 4, netWeight: 30.100, grossWeight: 30.620 },
  { id: 'coil-015', slabNo: 'PB240617015', coilNo: 'JC240617015', coilingTemp: 622, coilingTension: 85, drumDiameter: 762, strappingCount: 3, netWeight: 15.320, grossWeight: 15.700 },
];

// 性能检验记录
export const mockInspectionRecords: InspectionRecord[] = [
  { id: 'insp-001', slabNo: 'PB240617001', sampleNo: 'SY240617001', samplePosition: '中部', yieldStrength: 252, tensileStrength: 412, elongation: 28.5, impactEnergy: 52, result: 'qualified', inspector: '张建国', inspectTime: '2026-06-17 14:25:00' },
  { id: 'insp-002', slabNo: 'PB240617002', sampleNo: 'SY240617002', samplePosition: '头部', yieldStrength: 358, tensileStrength: 518, elongation: 25.2, impactEnergy: 68, result: 'qualified', inspector: '李卫东', inspectTime: '2026-06-17 14:40:00' },
  { id: 'insp-003', slabNo: 'PB240617003', sampleNo: 'SY240617003', samplePosition: '尾部', yieldStrength: 285, tensileStrength: 385, elongation: 32.8, impactEnergy: 45, result: 'qualified', inspector: '王秀兰', inspectTime: '2026-06-17 14:55:00' },
  { id: 'insp-004', slabNo: 'PB240617004', sampleNo: 'SY240617004', samplePosition: '中部', yieldStrength: 265, tensileStrength: 425, elongation: 30.5, impactEnergy: 75, result: 'qualified', inspector: '赵明华', inspectTime: '2026-06-17 15:10:00' },
  { id: 'insp-005', slabNo: 'PB240617005', sampleNo: 'SY240617005', samplePosition: '头部', yieldStrength: 248, tensileStrength: 405, elongation: 27.8, impactEnergy: 48, result: 'qualified', inspector: '张建国', inspectTime: '2026-06-17 15:25:00' },
  { id: 'insp-006', slabNo: 'PB240617006', sampleNo: 'SY240617006', samplePosition: '尾部', yieldStrength: 372, tensileStrength: 535, elongation: 24.5, impactEnergy: 82, result: 'pending', inspector: '李卫东', inspectTime: '2026-06-17 15:40:00' },
  { id: 'insp-007', slabNo: 'PB240617007', sampleNo: 'SY240617007', samplePosition: '中部', yieldStrength: 238, tensileStrength: 398, elongation: 29.2, impactEnergy: 42, result: 'qualified', inspector: '王秀兰', inspectTime: '2026-06-17 15:55:00' },
  { id: 'insp-008', slabNo: 'PB240617008', sampleNo: 'SY240617008', samplePosition: '头部', yieldStrength: 215, tensileStrength: 345, elongation: 36.2, impactEnergy: 58, result: 'qualified', inspector: '赵明华', inspectTime: '2026-06-17 16:10:00' },
  { id: 'insp-009', slabNo: 'PB240617009', sampleNo: 'SY240617009', samplePosition: '尾部', yieldStrength: 278, tensileStrength: 378, elongation: 33.5, impactEnergy: 50, result: 'qualified', inspector: '张建国', inspectTime: '2026-06-17 16:25:00' },
  { id: 'insp-010', slabNo: 'PB240617010', sampleNo: 'SY240617010', samplePosition: '中部', yieldStrength: 348, tensileStrength: 502, elongation: 26.8, impactEnergy: 72, result: 'pending', inspector: '李卫东', inspectTime: '2026-06-17 16:40:00' },
  { id: 'insp-011', slabNo: 'PB240617011', sampleNo: 'SY240617011', samplePosition: '头部', yieldStrength: 255, tensileStrength: 418, elongation: 28.0, impactEnergy: 55, result: 'pending', inspector: '王秀兰', inspectTime: '2026-06-17 16:55:00' },
  { id: 'insp-012', slabNo: 'PB240617012', sampleNo: 'SY240617012', samplePosition: '尾部', yieldStrength: 268, tensileStrength: 432, elongation: 31.5, impactEnergy: 80, result: 'pending', inspector: '赵明华', inspectTime: '2026-06-17 17:10:00' },
  { id: 'insp-013', slabNo: 'PB240617013', sampleNo: 'SY240617013', samplePosition: '中部', yieldStrength: 198, tensileStrength: 328, elongation: 38.5, impactEnergy: 35, result: 'unqualified', inspector: '张建国', inspectTime: '2026-06-17 17:25:00' },
  { id: 'insp-014', slabNo: 'PB240617014', sampleNo: 'SY240617014', samplePosition: '头部', yieldStrength: 365, tensileStrength: 525, elongation: 25.0, impactEnergy: 88, result: 'pending', inspector: '李卫东', inspectTime: '2026-06-17 17:40:00' },
  { id: 'insp-015', slabNo: 'PB240617015', sampleNo: 'SY240617015', samplePosition: '尾部', yieldStrength: 282, tensileStrength: 392, elongation: 32.0, impactEnergy: 48, result: 'pending', inspector: '王秀兰', inspectTime: '2026-06-17 17:55:00' },
];
