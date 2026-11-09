import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { colors, serif } from '../theme';

type Props = {
  visible: boolean;
  /** 'enter' asks for the existing PIN, 'create' sets a new one. */
  mode: 'enter' | 'create';
  verify: (pin: string) => boolean;
  onSuccess: (pin: string) => void;
  onCancel: () => void;
  /** Called after the parent confirms they want to erase everything. */
  onForgot: () => void;
};

export function PinModal({ visible, mode, verify, onSuccess, onCancel, onForgot }: Props) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setPin('');
    setConfirm('');
    setError('');
  };

  const submit = () => {
    if (pin.length !== 4) return setError('PIN must be 4 digits.');
    if (mode === 'create') {
      if (pin !== confirm) return setError('PINs do not match.');
      reset();
      onSuccess(pin);
    } else if (verify(pin)) {
      reset();
      onSuccess(pin);
    } else {
      setPin('');
      setError('Wrong PIN. Try again.');
    }
  };

  const forgot = () =>
    Alert.alert(
      'Forgot PIN?',
      'This will erase ALL children and deeds and reset the app to its default state. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase & reset',
          style: 'destructive',
          onPress: () => {
            reset();
            onForgot();
          },
        },
      ],
    );

  const digits = (t: string) => t.replace(/\D/g, '').slice(0, 4);

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={reset} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.h}>{mode === 'create' ? '🔒 Create Parent PIN' : '🔒 Parent PIN'}</Text>
          <Text style={styles.sub}>
            {mode === 'create'
              ? 'Choose a 4-digit PIN so only a parent can change points.'
              : 'Enter your PIN to make changes.'}
          </Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={(t) => {
              setPin(digits(t));
              setError('');
            }}
            placeholder="PIN"
            placeholderTextColor="#9a8660"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            autoFocus
            onSubmitEditing={submit}
          />
          {mode === 'create' && (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={confirm}
              onChangeText={(t) => {
                setConfirm(digits(t));
                setError('');
              }}
              placeholder="Confirm PIN"
              placeholderTextColor="#9a8660"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              onSubmitEditing={submit}
            />
          )}
          {!!error && <Text style={styles.err}>{error}</Text>}
          <View style={styles.btns}>
            <Pressable style={[styles.btn, { backgroundColor: colors.green }]} onPress={submit}>
              <Text style={styles.btnTxt}>{mode === 'create' ? 'Set PIN' : 'Unlock'}</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.red }]} onPress={onCancel}>
              <Text style={styles.btnTxt}>Cancel</Text>
            </Pressable>
          </View>
          {mode === 'enter' && (
            <Pressable onPress={forgot}>
              <Text style={styles.forgot}>Forgot PIN?</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 20 },
  box: { backgroundColor: colors.parch, borderRadius: 12, padding: 20 },
  h: { fontFamily: serif, fontSize: 22, color: colors.brown, fontWeight: 'bold' },
  sub: { color: colors.brown, marginTop: 4, marginBottom: 12 },
  input: {
    backgroundColor: colors.cream,
    borderColor: '#8a6a3a',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.brown,
  },
  err: { color: colors.red, marginTop: 8, fontWeight: 'bold' },
  btns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  btnTxt: { color: '#fff', fontSize: 16 },
  forgot: { color: colors.red, marginTop: 14, textDecorationLine: 'underline', textAlign: 'center' },
});
