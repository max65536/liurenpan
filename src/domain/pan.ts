import type { DiZhi } from 'daliuren-lib';
import {
  computeFullPan,
  computePanByJu,
  buildTianDiPanBlock,
  buildSiKeBlock,
  buildSanZhuanBlock,
} from 'daliuren-lib';

export interface ComputePlateParams {
  dayGanzhi: string;
  shiZhi: DiZhi;  // 占时
  yueJiang: DiZhi; // 月将
}

export interface ComputeJuParams {
  dayGanzhi: string;
  ju: number; // 1-12
}

export interface PanDisplayResult {
  // 原始结果
  gan: string;
  zhi: string;
  ju: number;
  ganShang: string;
  siKePairs: { up: string; down: string }[];
  siKeSanZhuan: { kind: string; sanZhuan: [string, string, string]; note?: string };
  // 构建天将映射所用的“占时”（用于网格 UI）
  shiZhiForJiang?: DiZhi;
  // 便于 UI 快速渲染的文本块
  tiandiBlock: string[]; // 12天将环形块（6行）
  sikeBlock: string[];   // 四课：上将/上神/下神（3行）
  sanzhuanBlock: string[]; // 三传（3行）
}

export function computeByYueJiangShiZhi(params: ComputePlateParams): PanDisplayResult {
  const full = computeFullPan(params);
  const tiandiBlock = buildTianDiPanBlock({ dayGan: full.gan as any, shiZhi: params.shiZhi });
  const sikeBlock = buildSiKeBlock(full.siKePairs as any, { dayGan: full.gan as any, shiZhi: params.shiZhi });
  const sanzhuanBlock = buildSanZhuanBlock(full.siKeSanZhuan.sanZhuan as any, { dayGan: full.gan as any, shiZhi: params.shiZhi });
  return {
    gan: full.gan,
    zhi: full.zhi,
    ju: full.ju,
    ganShang: full.ganShang,
    siKePairs: full.siKePairs.map(p => ({ up: String(p.up), down: String(p.down) })),
    siKeSanZhuan: full.siKeSanZhuan,
    shiZhiForJiang: params.shiZhi,
    tiandiBlock,
    sikeBlock,
    sanzhuanBlock,
  };
}

export function computeByJu(params: ComputeJuParams): PanDisplayResult {
  const full = computePanByJu(params.dayGanzhi, params.ju);
  // computePanByJu 不含 shiZhi，因此只构造 sike/sanzhuan（不依赖 shiZhi 的文本也可构造，但此处简化）
  const sikeBlock = buildSiKeBlock(full.siKePairs as any, { dayGan: full.gan as any, shiZhi: full.zhi as any });
  const sanzhuanBlock = buildSanZhuanBlock(full.siKeSanZhuan.sanZhuan as any, { dayGan: full.gan as any, shiZhi: full.zhi as any });
  // 天地盘块缺少 shiZhi 的严格依据，这里用 dayZhi 代位以便调试
  const tiandiBlock = buildTianDiPanBlock({ dayGan: full.gan as any, shiZhi: full.zhi as any });
  return {
    gan: full.gan,
    zhi: full.zhi,
    ju: full.ju,
    ganShang: full.ganShang,
    siKePairs: full.siKePairs.map(p => ({ up: String(p.up), down: String(p.down) })),
    siKeSanZhuan: full.siKeSanZhuan,
    shiZhiForJiang: full.zhi as any,
    tiandiBlock,
    sikeBlock,
    sanzhuanBlock,
  };
}
