import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, Image, TextInput,
  useWindowDimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import {
  Child, GOOD_DEEDS, BAD_DEEDS, fmtPts, fmtTime, groupByDay, isNice, score,
} from '../logic';
import { DeedMeter } from '../components/DeedMeter';
import { colors, serif } from '../theme';

const IMG_NICE = require('../../assets/santa_nice.jpg');
const IMG_NAUGHTY = require('../../assets/santa_naughty.jpg');

// Art is 848x1264. Rows SPLIT_TOP..SPLIT_BOT are plain parchment and can be stretched.
const IMG_W = 848;
const IMG_H = 1264;
const SPLIT_TOP = 640;
const SPLIT_BOT = 1105;
/** Extra card height as a fraction of card width. Raise for a bigger deed list. */
const EXTRA = 0.4;

/** Shows rows y0..y1 of the art, stretched to height h (width is always w). */
function ArtSlice({ src, w, s, y0, y1, h }: { src: number; w: number; s: number; y0: number; y1: number; h: number }) {
  const sy = h / ((y1 - y0) * s); // vertical stretch factor for this slice
  return (
    <View style={{ width: w, height: h, overflow: 'hidden' }}>
      <Image
        source={src}
        resizeMode="stretch"
        style={{ position: 'absolute', left: 0, top: -y0 * s * sy, width: w, height: IMG_H * s * sy }}
      />
    </View>
  );
}

type Props = {
  child: Child;
  locked: boolean;
  onUnlock: () => void;
  onBack: () => void;
  onAdd: (text: string, pts: number) => void;
  onRemove: (index: number) => void;
};

export function ChildScreen({ child, locked, onUnlock, onBack, onAdd, onRemove }: Props) {
  const { width } = useWindowDimensions();
  const w = Math.min(width, 520);
  const u = w / 100; // 1 "unit" = 1% of card width, keeps text proportional to the art
  const s = w / IMG_W; // art scale
  const midH = (SPLIT_BOT - SPLIT_TOP) * s + EXTRA * w;
  const cardH = SPLIT_TOP * s + midH + (IMG_H - SPLIT_BOT) * s;
  const nice = isNice(child);
  const total = score(child);
  const groups = groupByDay(child);

  const [open, setOpen] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [pts, setPts] = useState(1);

  const toggle = (key: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const addCustom = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), pts);
    setText('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Pressable style={styles.back} onPress={onBack}>
            <Text style={styles.backTxt}>← Back to summary</Text>
          </Pressable>
          {locked && (
            <Pressable style={styles.back} onPress={onUnlock}>
              <Text style={styles.backTxt}>🔒 Parent</Text>
            </Pressable>
          )}
        </View>

        {/* Santa holding the list. The plain parchment middle of the art is stretched
            taller (EXTRA) so the deed list gets more room without distorting Santa. */}
        <View style={{ width: w, height: cardH, alignSelf: 'center' }}>
          <ArtSlice src={nice ? IMG_NICE : IMG_NAUGHTY} w={w} s={s} y0={0} y1={SPLIT_TOP} h={SPLIT_TOP * s} />
          <ArtSlice src={nice ? IMG_NICE : IMG_NAUGHTY} w={w} s={s} y0={SPLIT_TOP} y1={SPLIT_BOT} h={midH} />
          <ArtSlice src={nice ? IMG_NICE : IMG_NAUGHTY} w={w} s={s} y0={SPLIT_BOT} y1={IMG_H} h={(IMG_H - SPLIT_BOT) * s} />
          <View style={[styles.paper, { top: 581 * s, bottom: 164 * s }]}>
            <Text style={[styles.small, { fontSize: 5 * u }]}>Santa's</Text>
            <Text style={[styles.big, { fontSize: 8.5 * u }]}>{nice ? 'Nice List' : 'Naughty List'}</Text>
            <View style={[styles.year, { marginVertical: 1.2 * u }]}>
              <Text style={[styles.yearTxt, { fontSize: 4 * u }]}>{new Date().getFullYear()}</Text>
            </View>
            <Text style={[styles.name, { fontSize: 7 * u }]} numberOfLines={1} adjustsFontSizeToFit>
              {child.name}
            </Text>
            <View style={{ marginTop: 2.4 * u, marginBottom: 0.6 * u }}>
              <DeedMeter total={total} scale={0.55 * (u / 5.2) + 0.2} />
            </View>

            <ScrollView style={{ flex: 1, marginVertical: u }} nestedScrollEnabled>
              {groups.length === 0 && <Text style={styles.none}>No deeds recorded yet…</Text>}
              {groups.map((g) => {
                const isOpen = open.has(g.key);
                return (
                  <View key={g.key} style={styles.day}>
                    <Pressable style={styles.dayHead} onPress={() => toggle(g.key)}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dayLbl, { fontSize: 3.4 * u }]}>
                          {isOpen ? '▾' : '▸'} {g.label}
                        </Text>
                        <Text style={[styles.when, { fontSize: 2.6 * u }]}>
                          {g.good} good · {g.bad} bad
                        </Text>
                      </View>
                      <Text style={[styles.pts, { fontSize: 3.6 * u, color: g.total >= 0 ? colors.green : colors.red }]}>
                        {fmtPts(g.total)} {g.total >= 0 ? '😇' : '😈'}
                      </Text>
                    </Pressable>
                    {isOpen &&
                      g.items.map(({ deed, index }) => (
                        <View key={index} style={styles.deed}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.deedTxt, { fontSize: 3.3 * u }]}>{deed.text}</Text>
                            <Text style={[styles.when, { fontSize: 2.5 * u }]}>{fmtTime(deed.date)}</Text>
                          </View>
                          <Text style={[styles.pts, { fontSize: 3.4 * u, color: deed.pts >= 0 ? colors.green : colors.red }]}>
                            {fmtPts(deed.pts)}
                          </Text>
                          {!locked && (
                            <Pressable onPress={() => onRemove(index)} hitSlop={8}>
                              <Text style={[styles.x, { fontSize: 3.6 * u }]}>✕</Text>
                            </Pressable>
                          )}
                        </View>
                      ))}
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.footer}>
              <Text style={[styles.total, { fontSize: 3.8 * u }]}>Total: {fmtPts(total)}</Text>
              <Text
                style={[
                  styles.stamp,
                  { fontSize: 5.2 * u, color: nice ? colors.green : colors.red, borderColor: nice ? colors.green : colors.red },
                ]}
              >
                {nice ? 'NICE' : 'NAUGHTY'}
              </Text>
            </View>
          </View>
        </View>

        {/* Add a deed */}
        {!locked && <View style={[styles.add, { width: w, alignSelf: 'center' }]}>
          <TextInput
            style={styles.input}
            placeholder="Describe the deed…"
            placeholderTextColor="#9a8660"
            value={text}
            onChangeText={setText}
          />
          <View style={styles.stepRow}>
            <Pressable style={styles.step} onPress={() => setPts((p) => Math.max(-10, p - 1))}>
              <Text style={styles.stepTxt}>−</Text>
            </Pressable>
            <Text style={[styles.ptsVal, { color: pts >= 0 ? '#8fe0a8' : '#ff9a93' }]}>{fmtPts(pts)}</Text>
            <Pressable style={styles.step} onPress={() => setPts((p) => Math.min(10, p + 1))}>
              <Text style={styles.stepTxt}>+</Text>
            </Pressable>
            <Pressable style={[styles.addBtn]} onPress={addCustom}>
              <Text style={styles.addBtnTxt}>Add</Text>
            </Pressable>
          </View>

          <Text style={styles.qh}>👍 Good:</Text>
          <View style={styles.quick}>
            {GOOD_DEEDS.map(([t, p]) => (
              <Pressable key={t} style={styles.q} onPress={() => onAdd(t, p)}>
                <Text style={styles.qTxt}>{fmtPts(p)} {t}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.qh}>👎 Bad:</Text>
          <View style={styles.quick}>
            {BAD_DEEDS.map(([t, p]) => (
              <Pressable key={t} style={styles.q} onPress={() => onAdd(t, p)}>
                <Text style={styles.qTxt}>{fmtPts(p)} {t}</Text>
              </Pressable>
            ))}
          </View>
        </View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  back: { backgroundColor: '#ffffff22', alignSelf: 'flex-start', borderRadius: 8, padding: 10, marginBottom: 12 },
  backTxt: { color: '#fff', fontSize: 16 },
  // same writing area as the HTML prototype
  paper: { position: 'absolute', left: '14%', right: '14%', top: '46%', bottom: '13%' },
  small: { textAlign: 'center', color: colors.green, fontStyle: 'italic', fontFamily: serif },
  big: { textAlign: 'center', color: colors.red, fontWeight: 'bold', fontFamily: serif },
  year: { borderTopWidth: 2, borderBottomWidth: 2, borderColor: colors.red },
  yearTxt: { textAlign: 'center', color: colors.green, letterSpacing: 4, fontFamily: serif },
  name: { textAlign: 'center', color: colors.red, fontWeight: 'bold', fontFamily: serif },
  none: { color: colors.ink, opacity: 0.6, fontStyle: 'italic', fontFamily: serif, textAlign: 'center', marginTop: 8 },
  day: { borderBottomWidth: 1, borderColor: '#5a7a5a88' },
  dayHead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dayLbl: { color: colors.ink, fontWeight: 'bold', fontFamily: serif },
  when: { color: '#6b5a3a', fontStyle: 'italic', fontFamily: serif },
  deed: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, paddingLeft: 12 },
  deedTxt: { color: colors.ink, fontFamily: serif },
  pts: { fontWeight: 'bold', fontFamily: serif },
  x: { color: '#8a6a3a', paddingHorizontal: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { color: colors.ink, fontWeight: 'bold', fontFamily: serif },
  stamp: {
    fontWeight: 'bold',
    letterSpacing: 3,
    borderWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 10,
    transform: [{ rotate: '-7deg' }],
    opacity: 0.85,
    fontFamily: serif,
  },
  add: { backgroundColor: '#0003', padding: 12, borderRadius: 10, marginTop: 14 },
  input: {
    backgroundColor: colors.cream,
    borderColor: '#8a6a3a',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.brown,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  step: { backgroundColor: '#ffffff33', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { color: '#fff', fontSize: 26, lineHeight: 30 },
  ptsVal: { fontSize: 22, fontWeight: 'bold', minWidth: 48, textAlign: 'center' },
  addBtn: { backgroundColor: colors.green, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, marginLeft: 'auto' },
  addBtnTxt: { color: '#fff', fontSize: 16 },
  qh: { color: '#fff', marginTop: 12, marginBottom: 4 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  q: { backgroundColor: colors.cream, borderColor: '#8a6a3a', borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 },
  qTxt: { color: colors.brown, fontSize: 14 },
});
