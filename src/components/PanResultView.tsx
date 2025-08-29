import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TwelveGrid } from './TwelveGrid';
import type { PanDisplayResult } from '../domain/pan';

export function PanResultView({ result }: { result: PanDisplayResult }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>结果</Text>
      <Text>日：{result.gan}{result.zhi}（干上：{result.ganShang}） 局：{result.ju}</Text>
      <Text>课型：{result.siKeSanZhuan.kind}（{result.siKeSanZhuan.sanZhuan.join('、')}）</Text>

      <Text style={styles.subtitle}>四课</Text>
      {result.siKePairs.map((p, i) => (
        <Text key={i}>一二三四[{i+1}] 上：{p.up} 下：{p.down}</Text>
      ))}

      <Text style={styles.subtitle}>十二天将（网格）</Text>
      {result.shiZhiForJiang ? (
        <TwelveGrid dayGan={result.gan as any} shiZhi={result.shiZhiForJiang as any} />
      ) : null}

      <Text style={styles.subtitle}>十二天将（文本块）</Text>
      <MonoBlock lines={result.tiandiBlock} />

      <Text style={styles.subtitle}>四课（文本块）</Text>
      <MonoBlock lines={result.sikeBlock} />

      <Text style={styles.subtitle}>三传（文本块）</Text>
      <MonoBlock lines={result.sanzhuanBlock} />
    </View>
  );
}

function MonoBlock({ lines }: { lines: string[] }) {
  return (
    <View style={styles.block}>
      {lines.map((l, idx) => (
        <Text key={idx} style={styles.mono}>{l}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, gap: 8 },
  title: { fontWeight: '600', fontSize: 16 },
  subtitle: { marginTop: 6, fontWeight: '600' },
  block: { backgroundColor: '#f7f7f7', padding: 8, borderRadius: 6 },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), lineHeight: 20 },
});
