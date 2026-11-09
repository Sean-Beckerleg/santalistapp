import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Child, newId } from '../logic';
import { colors, serif } from '../theme';

type Props = {
  visible: boolean;
  kids: Child[];
  onSave: (kids: Child[]) => void;
  onCancel: () => void;
};

/** Add / rename / remove children. Existing children keep their deeds. */
export function SetupModal({ visible, kids, onSave, onCancel }: Props) {
  const [rows, setRows] = useState<{ id: string; name: string }[]>([]);

  const reset = () => {
    setRows(kids.length ? kids.map((k) => ({ id: k.id, name: k.name })) : [{ id: '', name: '' }]);
  };

  const save = () => {
    const old = new Map(kids.map((k) => [k.id, k]));
    const next: Child[] = [];
    rows.forEach((r) => {
      const name = r.name.trim();
      if (!name) return;
      const existing = r.id && old.get(r.id);
      next.push(existing ? { ...existing, name } : { id: newId(), name, deeds: [] });
    });
    onSave(next);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={reset} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.h}>Add Children</Text>
          <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
            {rows.map((r, i) => (
              <View key={i} style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="Child's name"
                  placeholderTextColor="#9a8660"
                  value={r.name}
                  onChangeText={(t) => setRows(rows.map((x, j) => (j === i ? { ...x, name: t } : x)))}
                />
                <Pressable onPress={() => setRows(rows.filter((_, j) => j !== i))}>
                  <Text style={styles.x}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
          <Pressable onPress={() => setRows([...rows, { id: '', name: '' }])}>
            <Text style={styles.add}>+ another child</Text>
          </Pressable>
          <View style={styles.btns}>
            <Pressable style={[styles.btn, { backgroundColor: colors.green }]} onPress={save}>
              <Text style={styles.btnTxt}>Save</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.red }]} onPress={onCancel}>
              <Text style={styles.btnTxt}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 20 },
  box: { backgroundColor: colors.parch, borderRadius: 12, padding: 20 },
  h: { fontFamily: serif, fontSize: 22, color: colors.brown, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  input: {
    flex: 1,
    backgroundColor: colors.cream,
    borderColor: '#8a6a3a',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.brown,
  },
  x: { fontSize: 20, color: '#8a6a3a', paddingHorizontal: 10 },
  add: { color: colors.brown, marginTop: 8, fontSize: 16, textDecorationLine: 'underline' },
  btns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  btnTxt: { color: '#fff', fontSize: 16 },
});
