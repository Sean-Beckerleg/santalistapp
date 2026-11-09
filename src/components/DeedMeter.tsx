import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { meterPos } from '../logic';

/** Red -> gold -> green meter with a needle. `scale` lets it shrink inside the scroll card. */
export function DeedMeter({ total, scale = 1 }: { total: number; scale?: number }) {
  const h = 22 * scale;
  return (
    <View>
      <View style={{ height: h, justifyContent: 'center' }}>
        <LinearGradient
          colors={['#c62828', '#e8b04a', '#2e7d32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.bar, { height: h, borderRadius: h / 2 }]}
        />
        <View style={[styles.mid, { height: h + 8 * scale }]} />
        <View
          style={[
            styles.needle,
            { left: `${meterPos(total) * 100}%`, height: h + 10 * scale, width: 8 * scale + 2 },
          ]}
        />
      </View>
      <View style={styles.scale}>
        <Text style={[styles.sc, { fontSize: 11 * scale }]}>Naughty</Text>
        <Text style={[styles.sc, { fontSize: 11 * scale }]}>0</Text>
        <Text style={[styles.sc, { fontSize: 11 * scale }]}>Nice</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderWidth: 2, borderColor: '#5a3a1a' },
  mid: { position: 'absolute', left: '50%', width: 2, backgroundColor: '#3b2410', top: -4 },
  needle: {
    position: 'absolute',
    top: -5,
    marginLeft: -5,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b2410',
    borderRadius: 4,
  },
  scale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  sc: { color: '#3b2410', opacity: 0.8 },
});
