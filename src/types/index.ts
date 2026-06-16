// 板坯状态枚举
export type SlabStatus = 'pending' | 'charging' | 'heating' | 'rolling' | 'cooling' | 'coiling' | 'inspecting' | 'finished';

// 检验结果枚举
export type InspectionResult = 'qualified' | 'unqualified' | 'pending';

// 板坯实体 - 热轧生产线的原始原料
export interface Slab {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 钢种牌号（如 Q235B、Q345B、SPHC、SS400 等）
  steelGrade: string;
  // 厚度（单位：mm）
  thickness: number;
  // 宽度（单位：mm）
  width: number;
  // 长度（单位：mm）
  length: number;
  // 重量（单位：吨）
  weight: number;
  // 来源（连铸机编号或外购）
  source: string;
  // 生产状态
  status: SlabStatus;
  // 入炉时间
  chargingTime?: string;
}

// 加热记录实体 - 板坯在加热炉中的加热过程数据
export interface HeatingRecord {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 加热炉编号
  furnaceNo: string;
  // 预热段温度（单位：℃）
  preheatTemp: number;
  // 加热段温度（单位：℃）
  heatingTemp: number;
  // 均热段温度（单位：℃）
  soakingTemp: number;
  // 出炉温度（单位：℃）
  dischargeTemp: number;
  // 入炉时间
  inTime: string;
  // 出炉时间
  outTime?: string;
  // 加热时长（单位：分钟）
  heatingDuration: number;
}

// 除鳞记录实体 - 高压水除鳞工艺参数记录
export interface DescalingRecord {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 除鳞水压力（单位：MPa）
  waterPressure: number;
  // 除鳞水流量（单位：m³/h）
  waterFlow: number;
  // 除鳞次数
  descalingCount: number;
  // 记录时间
  recordTime: string;
}

// 粗轧道次实体 - 粗轧机各道次压下参数
export interface RoughingPass {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 道次号（从1开始）
  passNo: number;
  // 入口厚度（单位：mm）
  inletThickness: number;
  // 出口厚度（单位：mm）
  outletThickness: number;
  // 压下量（单位：mm）
  reduction: number;
  // 轧制力（单位：kN）
  rollingForce: number;
  // 轧制速度（单位：m/s）
  rollingSpeed: number;
}

// 精轧记录实体 - 精轧机组终轧参数与板形质量
export interface FinishingRecord {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 终轧温度（单位：℃）
  finishingTemp: number;
  // 头部厚度（单位：mm）
  headThickness: number;
  // 中部厚度（单位：mm）
  midThickness: number;
  // 尾部厚度（单位：mm）
  tailThickness: number;
  // 凸度（单位：μm）
  crown: number;
  // 楔形（单位：μm）
  wedge: number;
  // 平直度（单位：I单位）
  flatness: number;
}

// 冷却记录实体 - 层流冷却工艺参数
export interface CoolingRecord {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 冷却模式（如：前段集中冷却、均匀冷却、后段冷却等）
  coolingMode: string;
  // 冷却水量（单位：m³/h）
  waterVolume: number;
  // 冷却速率（单位：℃/s）
  coolingRate: number;
  // 冷却前温度（单位：℃）
  preCoolingTemp: number;
  // 冷却后温度（单位：℃）
  postCoolingTemp: number;
}

// 卷取记录实体 - 卷取打捆工艺与重量数据
export interface CoilingRecord {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 钢卷编号
  coilNo: string;
  // 卷取温度（单位：℃）
  coilingTemp: number;
  // 卷取张力（单位：kN）
  coilingTension: number;
  // 卷筒直径（单位：mm）
  drumDiameter: number;
  // 打捆道数
  strappingCount: number;
  // 净重（单位：吨）
  netWeight: number;
  // 毛重（单位：吨）
  grossWeight: number;
}

// 性能检验记录实体 - 力学性能检验结果
export interface InspectionRecord {
  // 唯一标识
  id: string;
  // 板坯编号
  slabNo: string;
  // 试样编号
  sampleNo: string;
  // 取样位置（头部、中部、尾部）
  samplePosition: string;
  // 屈服强度（单位：MPa）
  yieldStrength: number;
  // 抗拉强度（单位：MPa）
  tensileStrength: number;
  // 伸长率（单位：%）
  elongation: number;
  // 冲击功（单位：J）
  impactEnergy: number;
  // 检验结果
  result: InspectionResult;
  // 检验员
  inspector: string;
  // 检验时间
  inspectTime: string;
}
