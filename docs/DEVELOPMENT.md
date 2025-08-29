# 六壬排盘开发文档（规划草案）

本文件用于指导后续开发迭代，当前阶段“仅规划不实现”。已存在的基础骨架（输入与结果展示）可作为参考，但本文件的任务项在开始前需再次确认。

## 目标与范围
- 目标：在 React Native（Expo）中实现大六壬排盘可视化与交互，包含基础排盘结果与三层“转盘”交互。
- 当前范围：
  - 手动输入模式（“月将加时”）：手动输入日干支、占时、月将。
  - 按局模式：手动输入第几局（1-12）。
  - 转盘：三层同心圆盘，中间镂空。
    - 地盘（内圈）：固定，不可旋转。
    - 天盘（中圈）：可旋转。
    - 天将盘（外圈）：可旋转。
  - 结果视图：四课、三传、十二天将（网格和文本块）。
- 非目标（暂不实现）：
  - 历法换算（由日期自动求日干支/月将/占时）。
  - 保存、分享与云同步。
  - 复杂断法与扩展规则（待后续规划）。

## 技术栈与依赖
- UI 框架：React Native（Expo 53）
- 领域库：`daliuren-lib`（计算四课三传、天/地/将盘、规则工具）
- 手势与动画：
  - `react-native-gesture-handler`
  - `react-native-reanimated`
- 绘制：文本+容器布局为主；后续可考虑 `react-native-svg` 或 `@shopify/react-native-skia` 以获得更灵活的绘制能力。
- Metro 兼容：postinstall 脚本修补 metro 的 exports 以适配 expo CLI 深路径引用。

## 数据流与结构
- 领域封装：`src/domain/pan.ts`
  - 输入（手动）：
    - 月将加时：`{ dayGanzhi, shiZhi, yueJiang }`
    - 按局：`{ dayGanzhi, ju }`
  - 计算：基于 `daliuren-lib` 的 `computeFullPan` 或 `computePanByJu`。
  - 输出（PanDisplayResult）：
    - `gan`, `zhi`, `ju`, `ganShang`
    - `siKePairs`（四课）、`siKeSanZhuan`
    - `shiZhiForJiang`（用于天将映射）
    - `tianpan: Record<DiZhi, DiZhi>`（地盘宫位 -> 天盘上神）
    - 展示块：`tiandiBlock`, `sikeBlock`, `sanzhuanBlock`
- 转盘三层数据：
  - 地盘（内圈）：固定为 `DIZHI_ORDER`（子→亥），按顺/逆可视调整。
  - 天盘（中圈）：`tianpan[地盘宫位]` 得到该宫“上神”。
  - 天将（外圈）：`buildTianJiangMap({ dayGan, shiZhi })`，根据昼夜与起贵、顺逆规则映射到十二宫。

## 转盘交互设计
- 交互：
  - 单指拖动：根据触点“半径”判定在天盘圈或天将圈，分别旋转对应圈层。
  - 惯性：松手后按角速度做减速旋转（withDecay），可提供衰减系数配置。
  - 吸附：若松手角速度低于阈值，吸附到最近 30° 刻度（12等分），保证对齐宫位。
  - 中孔：中间留空，避免误触中心。
- 可视：
  - 三圈环形边框，文字按 12 等分环绕布置。
  - 地盘为黑体/加重，天盘为蓝色系，天将为棕色系（可调整）。
- 后续增强（下一迭代再做）：
  - 高亮初/中/末传所在宫位。
  - 点击宫位弹出详情（上下神、天将、五行、关系）。
  - 双指缩放、锁定对齐、转动回滚与重置。

## 版本与兼容
- 建议版本：
  - `expo ^53.0.20`
  - `react 18.2.0`
  - `react-native 0.76.x`
- Metro 修补：`scripts/patch-metro-exports.js` 在 postinstall 阶段向 `node_modules/metro/package.json` 注入 `exports['./src/*']` 以兼容 `@expo/cli` 的深路径引用。

## 安装与配置
- 安装：
  - `npm i`
  - `npx expo install react-native-gesture-handler react-native-reanimated react-native-svg`
- Babel：`babel.config.js` 使用 `babel-preset-expo`，并确保 `react-native-reanimated/plugin` 插件位于 plugins 尾部。
- 入口：在 `App.tsx` 顶部 `import 'react-native-gesture-handler';`
- 启动：`npx expo start -c`

## 实施计划（分阶段）
1) 基础转盘（Reanimated + Gesture Handler）
- 输入：使用 `PanDisplayResult` 的 `tianpan` 与 `shiZhiForJiang` 构造三层。
- 手势：单指拖动识别圈层；支持惯性和吸附。
- UI：环形容器 + 文本标签实现，直径可通过 props 配置。
- 验收：
  - 拖动外圈仅天将转动；拖动中圈仅天盘转动；地盘不动。
  - 松手缓慢吸附对齐；快速松手具有惯性。

2) 高亮与标注（后续）
- 高亮：初/中/末传宫位标识。
- 标注：可选显示四课上下神位置标记、干支寄宫与“干上”。
- 验收：
  - 三传宫位在转盘上正确对应并高亮。

3) 信息浮层与细节（后续）
- 点击宫位：展示该宫的“下神(地支)/上神(天盘)/天将/五行/关系”信息。
- 交互：点击外圈/中圈/内圈的任一宫位均可触发。

4) 性能与适配（后续）
- 大屏与横屏适配；文字自适应字号；SVG/Skia 版本评估。
- 低端机优化（减少重绘，合理使用 Reanimated 工作线程）。

## 边界与注意事项
- 角速度估算：通过 `(r x v)_z / |r|^2` 近似，不适用于 r≈0 的情形（中心附近忽略）。
- 刻度对齐：吸附基于 12 等分（30°），如需切换顺逆盘显示需一并调整角度计算。
- “按局”模式下的天将盘：当前用日支代位以便预览；正式口径需再议。

## 验收清单（阶段一：基础转盘）
- [ ] 中心镂空，三圈可见。
- [ ] 拖动中圈仅天盘旋转，外圈不动；拖动外圈仅天将旋转，中圈不动。
- [ ] 松手缓慢吸附到最近刻度；快速松手出现惯性减速。
- [ ] 切换两种模式（“月将加时/按局”）后数据映射正确。
- [ ] 不改动地盘顺序，保证对应关系正确。

## 里程碑
- M1：基础转盘可用 + 文档（当前阶段）
- M2：三传高亮 + 点击详情
- M3：UI 优化 + 性能优化 + 测试用例

---
如需修改口径（例如“按局”下天将的展示策略、昼夜判定或吸附规则），请先更新本文档再进入实现阶段。
