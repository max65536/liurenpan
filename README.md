# 六壬排盘 RN 应用（草稿）

本目录包含一个最小的 React Native（建议 Expo）应用骨架与领域层封装，基于 `daliuren-lib` 实现大六壬排盘（四课三传、天盘/天将等）。

## 功能概览
- 手动输入：日干支、占时地支、月将地支，计算完整排盘。
- 备选：按“第几局”计算（无需月将/占时）。
- 展示：
  - 四课三传结果（类型、三传）
  - 四课上下神列表
  - 十二天将环形块（文本版，便于初期验证）

## 开发步骤（推荐 Expo）
1. 安装 Expo 环境（如未安装）：
   - `npm i -g expo-cli` 或使用新版 `npx create-expo-app` 向导。
2. 在本项目目录执行（或在空目录新建 Expo 项后拷贝下述文件）：
   - `npm init -y`
   - `npm i react react-native expo`
   - `npm i daliuren-lib`（来自 https://www.npmjs.com/package/daliuren-lib ）
   - `npx expo install react-native-gesture-handler react-native-reanimated react-native-svg`
   - 可选：`npm i -D typescript @types/react @types/react-native`
3. 将本仓库的 `App.tsx` 与 `src/` 目录拷贝至 Expo 项目根目录（或直接在此处继续开发并配置打包脚本）。
4. 运行：`npx expo start`（iOS/Android/网页任一调试端）。

> 说明：`daliuren-lib` 当前不负责“日干支/月将/占时”的历法换算，建议先手动输入；后续可接入农历/干支换算库。

## 目录结构
- `App.tsx`：简单输入表单 + 结果展示。
- `src/domain/pan.ts`：对 `daliuren-lib` 的轻薄封装，暴露统一的计算与展示数据结构。
- `src/components/PanResultView.tsx`：将结果以列表/网格/文本块形式渲染。
- `src/components/TwelveGrid.tsx`：十二宫网格（巳午未申顶部、寅丑子亥底部、卯辰/酉戌两侧）。
- `src/components/Turntable.tsx`：三层转盘（Reanimated + Gesture Handler，支持天盘/天将层独立旋转、惯性与吸附）。

## 后续计划
- UI 网格化呈现十二宫（替代文本块）。
- 可选：自动推算“日干支、月将、占时”（需确定算法口径）。
- 国际化与持久化最近一次排盘。
