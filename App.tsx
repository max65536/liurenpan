import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { computeByYueJiangShiZhi, computeByJu, type PanDisplayResult } from './src/domain/pan';
import { PanResultView } from './src/components/PanResultView';

export default function App() {
  const [dayGanzhi, setDayGanzhi] = useState('甲子');
  const [shiZhi, setShiZhi] = useState('子');
  const [yueJiang, setYueJiang] = useState('子');
  const [ju, setJu] = useState('1');
  const [mode, setMode] = useState<'plate' | 'ju'>('plate');
  const [result, setResult] = useState<PanDisplayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCompute = () => {
    setError(null);
    try {
      const r = mode === 'plate'
        ? computeByYueJiangShiZhi({ dayGanzhi, shiZhi: shiZhi as any, yueJiang: yueJiang as any })
        : computeByJu({ dayGanzhi, ju: Number(ju) });
      setResult(r);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>大六壬排盘（演示）</Text>

        <View style={styles.row}>
          <Button title={mode === 'plate' ? '方式：月将加时' : '方式：按局'} onPress={() => setMode(mode === 'plate' ? 'ju' : 'plate')} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>日干支</Text>
          <TextInput value={dayGanzhi} onChangeText={setDayGanzhi} style={styles.input} placeholder="例如：甲子" />
        </View>

        {mode === 'plate' ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>占时地支</Text>
              <TextInput value={shiZhi} onChangeText={setShiZhi} style={styles.input} placeholder="子/丑/..." />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>月将地支</Text>
              <TextInput value={yueJiang} onChangeText={setYueJiang} style={styles.input} placeholder="子/丑/..." />
            </View>
          </>
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>第几局 (1-12)</Text>
            <TextInput value={ju} onChangeText={setJu} style={styles.input} keyboardType="number-pad" />
          </View>
        )}

        <View style={styles.row}>
          <Button title="计算排盘" onPress={onCompute} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {result ? <PanResultView result={result} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 20, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 90, color: '#333' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 8, height: 36 },
  error: { color: '#b00020' },
});

