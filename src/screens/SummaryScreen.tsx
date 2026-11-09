import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Child, fmtPts, isNice, score } from '../logic';
import { DeedMeter } from '../components/DeedMeter';
import { ChristmasCountdown } from '../components/ChristmasCountdown';
import { colors, serif } from '../theme';

type Props = {
  kids: Child[];
  locked: boolean;
  remindersOn: boolean;
  onToggleReminders: () => void;
  onOpen: (id: string) => void;
  onEdit: () => void;
};

export function SummaryScreen({ kids, locked, remindersOn, onToggleReminders, onOpen, onEdit }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>🎅 Santa's List</Text>
      <Text style={styles.tag}>Naughty or Nice? The Deed Meter knows!</Text>
      <View style={{ marginTop: 10, marginBottom: 14 }}>
        <ChristmasCountdown />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Pressable style={[styles.btn, { marginBottom: 0 }]} onPress={onEdit}>
          <Text style={styles.btnTxt}>{locked ? '🔒' : '🔓'} Set up / edit children</Text>
        </Pressable>
        <Pressable style={[styles.btn, { marginBottom: 0, backgroundColor: remindersOn ? colors.red : '#ffffff22' }]} onPress={onToggleReminders}>
          <Text style={styles.btnTxt}>🔔 Reminders: {remindersOn ? 'On' : 'Off'}</Text>
        </Pressable>
      </View>

      {kids.length === 0 && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={styles.emptyH}>No children yet</Text>
          <Text style={styles.empty}>Tap the button above to add your little ones.</Text>
        </View>
      )}

      {kids.map((k) => {
        const nice = isNice(k);
        const s = score(k);
        return (
          <Pressable key={k.id} onPress={() => onOpen(k.id)} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <LinearGradient colors={[colors.parch, colors.parch2]} style={styles.card}>
              <Text style={styles.name}>{k.name}</Text>
              <Text style={[styles.status, { color: nice ? colors.green : colors.red }]}>
                {nice ? '✔ NICE LIST' : '✖ NAUGHTY LIST'}
              </Text>
              <View style={{ marginTop: 12 }}>
                <DeedMeter total={s} />
              </View>
              <Text style={styles.score}>
                Deed Meter: <Text style={{ fontWeight: 'bold' }}>{fmtPts(s)}</Text>
              </Text>
            </LinearGradient>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  title: { fontFamily: serif, fontSize: 30, color: '#f6e7c1', textAlign: 'center', fontWeight: 'bold' },
  tag: { color: '#cfe3d6', textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
  btn: { backgroundColor: colors.green, borderRadius: 8, padding: 12, alignSelf: 'flex-start', marginBottom: 14 },
  btnTxt: { color: '#fff', fontSize: 16 },
  emptyH: { color: '#fff', fontSize: 22, fontFamily: serif },
  empty: { color: '#cfe3d6', marginTop: 6 },
  card: {
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.red,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  name: { fontFamily: serif, fontSize: 24, color: colors.ink, fontWeight: 'bold' },
  status: { fontWeight: 'bold', letterSpacing: 1, fontSize: 14 },
  score: { color: colors.ink, fontSize: 17, marginTop: 6, fontFamily: serif },
});
