// 数字格式化工具函数集合
// 用于轧钢生产数据的统一格式化显示

/**
 * 格式化通用数字
 * @param value 待格式化的数字
 * @param decimals 保留小数位数，默认2位
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals);
}

/**
 * 格式化温度数据（单位：℃）
 * @param value 温度值
 * @returns 带温度单位的格式化字符串
 */
export function formatTemperature(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  // 温度通常保留整数或一位小数
  return `${value.toFixed(0)}℃`;
}

/**
 * 格式化厚度数据（单位：mm）
 * @param value 厚度值
 * @param decimals 保留小数位数，默认3位
 * @returns 带厚度单位的格式化字符串
 */
export function formatThickness(value: number, decimals: number = 3): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(decimals)}mm`;
}

/**
 * 格式化重量数据（单位：吨）
 * @param value 重量值
 * @param decimals 保留小数位数，默认3位
 * @returns 带重量单位的格式化字符串
 */
export function formatWeight(value: number, decimals: number = 3): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(decimals)}t`;
}

/**
 * 格式化长度/宽度数据（单位：mm）
 * @param value 长度或宽度值
 * @returns 带长度单位的格式化字符串
 */
export function formatLength(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  // 长度通常取整数
  return `${value.toFixed(0)}mm`;
}

/**
 * 格式化日期时间
 * @param dateStr 日期字符串或Date对象
 * @param withTime 是否显示时间，默认true
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateStr: string | Date | undefined, withTime: boolean = true): string {
  if (!dateStr) {
    return '--';
  }
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) {
    return '--';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!withTime) {
    return `${year}-${month}-${day}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化时间（仅显示时分秒）
 * @param dateStr 日期字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export function formatTime(dateStr: string | Date | undefined): string {
  if (!dateStr) {
    return '--';
  }
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) {
    return '--';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化时长（分钟转换为时分显示）
 * @param minutes 分钟数
 * @returns 格式化后的时长字符串，如 "2小时30分钟"
 */
export function formatDuration(minutes: number): string {
  if (minutes === null || minutes === undefined || isNaN(minutes) || minutes < 0) {
    return '--';
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins}分钟`;
  }
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
}

/**
 * 格式化轧制力（单位：kN）
 * @param value 轧制力值
 * @returns 带单位的格式化字符串
 */
export function formatForce(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(0)}kN`;
}

/**
 * 格式化速度（单位：m/s）
 * @param value 速度值
 * @param decimals 保留小数位数，默认2位
 * @returns 带单位的格式化字符串
 */
export function formatSpeed(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(decimals)}m/s`;
}

/**
 * 格式化压力（单位：MPa）
 * @param value 压力值
 * @param decimals 保留小数位数，默认1位
 * @returns 带单位的格式化字符串
 */
export function formatPressure(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(decimals)}MPa`;
}

/**
 * 格式化流量（单位：m³/h）
 * @param value 流量值
 * @returns 带单位的格式化字符串
 */
export function formatFlow(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(0)}m³/h`;
}

/**
 * 格式化冷却速率（单位：℃/s）
 * @param value 冷却速率值
 * @param decimals 保留小数位数，默认1位
 * @returns 带单位的格式化字符串
 */
export function formatCoolingRate(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(decimals)}℃/s`;
}

/**
 * 格式化张力（单位：kN）
 * @param value 张力值
 * @returns 带单位的格式化字符串
 */
export function formatTension(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(0)}kN`;
}

/**
 * 格式化强度（单位：MPa）
 * @param value 强度值
 * @returns 带单位的格式化字符串
 */
export function formatStrength(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(0)}MPa`;
}

/**
 * 格式化伸长率（单位：%）
 * @param value 伸长率值
 * @param decimals 保留小数位数，默认1位
 * @returns 带单位的格式化字符串
 */
export function formatElongation(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化冲击功（单位：J）
 * @param value 冲击功值
 * @returns 带单位的格式化字符串
 */
export function formatImpactEnergy(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(0)}J`;
}

/**
 * 格式化百分比数值
 * @param value 百分比值（如 0.85 表示 85%）
 * @param decimals 保留小数位数，默认1位
 * @param isDecimal 输入是否为小数形式，默认true
 * @returns 带百分号的格式化字符串
 */
export function formatPercent(value: number, decimals: number = 1, isDecimal: boolean = true): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  const displayValue = isDecimal ? value * 100 : value;
  return `${displayValue.toFixed(decimals)}%`;
}

/**
 * 将板坯状态转换为中文显示
 * @param status 板坯状态英文标识
 * @returns 中文状态描述
 */
export function formatSlabStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待入炉',
    charging: '入炉中',
    heating: '加热中',
    rolling: '轧制中',
    cooling: '冷却中',
    coiling: '卷取中',
    inspecting: '检验中',
    finished: '已完成',
  };
  return statusMap[status] || status;
}

/**
 * 将检验结果转换为中文显示
 * @param result 检验结果英文标识
 * @returns 中文结果描述
 */
export function formatInspectionResult(result: string): string {
  const resultMap: Record<string, string> = {
    qualified: '合格',
    unqualified: '不合格',
    pending: '待检验',
  };
  return resultMap[result] || result;
}
