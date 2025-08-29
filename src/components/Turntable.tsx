import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutRectangle, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import type { DiZhi, TianGan } from 'daliuren-lib';
import { DIZHI_ORDER, buildTianJiangMap, type TianJiang } from 'daliuren-lib';

interface Props {
  dayGan: TianGan;
  shiZhi: DiZhi; // 用于天将映射
  tianpan: Record<DiZhi, DiZhi>; // 地盘宫位 -> 天盘上神
  size?: number; // 直径
}

type ActiveRing = 'tian' | 'jiang' | null;

export function Turntable({ dayGan, shiZhi, tianpan, size = 300 }: Props) {
  const center = useRef({ x: 0, y: 0 });
  const layout = useRef<LayoutRectangle | null>(null);
  const [rotTian, setRotTian] = useState(0); // radians
  const [rotJiang, setRotJiang] = useState(0);
  const [active, setActive] = useState<ActiveRing>(null);
  const startAngle = useRef(0);
  const startRot = useRef(0);

  const jiangMap = useMemo(() => buildTianJiangMap({ dayGan, shiZhi }), [dayGan, shiZhi]);

  const onLayout = (e: any) => {
    layout.current = e.nativeEvent.layout;
    const { x, y, width, height } = e.nativeEvent.layout;
    center.current = { x: x + width / 2, y: y + height / 2 };
  };

  function getAngle(ev: GestureResponderEvent) {
    const { pageX, pageY } = ev.nativeEvent;
    const cx = center.current.x;
    const cy = center.current.y;
    return Math.atan2(pageY - cy, pageX - cx);
  }

  function getRadius(ev: GestureResponderEvent) {
    const { pageX, pageY } = ev.nativeEvent;
    const cx = center.current.x;
    const cy = center.current.y;
    return Math.hypot(pageX - cx, pageY - cy);
  }

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (ev) => {
      const r = getRadius(ev);
      const outer = size / 2;
      const hole = size * 0.18; // 内部中空
      const tianOuter = size * 0.36;
      const jiangOuter = size * 0.48;
      let ring: ActiveRing = null;
      if (r > tianOuter && r <= jiangOuter) ring = 'jiang';
      else if (r > hole && r <= tianOuter) ring = 'tian';
      setActive(ring);
      startAngle.current = getAngle(ev);
      startRot.current = ring === 'tian' ? rotTian : ring === 'jiang' ? rotJiang : 0;
    },
    onPanResponderMove: (ev, gs) => {
      if (!active) return;
      const a = getAngle(ev);
      const delta = a - startAngle.current;
      const rot = startRot.current + delta;
      if (active === 'tian') setRotTian(rot);
      else if (active === 'jiang') setRotJiang(rot);
    },
    onPanResponderRelease: () => setActive(null),
    onPanResponderTerminate: () => setActive(null),
  }), [active, rotTian, rotJiang, size]);

  const ringSizes = {
    hole: size * 0.18,
    tianR: size * 0.30,
    jiangR: size * 0.42,
    labelRZhi: size * 0.18, // 地盘文字半径
    labelRTian: size * 0.30,
    labelRJiang: size * 0.42,
  };

  function polarToXY(r: number, angle: number) {
    const cx = size / 2;
    const cy = size / 2;
    return { left: cx + r * Math.cos(angle), top: cy + r * Math.sin(angle) };
  }

  function renderRingLabels(values: string[], radius: number, rotation: number, textStyle: any) {
    return values.map((txt, i) => {
      const angle = rotation + (i / 12) * Math.PI * 2 - Math.PI / 2;
      const pos = polarToXY(radius, angle);
      return (
        <Text key={i} style={[styles.label, textStyle, { left: pos.left, top: pos.top, transform: [{ translateX: -12 }, { translateY: -10 }] }]}>
          {txt}
        </Text>
      );
    });
  }

  const diZhiValues = DIZHI_ORDER as unknown as string[];
  const tianValues = (DIZHI_ORDER as unknown as DiZhi[]).map(z => tianpan[z]);
  const jiangValues = (DIZHI_ORDER as unknown as DiZhi[]).map(z => jiangMap[z] as unknown as string);

  return (
    <View style={[styles.wrap, { width: size, height: size }]} onLayout={onLayout} {...panResponder.panHandlers}>
      {/* 地盘（固定） */}
      <View style={[styles.ring, { width: size * 0.36, height: size * 0.36, borderRadius: (size * 0.36) / 2 }]} />
      {renderRingLabels(diZhiValues, ringSizes.labelRZhi, 0, styles.lblZhi)}

      {/* 天盘（可旋转） */}
      <View style={[styles.ring, { width: size * 0.60, height: size * 0.60, borderRadius: (size * 0.60) / 2, transform: [{ rotate: `${rotTian}rad` }] }]} />
      {renderRingLabels(tianValues as any, ringSizes.labelRTian, rotTian, styles.lblTian)}

      {/* 天将（可旋转） */}
      <View style={[styles.ring, { width: size * 0.84, height: size * 0.84, borderRadius: (size * 0.84) / 2, transform: [{ rotate: `${rotJiang}rad` }] }]} />
      {renderRingLabels(jiangValues as any, ringSizes.labelRJiang, rotJiang, styles.lblJiang)}

      {/* 中孔 */}
      <View style={[styles.hole, { width: ringSizes.hole * 2, height: ringSizes.hole * 2, borderRadius: ringSizes.hole }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', marginVertical: 10, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: '#ddd' },
  hole: { position: 'absolute', backgroundColor: '#fff' },
  label: { position: 'absolute', fontSize: 12, color: '#333' },
  lblZhi: { fontWeight: '700' },
  lblTian: { color: '#1976d2' },
  lblJiang: { color: '#8d6e63' },
});

