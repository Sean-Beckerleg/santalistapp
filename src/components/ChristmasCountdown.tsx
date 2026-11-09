import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { countdownToChristmas } from '../logic';
import { colors } from '../theme';

export function ChristmasCountdown() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const c = countdownToChristmas();
  return (
    <View style={styles.pill}>
      {c ? (
        <>
          <Text style={styles.main}>
            🎄 {c.d} day{c.d === 1 ? '' : 's'} until Christmas!
          </Text>
          <Text style={styles.sub}>{`${c.d}d ${c.h}h ${c.m}m ${c.s}s`}</Text>
        </>
      ) : (
        <Text style={styles.main}>🎄 Merry Christmas! 🎁</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    backgroundColor: colors.red,
    borderColor: '#f6e7c1',
    borderWidth: 2,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  main: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sub: { color: '#fff', opacity: 0.9, fontSize: 12 },
});
