import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import SectionCard from '@/components/common/SectionCard';
import {
  ArrowLeft,
  GitCompare,
  Plus,
  X,
  Trash2,
  Thermometer,
  Ruler,
  Coins,
  ShieldCheck,
  Flame,
  BarChart3,
  Search,
  Copy,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type {
  Slab,
  HeatingRecord,
  FinishingRecord,
  CoilingRecord,
  CoolingRecord,
  InspectionRecord,
} from '@/types';
import {
  formatTemperature,
  formatThickness,
  formatStrength,
  formatElongation,
  formatImpactEnergy,
  formatInspectionResult,
  formatNumber,
} from '@/utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  ComposedChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const SLAB_COLORS = [
  { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', fill: '#f97316' },
  { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', fill: '#3b82f6' },
  { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400', fill: '#22c55e' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', fill: '#a855f7' },
];

interface CompareData {
  slab: Slab;
  heating?: HeatingRecord;
  finishing?: FinishingRecord;
  cooling?: CoolingRecord;
  coiling?: CoilingRecord;
  inspection?: InspectionRecord;
}

export default function SlabCompare() {
  const navigate = useNavigate();
  const {
    compareSlabNos,
    slabs,
    addCompareSlab,
    removeCompareSlab,
    clearCompareSlabs,
    getEntitiesBySlabNo,
    setCurrentSlabNo,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const effectiveCompareSlabNos = useMemo(() => {
    return compareSlabNos;
  }, [compareSlabNos]);

  const compareData: CompareData[] = useMemo(() => {
    return effectiveCompareSlabNos
      .map((slabNo, index) => {
        const slab = slabs.find((s) => s.slabNo === slabNo);
        if (!slab) return null;
        const heating = (getEntitiesBySlabNo('heatingRecords', slabNo) as HeatingRecord[])[0];
        const finishing = (getEntitiesBySlabNo('finishingRecords', slabNo) as FinishingRecord[])[0];
        const cooling = (getEntitiesBySlabNo('coolingRecords', slabNo) as CoolingRecord[])[0];
        const coiling = (getEntitiesBySlabNo('coilingRecords', slabNo) as CoilingRecord[])[0];
        const inspection = (getEntitiesBySlabNo('inspectionRecords', slabNo) as InspectionRecord[])[0];
        return { slab, heating, finishing, cooling, coiling, inspection, colorIndex: index };
      })
      .filter(Boolean) as (CompareData & { colorIndex: number })[];
  }, [effectiveCompareSlabNos, slabs, getEntitiesBySlabNo]);

  const availableSlabs = useMemo(() => {
    return slabs.filter((s) => !effectiveCompareSlabNos.includes(s.slabNo));
  }, [slabs, effectiveCompareSlabNos]);

  const heatingChartData = useMemo(() => {
    return compareData.map((d) => ({
      slabNo: d.slab.slabNo.slice(-5),
      preheatTemp: d.heating?.preheatTemp || 0,
      heatingTemp: d.heating?.heatingTemp || 0,
      soakingTemp: d.heating?.soakingTemp || 0,
      dischargeTemp: d.heating?.dischargeTemp || 0,
    }));
  }, [compareData]);

  const thicknessChartData = useMemo(() => {
    return compareData.map((d) => {
      const avgThickness = d.finishing
        ? (d.finishing.headThickness + d.finishing.midThickness + d.finishing.tailThickness) / 3
        : 0;
      const targetThickness = d.slab.thickness > 200 ? d.slab.thickness / 70 : d.slab.thickness / 60;
      return {
        slabNo: d.slab.slabNo.slice(-5),
        headThickness: d.finishing?.headThickness || 0,
        midThickness: d.finishing?.midThickness || 0,
        tailThickness: d.finishing?.tailThickness || 0,
        targetThickness: Number(targetThickness.toFixed(2)),
        avgThickness: Number(avgThickness.toFixed(3)),
      };
    });
  }, [compareData]);

  const coilingChartData = useMemo(() => {
    return compareData.map((d) => ({
      slabNo: d.slab.slabNo.slice(-5),
      coilingTemp: d.coiling?.coilingTemp || 0,
      targetTemp: 620,
      toleranceUpper: 640,
      toleranceLower: 600,
    }));
  }, [compareData]);

  const performanceChartData = useMemo(() => {
    return compareData.map((d) => ({
      slabNo: d.slab.slabNo.slice(-5),
      yieldStrength: d.inspection?.yieldStrength || 0,
      tensileStrength: d.inspection?.tensileStrength || 0,
      elongation: d.inspection?.elongation || 0,
      yieldStandard: 235,
      tensileStandard: 370,
      elongationStandard: 26,
    }));
  }, [compareData]);

  const tableRows = useMemo(() => {
    type TableRow = {
      label: string;
      unit: string;
      values: (string | number | null)[];
      isNumeric: boolean;
      higherIsBetter: boolean;
    };
    const rows: TableRow[] = [
      {
        label: '钢种',
        unit: '',
        values: compareData.map((d) => d.slab.steelGrade),
        isNumeric: false,
        higherIsBetter: false,
      },
      {
        label: '规格',
        unit: '',
        values: compareData.map((d) => `${d.slab.thickness}×${d.slab.width}mm`),
        isNumeric: false,
        higherIsBetter: false,
      },
      {
        label: '出炉温度',
        unit: '℃',
        values: compareData.map((d) => d.heating?.dischargeTemp || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '终轧温度',
        unit: '℃',
        values: compareData.map((d) => d.finishing?.finishingTemp || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '平均厚度',
        unit: 'mm',
        values: compareData.map((d) =>
          d.finishing
            ? Number(((d.finishing.headThickness + d.finishing.midThickness + d.finishing.tailThickness) / 3).toFixed(3))
            : null
        ),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '凸度',
        unit: 'μm',
        values: compareData.map((d) => d.finishing?.crown || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '卷取温度',
        unit: '℃',
        values: compareData.map((d) => d.coiling?.coilingTemp || null),
        isNumeric: true,
        higherIsBetter: false,
      },
      {
        label: '屈服强度',
        unit: 'MPa',
        values: compareData.map((d) => d.inspection?.yieldStrength || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '抗拉强度',
        unit: 'MPa',
        values: compareData.map((d) => d.inspection?.tensileStrength || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '延伸率',
        unit: '%',
        values: compareData.map((d) => d.inspection?.elongation || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '冲击功',
        unit: 'J',
        values: compareData.map((d) => d.inspection?.impactEnergy || null),
        isNumeric: true,
        higherIsBetter: true,
      },
      {
        label: '检验结果',
        unit: '',
        values: compareData.map((d) => d.inspection?.result || 'pending'),
        isNumeric: false,
        higherIsBetter: false,
      },
    ];

    return rows.map((row) => {
      const numericValues = row.values.filter((v): v is number => typeof v === 'number');
      let bestIndex = -1;
      let worstIndex = -1;

      if (row.isNumeric && numericValues.length > 1) {
        const best = row.higherIsBetter ? Math.max(...numericValues) : Math.min(...numericValues);
        const worst = row.higherIsBetter ? Math.min(...numericValues) : Math.max(...numericValues);
        bestIndex = row.values.indexOf(best);
        worstIndex = row.values.indexOf(worst);
        if (bestIndex === worstIndex) {
          worstIndex = -1;
        }
      }

      const avg = numericValues.length > 0
        ? Number((numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2))
        : null;

      return { ...row, bestIndex, worstIndex, avg };
    });
  }, [compareData]);

  const formatCellValue = (row: typeof tableRows[0], value: unknown) => {
    if (value === null || value === undefined) return '--';
    if (row.label === '检验结果') {
      return formatInspectionResult(String(value));
    }
    if (!row.isNumeric) return String(value);
    const num = Number(value);
    if (row.label === '出炉温度' || row.label === '终轧温度' || row.label === '卷取温度') {
      return formatTemperature(num);
    }
    if (row.label === '平均厚度') {
      return formatThickness(num, 3);
    }
    if (row.label === '凸度') {
      return `${num.toFixed(0)}μm`;
    }
    if (row.label === '屈服强度' || row.label === '抗拉强度') {
      return formatStrength(num);
    }
    if (row.label === '延伸率') {
      return formatElongation(num);
    }
    if (row.label === '冲击功') {
      return formatImpactEnergy(num);
    }
    return formatNumber(num);
  };

  const groupInfo = useMemo(() => {
    if (compareData.length === 0) return null;
    const steelGrades = [...new Set(compareData.map((d) => d.slab.steelGrade))];
    const thicknesses = compareData.map((d) => d.slab.thickness);
    const widths = compareData.map((d) => d.slab.width);
    const maxThickness = Math.max(...thicknesses);
    const minThickness = Math.min(...thicknesses);
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);
    const sameSteelGrade = steelGrades.length === 1;
    const sameSpec = maxThickness - minThickness <= 5 && maxWidth - minWidth <= 50;

    let steelGradeLabel: string;
    let steelGradeColor: string;
    if (sameSteelGrade) {
      steelGradeLabel = `同钢种对比：${steelGrades[0]}`;
      steelGradeColor = 'bg-green-500/15 border-green-500/30 text-green-400';
    } else {
      steelGradeLabel = `跨钢种对比：${steelGrades.join(' / ')}`;
      steelGradeColor = 'bg-orange-500/15 border-orange-500/30 text-orange-400';
    }

    let specLabel: string;
    let specColor: string;
    if (sameSpec) {
      specLabel = `同规格对比：${minThickness}~${maxThickness}×${minWidth}~${maxWidth}mm`;
      specColor = 'bg-green-500/15 border-green-500/30 text-green-400';
    } else {
      specLabel = `跨规格对比：${minThickness}~${maxThickness}×${minWidth}~${maxWidth}mm`;
      specColor = 'bg-orange-500/15 border-orange-500/30 text-orange-400';
    }

    return { steelGradeLabel, steelGradeColor, specLabel, specColor };
  }, [compareData]);

  interface DeviationRow {
    rank: number;
    slabNo: string;
    steelGrade: string;
    tempDeviation: number;
    thicknessDeviation: number;
    performanceDeviation: number;
    overallDeviation: number;
    rating: string;
    ratingColor: string;
  }

  const deviationRankings = useMemo((): DeviationRow[] => {
    if (compareData.length < 2) return [];

    const calcDeviationPct = (values: (number | null | undefined)[]): number[] => {
      const numeric = values.filter((v): v is number => typeof v === 'number' && v > 0);
      if (numeric.length < 2) return values.map(() => 0);
      const avg = numeric.reduce((a, b) => a + b, 0) / numeric.length;
      return values.map((v) => {
        if (typeof v !== 'number' || v <= 0) return 0;
        return (Math.abs(v - avg) / avg) * 100;
      });
    };

    const dischargeTemps = compareData.map((d) => d.heating?.dischargeTemp);
    const finishingTemps = compareData.map((d) => d.finishing?.finishingTemp);
    const coilingTemps = compareData.map((d) => d.coiling?.coilingTemp);
    const avgThicknesses = compareData.map((d) =>
      d.finishing ? (d.finishing.headThickness + d.finishing.midThickness + d.finishing.tailThickness) / 3 : null
    );
    const crowns = compareData.map((d) => d.finishing?.crown);
    const yieldStrengths = compareData.map((d) => d.inspection?.yieldStrength);
    const tensileStrengths = compareData.map((d) => d.inspection?.tensileStrength);
    const elongations = compareData.map((d) => d.inspection?.elongation);
    const impactEnergies = compareData.map((d) => d.inspection?.impactEnergy);

    const dischargeDev = calcDeviationPct(dischargeTemps);
    const finishingDev = calcDeviationPct(finishingTemps);
    const coilingDev = calcDeviationPct(coilingTemps);
    const thicknessDev = calcDeviationPct(avgThicknesses);
    const crownDev = calcDeviationPct(crowns);
    const yieldDev = calcDeviationPct(yieldStrengths);
    const tensileDev = calcDeviationPct(tensileStrengths);
    const elongationDev = calcDeviationPct(elongations);
    const impactDev = calcDeviationPct(impactEnergies);

    const rows: Omit<DeviationRow, 'rank'>[] = compareData.map((d, i) => {
      const tempDevArr = [dischargeDev[i], finishingDev[i], coilingDev[i]].filter((v) => v > 0);
      const tempDev = tempDevArr.length > 0 ? tempDevArr.reduce((a, b) => a + b, 0) / tempDevArr.length : 0;

      const thickDevArr = [thicknessDev[i], crownDev[i]].filter((v) => v > 0);
      const thickDev = thickDevArr.length > 0 ? thickDevArr.reduce((a, b) => a + b, 0) / thickDevArr.length : 0;

      const perfDevArr = [yieldDev[i], tensileDev[i], elongationDev[i], impactDev[i]].filter((v) => v > 0);
      const perfDev = perfDevArr.length > 0 ? perfDevArr.reduce((a, b) => a + b, 0) / perfDevArr.length : 0;

      const allDevArr = [tempDev, thickDev, perfDev].filter((v) => v > 0);
      const overallDev = allDevArr.length > 0 ? allDevArr.reduce((a, b) => a + b, 0) / allDevArr.length : 0;

      let rating: string;
      let ratingColor: string;
      if (overallDev < 1.5) {
        rating = '★★★★★ 最稳定';
        ratingColor = 'text-green-400';
      } else if (overallDev < 3) {
        rating = '★★★★';
        ratingColor = 'text-blue-400';
      } else if (overallDev < 5) {
        rating = '★★★';
        ratingColor = 'text-orange-400';
      } else {
        rating = '★★';
        ratingColor = 'text-red-400';
      }

      return {
        slabNo: d.slab.slabNo,
        steelGrade: d.slab.steelGrade,
        tempDeviation: Number(tempDev.toFixed(2)),
        thicknessDeviation: Number(thickDev.toFixed(2)),
        performanceDeviation: Number(perfDev.toFixed(2)),
        overallDeviation: Number(overallDev.toFixed(2)),
        rating,
        ratingColor,
      };
    });

    rows.sort((a, b) => a.overallDeviation - b.overallDeviation);

    return rows.map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [compareData]);

  const radarData = useMemo(() => {
    if (compareData.length < 2) return [];

    const calcDeviationPct = (values: (number | null | undefined)[]): number[] => {
      const numeric = values.filter((v): v is number => typeof v === 'number' && v > 0);
      if (numeric.length < 2) return values.map(() => 0);
      const avg = numeric.reduce((a, b) => a + b, 0) / numeric.length;
      return values.map((v) => {
        if (typeof v !== 'number' || v <= 0) return 0;
        return (Math.abs(v - avg) / avg) * 100;
      });
    };

    const dischargeTemps = compareData.map((d) => d.heating?.dischargeTemp);
    const finishingTemps = compareData.map((d) => d.finishing?.finishingTemp);
    const coilingTemps = compareData.map((d) => d.coiling?.coilingTemp);
    const avgThicknesses = compareData.map((d) =>
      d.finishing ? (d.finishing.headThickness + d.finishing.midThickness + d.finishing.tailThickness) / 3 : null
    );
    const crowns = compareData.map((d) => d.finishing?.crown);
    const yieldStrengths = compareData.map((d) => d.inspection?.yieldStrength);
    const tensileStrengths = compareData.map((d) => d.inspection?.tensileStrength);
    const elongations = compareData.map((d) => d.inspection?.elongation);
    const impactEnergies = compareData.map((d) => d.inspection?.impactEnergy);

    const dischargeDev = calcDeviationPct(dischargeTemps);
    const finishingDev = calcDeviationPct(finishingTemps);
    const coilingDev = calcDeviationPct(coilingTemps);
    const thicknessDev = calcDeviationPct(avgThicknesses);
    const crownDev = calcDeviationPct(crowns);
    const yieldDev = calcDeviationPct(yieldStrengths);
    const tensileDev = calcDeviationPct(tensileStrengths);
    const elongationDev = calcDeviationPct(elongations);
    const impactDev = calcDeviationPct(impactEnergies);

    const slabScores = compareData.map((_, i) => {
      const tempDevArr = [dischargeDev[i], finishingDev[i], coilingDev[i]].filter((v) => v > 0);
      const tempAvg = tempDevArr.length > 0 ? tempDevArr.reduce((a, b) => a + b, 0) / tempDevArr.length : 10;
      const tempScore = Math.min(100, Math.max(0, 100 - tempAvg * 10));

      const thickDevArr = [thicknessDev[i], crownDev[i]].filter((v) => v > 0);
      const thickAvg = thickDevArr.length > 0 ? thickDevArr.reduce((a, b) => a + b, 0) / thickDevArr.length : 10;
      const thickScore = Math.min(100, Math.max(0, 100 - thickAvg * 10));

      const perfDevArr = [yieldDev[i], tensileDev[i], elongationDev[i], impactDev[i]].filter((v) => v > 0);
      const perfAvg = perfDevArr.length > 0 ? perfDevArr.reduce((a, b) => a + b, 0) / perfDevArr.length : 10;
      const perfScore = Math.min(100, Math.max(0, 100 - perfAvg * 10));

      const qualifiedBonus = compareData[i].inspection?.result === 'qualified' ? 10 : 0;
      const overallScore = Math.min(100, (tempScore + thickScore + perfScore) / 3 + qualifiedBonus);

      return {
        tempScore: Number(tempScore.toFixed(1)),
        thickScore: Number(thickScore.toFixed(1)),
        perfScore: Number(perfScore.toFixed(1)),
        overallScore: Number(overallScore.toFixed(1)),
      };
    });

    const dimensions = [
      { key: 'tempScore', label: '温度稳定性' },
      { key: 'thickScore', label: '厚度精度' },
      { key: 'perfScore', label: '力学性能' },
      { key: 'overallScore', label: '综合合格率' },
    ];

    return dimensions.map((dim) => {
      const entry: Record<string, string | number> = { dimension: dim.label };
      slabScores.forEach((score, idx) => {
        const slab = compareData[idx].slab;
        entry[slab.slabNo] = score[dim.key as keyof typeof score];
      });
      return entry;
    });
  }, [compareData]);

  const handleSlabClick = (slabNo: string) => {
    setCurrentSlabNo(slabNo);
    navigate('/slab-charging');
  };

  const [tracingLabel, setTracingLabel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const traceConfig: Record<string, { process: string; param: string; getValue: (d: CompareData) => number | null }[][]> = {
    '出炉温度': [
      [{ process: '加热炉', param: '出炉温度', getValue: (d) => d.heating?.dischargeTemp ?? null }],
      [{ process: '精轧机组', param: '终轧温度', getValue: (d) => d.finishing?.finishingTemp ?? null }],
      [{ process: '层流冷却', param: '冷却前温度', getValue: (d) => d.cooling?.preCoolingTemp ?? null }],
      [{ process: '卷取打捆', param: '卷取温度', getValue: (d) => d.coiling?.coilingTemp ?? null }],
      [{ process: '性能检验', param: '-', getValue: () => null }],
    ],
    '终轧温度': [
      [{ process: '加热炉', param: '出炉温度', getValue: (d) => d.heating?.dischargeTemp ?? null }],
      [{ process: '精轧机组', param: '终轧温度', getValue: (d) => d.finishing?.finishingTemp ?? null }],
      [{ process: '层流冷却', param: '冷却前温度', getValue: (d) => d.cooling?.preCoolingTemp ?? null }],
      [{ process: '卷取打捆', param: '卷取温度', getValue: (d) => d.coiling?.coilingTemp ?? null }],
      [{ process: '性能检验', param: '-', getValue: () => null }],
    ],
    '平均厚度': [
      [{ process: '加热炉', param: '-', getValue: () => null }],
      [{ process: '精轧机组', param: '头/中/尾厚度', getValue: (d) => d.finishing ? (d.finishing.headThickness + d.finishing.midThickness + d.finishing.tailThickness) / 3 : null }],
      [{ process: '层流冷却', param: '-', getValue: () => null }],
      [{ process: '卷取打捆', param: '-', getValue: () => null }],
      [{ process: '性能检验', param: '-', getValue: () => null }],
    ],
    '凸度': [
      [{ process: '加热炉', param: '-', getValue: () => null }],
      [{ process: '精轧机组', param: '凸度', getValue: (d) => d.finishing?.crown ?? null }],
      [{ process: '层流冷却', param: '-', getValue: () => null }],
      [{ process: '卷取打捆', param: '-', getValue: () => null }],
      [{ process: '性能检验', param: '-', getValue: () => null }],
    ],
    '卷取温度': [
      [{ process: '加热炉', param: '出炉温度', getValue: (d) => d.heating?.dischargeTemp ?? null }],
      [{ process: '精轧机组', param: '终轧温度', getValue: (d) => d.finishing?.finishingTemp ?? null }],
      [{ process: '层流冷却', param: '冷却后温度', getValue: (d) => d.cooling?.postCoolingTemp ?? null }],
      [{ process: '卷取打捆', param: '卷取温度', getValue: (d) => d.coiling?.coilingTemp ?? null }],
      [{ process: '性能检验', param: '-', getValue: () => null }],
    ],
    '屈服强度': [
      [{ process: '加热炉', param: '出炉温度', getValue: (d) => d.heating?.dischargeTemp ?? null }],
      [{ process: '精轧机组', param: '终轧温度', getValue: (d) => d.finishing?.finishingTemp ?? null }],
      [{ process: '层流冷却', param: '冷却后温度', getValue: (d) => d.cooling?.postCoolingTemp ?? null }],
      [{ process: '卷取打捆', param: '卷取温度', getValue: (d) => d.coiling?.coilingTemp ?? null }],
      [{ process: '性能检验', param: '屈服强度', getValue: (d) => d.inspection?.yieldStrength ?? null }],
    ],
    '抗拉强度': [
      [{ process: '加热炉', param: '出炉温度', getValue: (d) => d.heating?.dischargeTemp ?? null }],
      [{ process: '精轧机组', param: '终轧温度', getValue: (d) => d.finishing?.finishingTemp ?? null }],
      [{ process: '层流冷却', param: '冷却后温度', getValue: (d) => d.cooling?.postCoolingTemp ?? null }],
      [{ process: '卷取打捆', param: '卷取温度', getValue: (d) => d.coiling?.coilingTemp ?? null }],
      [{ process: '性能检验', param: '抗拉强度', getValue: (d) => d.inspection?.tensileStrength ?? null }],
    ],
    '延伸率': [
      [{ process: '加热炉', param: '出炉温度', getValue: (d) => d.heating?.dischargeTemp ?? null }],
      [{ process: '精轧机组', param: '终轧温度', getValue: (d) => d.finishing?.finishingTemp ?? null }],
      [{ process: '层流冷却', param: '冷却后温度', getValue: (d) => d.cooling?.postCoolingTemp ?? null }],
      [{ process: '卷取打捆', param: '卷取温度', getValue: (d) => d.coiling?.coilingTemp ?? null }],
      [{ process: '性能检验', param: '延伸率', getValue: (d) => d.inspection?.elongation ?? null }],
    ],
    '冲击功': [
      [{ process: '加热炉', param: '出炉温度', getValue: (d) => d.heating?.dischargeTemp ?? null }],
      [{ process: '精轧机组', param: '终轧温度', getValue: (d) => d.finishing?.finishingTemp ?? null }],
      [{ process: '层流冷却', param: '冷却后温度', getValue: (d) => d.cooling?.postCoolingTemp ?? null }],
      [{ process: '卷取打捆', param: '卷取温度', getValue: (d) => d.coiling?.coilingTemp ?? null }],
      [{ process: '性能检验', param: '冲击功', getValue: (d) => d.inspection?.impactEnergy ?? null }],
    ],
  };

  const traceData = useMemo(() => {
    if (!tracingLabel || !traceConfig[tracingLabel]) return null;
    const steps = traceConfig[tracingLabel];
    return steps.map((step) => {
      const stepInfo = step[0];
      const values = compareData.map((d) => stepInfo.getValue(d));
      const numericValues = values.filter((v): v is number => v !== null);
      const avg = numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : null;
      const deviations = values.map((v) => {
        if (v === null || avg === null || avg === 0) return 0;
        return ((v - avg) / avg) * 100;
      });
      const deviationPct = numericValues.length >= 2
        ? numericValues.reduce((sum, v) => sum + Math.abs(v - (avg ?? 0)), 0) / numericValues.length / (avg || 1) * 100
        : 0;
      return {
        process: stepInfo.process,
        param: stepInfo.param,
        values,
        avg,
        deviations,
        deviationPct,
      };
    });
  }, [tracingLabel, compareData]);

  const traceArrows = useMemo(() => {
    if (!traceData) return [];
    return traceData.map((step, idx) => {
      if (idx === 0) return 'normal' as const;
      const prev = traceData[idx - 1];
      const prevPct = prev.deviationPct;
      const currPct = step.deviationPct;
      if (currPct > prevPct + 0.3) return 'amplify' as const;
      if (currPct < prevPct - 0.3) return 'converge' as const;
      return 'persist' as const;
    });
  }, [traceData]);

  const reportText = useMemo(() => {
    if (compareData.length < 2) return '';
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const line = '═══════════════════════════════════════';
    let report = '';
    report += `${line}\n`;
    report += `  热轧带钢质量分析报告\n`;
    report += `  生成时间：${timestamp}\n`;
    report += `${line}\n\n`;

    report += `【对比板坯】\n`;
    compareData.forEach((d) => {
      report += `  ${d.slab.slabNo} (${d.slab.steelGrade}, ${d.slab.thickness}×${d.slab.width}mm)\n`;
    });
    report += '\n';

    if (groupInfo) {
      report += `【分组信息】\n`;
      const steelGrades = [...new Set(compareData.map((d) => d.slab.steelGrade))];
      const sameSteelGrade = steelGrades.length === 1;
      report += `  钢种分组：${sameSteelGrade ? '同钢种对比（' + steelGrades[0] + '）' : '跨钢种对比（' + steelGrades.join(' / ') + '）'}\n`;
      const thicknesses = compareData.map((d) => d.slab.thickness);
      const widths = compareData.map((d) => d.slab.width);
      const maxT = Math.max(...thicknesses);
      const minT = Math.min(...thicknesses);
      const maxW = Math.max(...widths);
      const minW = Math.min(...widths);
      const sameSpec = maxT - minT <= 5 && maxW - minW <= 50;
      report += `  规格分组：${sameSpec ? '同规格对比' : '跨规格对比'}\n\n`;
    }

    if (deviationRankings.length > 0) {
      const best = deviationRankings[0];
      report += `【最稳定板坯】\n`;
      report += `  ${best.slabNo} - 综合偏差 ${best.overallDeviation.toFixed(2)}%，评级 ${best.rating}\n`;
      report += `  温度偏差：${best.tempDeviation.toFixed(2)}%，厚度偏差：${best.thicknessDeviation.toFixed(2)}%，性能偏差：${best.performanceDeviation.toFixed(2)}%\n\n`;

      const numericRows = tableRows.filter((r) => r.isNumeric);
      const riskRows = numericRows
        .map((row) => {
          const numericVals = row.values.filter((v): v is number => typeof v === 'number');
          if (numericVals.length < 2) return null;
          const avg = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
          const maxDev = numericVals.reduce((max, v) => Math.max(max, Math.abs(v - avg) / avg * 100), 0);
          const maxDevIdx = numericVals.findIndex((v) => Math.abs(v - avg) / avg * 100 === maxDev);
          const maxDevVal = numericVals[maxDevIdx];
          const direction = maxDevVal > avg ? '偏高' : '偏低';
          const worstSlab = compareData[maxDevIdx]?.slab.slabNo ?? '--';
          return { label: row.label, maxDev, worstSlab, direction };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.maxDev - a.maxDev)
        .slice(0, 3);

      if (riskRows.length > 0) {
        report += `【最大风险指标】\n`;
        riskRows.forEach((r) => {
          report += `  ${r.label} - 最大偏差 ${r.maxDev.toFixed(2)}%，${r.worstSlab} ${r.direction}\n`;
        });
        report += '\n';
      }
    }

    const steelGrades = [...new Set(compareData.map((d) => d.slab.steelGrade))];
    if (steelGrades.length === 1 && deviationRankings.length > 0) {
      const best = deviationRankings[0];
      report += `【同钢种结论】\n`;
      report += `  同钢种${steelGrades[0]}板坯中，${best.slabNo}工艺最稳定，\n`;
      report += `  温度和厚度控制精度最高，建议作为标准工艺参考。\n\n`;
    } else if (steelGrades.length > 1 && deviationRankings.length > 0) {
      const worst = deviationRankings[deviationRankings.length - 1];
      const worstGrade = compareData.find((d) => d.slab.slabNo === worst.slabNo)?.slab.steelGrade ?? '--';
      report += `【跨钢种结论】\n`;
      report += `  跨钢种对比显示，${worstGrade}板坯偏差较大（综合偏差${worst.overallDeviation.toFixed(2)}%），\n`;
      report += `  建议调整冷却制度以提高${worstGrade}的韧性指标。\n\n`;
    }

    report += `${line}`;
    return report;
  }, [compareData, groupInfo, deviationRankings, tableRows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <GitCompare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">板坯对比</h1>
            <p className="text-gray-400 text-sm">多板坯全流程工艺与质量数据横向对比分析</p>
          </div>
        </div>
      </div>

      <SectionCard
        title="对比板坯选择"
        subtitle={`已选择 ${effectiveCompareSlabNos.length} 块板坯，最多可对比 4 块`}
        icon={<BarChart3 className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={effectiveCompareSlabNos.length >= 4}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              添加板坯
            </button>
            <button
              onClick={clearCompareSlabs}
              disabled={effectiveCompareSlabNos.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              清空对比
            </button>
          </div>
        }
      >
        {effectiveCompareSlabNos.length === 0 ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-sm">
              <Flame className="w-4 h-4" />
              请从其他模块勾选板坯加入对比，或点击上方添加按钮
            </div>
          </div>
        ) : effectiveCompareSlabNos.length < 2 ? (
          <div className="py-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-sm">
              <Flame className="w-4 h-4" />
              请至少选择2块板坯进行对比
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {compareData.map((d, idx) => {
              const color = SLAB_COLORS[idx % SLAB_COLORS.length];
              return (
                <div
                key={d.slab.slabNo}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border ${color.bg} ${color.border} cursor-pointer hover:border-opacity-80 hover:ring-2 hover:ring-offset-0 hover:border-white/40 transition-all`}
                onClick={() => handleSlabClick(d.slab.slabNo)}
                title="查看完整生产履历"
              >
                <div className={`w-3 h-3 rounded-full ${color.bg.replace('/20', '')}`} style={{ backgroundColor: color.fill }} />
                <div className="flex flex-col">
                  <span className={`font-mono text-sm font-medium ${color.text}`}>{d.slab.slabNo}</span>
                  <span className="text-gray-400 text-xs">{d.slab.steelGrade}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCompareSlab(d.slab.slabNo);
                  }}
                  className={`ml-2 w-5 h-5 rounded flex items-center justify-center ${color.text} hover:bg-white/10 transition-colors`}
                  title="移除对比"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {effectiveCompareSlabNos.length >= 2 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="加热温度对比"
              subtitle="预热段、加热段、均热段与出炉温度"
              icon={<Thermometer className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatingChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      domain={[700, 1350]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: string | number, name: string) => {
                        const map: Record<string, string> = {
                          preheatTemp: '预热段',
                          heatingTemp: '加热段',
                          soakingTemp: '均热段',
                          dischargeTemp: '出炉温度',
                        };
                        return [`${value}℃`, map[name] || name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          preheatTemp: '预热段',
                          heatingTemp: '加热段',
                          soakingTemp: '均热段',
                          dischargeTemp: '出炉温度',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    <Bar dataKey="preheatTemp" fill="#f97316" name="preheatTemp" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="heatingTemp" fill="#3b82f6" name="heatingTemp" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="soakingTemp" fill="#22c55e" name="soakingTemp" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="dischargeTemp" fill="#a855f7" name="dischargeTemp" radius={[2, 2, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="终轧厚度对比"
              subtitle="头部、中部、尾部厚度与目标值"
              icon={<Ruler className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={thicknessChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '厚度 (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: string | number, name: string) => {
                        const map: Record<string, string> = {
                          headThickness: '头部厚度',
                          midThickness: '中部厚度',
                          tailThickness: '尾部厚度',
                          targetThickness: '目标厚度',
                        };
                        return [`${value}mm`, map[name] || name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          headThickness: '头部厚度',
                          midThickness: '中部厚度',
                          tailThickness: '尾部厚度',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    <ReferenceLine
                      y={thicknessChartData.length > 0 ? thicknessChartData[0].targetThickness : 0}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: '目标厚度', position: 'right', fill: '#dc2626', fontSize: 10 }}
                    />
                    <Bar dataKey="headThickness" fill="#f97316" name="headThickness" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="midThickness" fill="#3b82f6" name="midThickness" radius={[2, 2, 0, 0]} barSize={14} />
                    <Bar dataKey="tailThickness" fill="#22c55e" name="tailThickness" radius={[2, 2, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="卷取温度对比"
              subtitle="实际卷取温度与目标公差带"
              icon={<Coins className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coilingChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="toleranceBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      domain={[550, 700]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: string | number, name: string) => {
                        const map: Record<string, string> = {
                          coilingTemp: '卷取温度',
                          targetTemp: '目标温度',
                        };
                        return [`${value}℃`, map[name] || name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          coilingTemp: '卷取温度',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    <ReferenceLine
                      y={600}
                      stroke="#22c55e"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{ value: '公差下限 600℃', position: 'right', fill: '#22c55e', fontSize: 9 }}
                    />
                    <ReferenceLine
                      y={620}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: '目标 620℃', position: 'right', fill: '#f59e0b', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={640}
                      stroke="#22c55e"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{ value: '公差上限 640℃', position: 'right', fill: '#22c55e', fontSize: 9 }}
                    />
                    <Bar dataKey="coilingTemp" fill="#f97316" name="coilingTemp" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="力学性能对比"
              subtitle="屈服强度、抗拉强度与延伸率"
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={performanceChartData} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="slabNo"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[150, 600]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '强度 (MPa)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[15, 45]}
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      label={{ value: '延伸率 (%)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#f97316' }}
                      formatter={(value: string | number, name: string) => {
                        const map: Record<string, { label: string; unit: string }> = {
                          yieldStrength: { label: '屈服强度', unit: 'MPa' },
                          tensileStrength: { label: '抗拉强度', unit: 'MPa' },
                          elongation: { label: '延伸率', unit: '%' },
                        };
                        const cfg = map[name];
                        return cfg ? [`${value} ${cfg.unit}`, cfg.label] : [value, name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8' }}
                      formatter={(value: string) => {
                        const map: Record<string, string> = {
                          yieldStrength: '屈服强度',
                          tensileStrength: '抗拉强度',
                          elongation: '延伸率',
                        };
                        return <span className="text-xs text-gray-400">{map[value] || value}</span>;
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={235}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'σs下限 235MPa', position: 'right', fill: '#dc2626', fontSize: 9 }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={370}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'σb下限 370MPa', position: 'right', fill: '#dc2626', fontSize: 9 }}
                    />
                    <ReferenceLine
                      yAxisId="right"
                      y={26}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'δ下限 26%', position: 'right', fill: '#f59e0b', fontSize: 9 }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="yieldStrength"
                      fill="#f97316"
                      name="yieldStrength"
                      radius={[2, 2, 0, 0]}
                      barSize={14}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="tensileStrength"
                      fill="#3b82f6"
                      name="tensileStrength"
                      radius={[2, 2, 0, 0]}
                      barSize={14}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="elongation"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#22c55e', stroke: '#fff', strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                      name="elongation"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="对比数据表"
            subtitle="全流程关键指标横向对比，绿色为最优，橙色为最差"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-3 font-medium w-32">指标</th>
                    {compareData.map((d, idx) => {
                      const color = SLAB_COLORS[idx % SLAB_COLORS.length];
                      return (
                        <th key={d.slab.slabNo} className="pb-3 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.fill }} />
                            <span className={`font-mono ${color.text}`}>{d.slab.slabNo.slice(-5)}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="pb-3 font-medium text-gray-300">平均值</th>
                    <th className="pb-3 font-medium text-gray-400 w-14 text-center">追溯</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 pr-4 text-gray-300 font-medium whitespace-nowrap">
                        {row.label}
                        {row.unit && <span className="text-gray-500 text-xs ml-1">({row.unit})</span>}
                      </td>
                      {row.values.map((value, colIdx) => {
                        const isBest = row.bestIndex === colIdx;
                        const isWorst = row.worstIndex === colIdx;
                        let cellClass = 'text-gray-300';
                        if (isBest) cellClass = 'text-green-400 font-semibold';
                        else if (isWorst) cellClass = 'text-orange-400';

                        if (row.label === '检验结果') {
                          const result = String(value || 'pending');
                          const resultMap: Record<string, { text: string; bg: string; border: string }> = {
                            qualified: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                            unqualified: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                            pending: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                          };
                          const cfg = resultMap[result] || resultMap.pending;
                          return (
                            <td key={colIdx} className="py-3 pr-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                {formatCellValue(row, value)}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={colIdx} className={`py-3 pr-4 ${cellClass} font-mono`}>
                            {formatCellValue(row, value)}
                            {isBest && <span className="ml-1 text-green-500 text-xs">↑</span>}
                            {isWorst && <span className="ml-1 text-orange-500 text-xs">↓</span>}
                          </td>
                        );
                      })}
                      <td className="py-3 pr-4 text-gray-400 font-mono">
                        {row.isNumeric && row.avg !== null ? formatCellValue(row, row.avg) : '--'}
                      </td>
                      <td className="py-3 text-center">
                        {traceConfig[row.label] ? (
                          <button
                            onClick={() => setTracingLabel(tracingLabel === row.label ? null : row.label)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                              tracingLabel === row.label
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-orange-400'
                            }`}
                            title={`追溯${row.label}`}
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-gray-700 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard
            title="差异分析与稳定性排名"
            subtitle="各板坯指标偏差分析与生产稳定性综合评估"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            {groupInfo && (
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border ${groupInfo.steelGradeColor}`}>
                  {groupInfo.steelGradeLabel}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border ${groupInfo.specColor}`}>
                  {groupInfo.specLabel}
                </span>
              </div>
            )}

            {deviationRankings.length > 0 && (
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-gray-700">
                      <th className="pb-3 font-medium w-16">排名</th>
                      <th className="pb-3 font-medium">板坯号</th>
                      <th className="pb-3 font-medium">钢种</th>
                      <th className="pb-3 font-medium text-right">温度偏差%</th>
                      <th className="pb-3 font-medium text-right">厚度偏差%</th>
                      <th className="pb-3 font-medium text-right">性能偏差%</th>
                      <th className="pb-3 font-medium text-right">综合偏差%</th>
                      <th className="pb-3 font-medium">稳定性评级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviationRankings.map((row) => (
                      <tr key={row.slabNo} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 pr-4 text-gray-300 font-medium font-mono">
                          {row.rank === 1 ? (
                            <span className="text-yellow-400 font-bold">#{row.rank}</span>
                          ) : (
                            <span className="text-gray-400">#{row.rank}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 font-mono text-orange-400">{row.slabNo}</td>
                        <td className="py-3 pr-4 text-gray-300">{row.steelGrade}</td>
                        <td className="py-3 pr-4 text-right font-mono text-gray-300">{row.tempDeviation.toFixed(2)}%</td>
                        <td className="py-3 pr-4 text-right font-mono text-gray-300">{row.thicknessDeviation.toFixed(2)}%</td>
                        <td className="py-3 pr-4 text-right font-mono text-gray-300">{row.performanceDeviation.toFixed(2)}%</td>
                        <td className="py-3 pr-4 text-right font-mono text-gray-300">{row.overallDeviation.toFixed(2)}%</td>
                        <td className={`py-3 pr-4 font-semibold ${row.ratingColor}`}>{row.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {radarData.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-3">四维稳定性雷达图（越靠外表示越稳定）</div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                        }}
                        formatter={(value: string | number) => [`${value}`, '']}
                      />
                      <Legend
                        wrapperStyle={{ color: '#94a3b8' }}
                        formatter={(value: string) => {
                          return <span className="text-xs text-gray-400 font-mono">{value.slice(-5)}</span>;
                        }}
                      />
                      {compareData.map((_, idx) => {
                        const color = SLAB_COLORS[idx % SLAB_COLORS.length];
                        const slab = compareData[idx].slab;
                        return (
                          <Radar
                            key={slab.slabNo}
                            name={slab.slabNo}
                            dataKey={slab.slabNo}
                            stroke={color.fill}
                            fill={color.fill}
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </SectionCard>

          {tracingLabel && traceData && (
            <SectionCard
              title="异常追溯视图"
              subtitle={`指标「${tracingLabel}」沿工序链的偏差放大过程追溯`}
              icon={<Search className="w-5 h-5" />}
              actions={
                <button
                  onClick={() => setTracingLabel(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                  关闭追溯
                </button>
              }
            >
              <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
                {traceData.map((step, idx) => {
                  const arrow = traceArrows[idx];
                  const isAmplify = arrow === 'amplify';
                  const isConverge = arrow === 'converge';
                  const barMaxPct = 10;
                  return (
                    <div key={idx} className="flex items-stretch flex-shrink-0">
                      {idx > 0 && (
                        <div className="flex flex-col items-center justify-center px-1 min-w-[32px]">
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                          <span
                            className={`text-[10px] font-medium mt-0.5 ${
                              isAmplify ? 'text-red-400' : isConverge ? 'text-green-400' : 'text-gray-500'
                            }`}
                          >
                            {isAmplify ? '放大↑' : isConverge ? '收敛↓' : '持续─'}
                          </span>
                        </div>
                      )}
                      <div className="bg-gray-800/60 border border-gray-700/60 rounded-lg p-3 min-w-[150px] flex flex-col gap-2">
                        <div className="text-xs font-semibold text-white">{step.process}</div>
                        <div className="text-[11px] text-gray-400">{step.param}</div>
                        {compareData.map((d, si) => {
                          const val = step.values[si];
                          const dev = step.deviations[si];
                          const color = SLAB_COLORS[si % SLAB_COLORS.length];
                          const absDev = Math.abs(dev);
                          const barWidth = Math.min(100, (absDev / barMaxPct) * 100);
                          const barColor = absDev < 0.5 ? 'bg-green-500/60' : dev > 0 ? 'bg-orange-500/70' : 'bg-blue-500/70';
                          const dirIcon = absDev < 0.5 ? '─' : dev > 0 ? '↑' : '↓';
                          const dirColor = absDev < 0.5 ? 'text-gray-500' : dev > 0 ? 'text-orange-400' : 'text-blue-400';
                          return (
                            <div key={si} className="flex flex-col gap-0.5">
                              <div className="flex items-center justify-between">
                                <span className={`font-mono text-xs ${color.text}`}>
                                  {val !== null ? (Number.isInteger(val) ? val : val.toFixed(2)) : '-'}
                                </span>
                                <span className={`text-[10px] font-semibold ${dirColor}`}>{dirIcon}</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                  style={{ width: `${Math.max(4, barWidth)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {step.deviationPct > 0 && (
                          <div className="text-[10px] text-gray-500 mt-auto pt-1 border-t border-gray-700/40">
                            偏差幅度：{step.deviationPct.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {reportText && (
            <SectionCard
              title="质量分析报告"
              subtitle="结构化文本报告，可直接复制使用"
              icon={<BarChart3 className="w-5 h-5" />}
              actions={
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reportText).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? '已复制 ✓' : '一键复制'}
                </button>
              }
            >
              <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 font-mono whitespace-pre overflow-x-auto leading-relaxed">
                {reportText}
              </pre>
            </SectionCard>
          )}
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg mx-4 max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">添加对比板坯</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {availableSlabs.length === 0 ? (
                <div className="py-8 text-center text-gray-500">暂无可添加的板坯</div>
              ) : (
                <div className="space-y-2">
                  {availableSlabs.map((slab) => (
                    <button
                      key={slab.id}
                      onClick={() => {
                        addCompareSlab(slab.slabNo);
                        setShowAddModal(false);
                      }}
                      disabled={effectiveCompareSlabNos.length >= 4}
                      className="w-full flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-md hover:border-orange-500/50 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div>
                        <div className="text-orange-400 font-mono text-sm font-medium">{slab.slabNo}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{slab.steelGrade} · {slab.thickness}×{slab.width}mm</div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
