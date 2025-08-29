import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { buildTianJiangMap, type DiZhi, type TianGan } from 'daliuren-lib';

interface Props {
  dayGan: TianGan;
  shiZhi: DiZhi; // 用于昼夜判定与起贵
}

export function TwelveGrid({ dayGan, shiZhi }: Props) {
  const jiang = useMemo(() => buildTianJiangMap({ dayGan, shiZhi }), [dayGan, shiZhi]);

  const top: DiZhi[] = ['巳','午','未','申'];
  const bottom: DiZhi[] = ['寅','丑','子','亥'];
  const leftTop: DiZhi = '辰';
  const leftBottom: DiZhi = '卯';
  const rightTop: DiZhi = '酉';
  const rightBottom: DiZhi = '戌';

  const Cell = ({ z }: { z: DiZhi }) => (
    <View style={styles.cell}>
      <Text style={styles.cellText}>{z}</Text>
      <Text style={styles.cellJiang}>{jiang[z]}</Text>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row4}>{top.map(z => <Cell key={z} z={z} />)}</View>
      <View style={styles.row2}>
        <Cell z={leftTop} />
        <View style={{ flex: 1 }} />
        <Cell z={rightTop} />
      </View>
      <View style={styles.row2}>
        <Cell z={leftBottom} />
        <View style={{ flex: 1 }} />
        <Cell z={rightBottom} />
      </View>
      <View style={styles.row4}>{bottom.map(z => <Cell key={z} z={z} />)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingVertical: 4 },
  row4: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  row2: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  cell: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cellText: { fontSize: 18, fontWeight: '600' },
  cellJiang: { marginTop: 2, color: '#666' },
});

