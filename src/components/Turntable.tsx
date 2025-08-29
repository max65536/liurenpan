import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDecay, runOnJS } from 'react-native-reanimated';
import type { DiZhi, TianGan } from 'daliuren-lib';
import { DIZHI_ORDER, buildTianJiangMap } from 'daliuren-lib';

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
  const rotTian = useSharedValue(0); // radians
  const rotJiang = useSharedValue(0);
  const active = useRef<ActiveRing>(null);
  const startAngle = useRef(0);
  const startRot = useRef(0);

  const jiangMap = useMemo(() => buildTianJiangMap({ dayGan, shiZhi }), [dayGan, shiZhi]);

  const onLayout = (e: any) => {
    layout.current = e.nativeEvent.layout;
    const { x, y, width, height } = e.nativeEvent.layout;
    center.current = { x: x + width / 2, y: y + height / 2 };
  };

  function getAngleXY(x: number, y: number) {
    const cx = center.current.x;
    const cy = center.current.y;
    return Math.atan2(y - cy, x - cx);
  }

  function getRadiusXY(x: number, y: number) {
    const cx = center.current.x;
    const cy = center.current.y;
    return Math.hypot(x - cx, y - cy);
  }

  // 计算角速度（弧度/秒）
  function angularVelocity(x: number, y: number, vx: number, vy: number) {
    const cx = center.current.x;
    const cy = center.current.y;
    const rx = x - cx;
    const ry = y - cy;
    const r2 = rx * rx + ry * ry;
    if (r2 === 0) return 0;
    // ω = (r x v)_z / |r|^2 = (rx*vy - ry*vx)/r^2
    return (rx * vy - ry * vx) / r2;
  }

  const hole = size * 0.18;
  const tianOuter = size * 0.36;
  const jiangOuter = size * 0.48;

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      const r = getRadiusXY(e.absoluteX, e.absoluteY);
      let ring: ActiveRing = null;
      if (r > tianOuter && r <= jiangOuter) ring = 'jiang';
      else if (r > hole && r <= tianOuter) ring = 'tian';
      active.current = ring;
      startAngle.current = getAngleXY(e.absoluteX, e.absoluteY);
      startRot.current = ring === 'tian' ? rotTian.get() : ring === 'jiang' ? rotJiang.get() : 0;
    })
    .onUpdate((e) => {
      const ring = active.current;
      if (!ring) return;
      const a = getAngleXY(e.absoluteX, e.absoluteY);
      const delta = a - startAngle.current;
      const rot = startRot.current + delta;
      if (ring === 'tian') rotTian.set(rot);
      else if (ring === 'jiang') rotJiang.set(rot);
    })
    .onEnd((e) => {
      const ring = active.current;
      active.current = null;
      if (!ring) return;
      const omega = angularVelocity(e.absoluteX, e.absoluteY, e.velocityX, e.velocityY);
      const target = ring === 'tian' ? rotTian : rotJiang;
      // 低速时吸附到最近的 30°
      if (Math.abs(omega) < 0.2) {
        const step = (2 * Math.PI) / 12;
        const cur = target.get();
        const snap = Math.round(cur / step) * step;
        target.set(withTiming(snap, { duration: 180 }));
      } else {
        target.set(withDecay({ velocity: omega, deceleration: 0.995 } as any));
      }
    });

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

  function renderRingLabels(values: string[], radius: number, textStyle: any) {
    return values.map((txt, i) => {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
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

  const tianStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotTian.get()}rad` }] }));
  const jiangStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotJiang.get()}rad` }] }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.wrap, { width: size, height: size }]} onLayout={onLayout}>
        {/* 地盘（固定） */}
        <View style={[styles.ring, { width: size * 0.36, height: size * 0.36, borderRadius: (size * 0.36) / 2 }]} />
        {renderRingLabels(diZhiValues, ringSizes.labelRZhi, styles.lblZhi)}

        {/* 天盘（可旋转） */}
        <Animated.View style={[styles.ring, { width: size * 0.60, height: size * 0.60, borderRadius: (size * 0.60) / 2 }, tianStyle]} />
        <Animated.View style={[StyleSheet.absoluteFillObject, tianStyle]} pointerEvents="none">
          {renderRingLabels(tianValues as any, ringSizes.labelRTian, styles.lblTian)}
        </Animated.View>

        {/* 天将（可旋转） */}
        <Animated.View style={[styles.ring, { width: size * 0.84, height: size * 0.84, borderRadius: (size * 0.84) / 2 }, jiangStyle]} />
        <Animated.View style={[StyleSheet.absoluteFillObject, jiangStyle]} pointerEvents="none">
          {renderRingLabels(jiangValues as any, ringSizes.labelRJiang, styles.lblJiang)}
        </Animated.View>

        {/* 中孔 */}
        <View style={[styles.hole, { width: ringSizes.hole * 2, height: ringSizes.hole * 2, borderRadius: ringSizes.hole }]} />
      </View>
    </GestureDetector>
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
