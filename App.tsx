import React, { useEffect, useRef, useState } from 'react';
import { AppState, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loadRemindersOn, refreshRemindersIfOn, setReminders } from './src/notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Child } from './src/logic';
import { loadKids, saveKids, loadPin, savePin, resetAll } from './src/storage';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { ChildScreen } from './src/screens/ChildScreen';
import { SetupModal } from './src/screens/SetupModal';
import { PinModal } from './src/screens/PinModal';
import { colors } from './src/theme';

export default function App() {
  const [kids, setKids] = useState<Child[]>([]);
  const [pin, setPin] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const pending = useRef<(() => void) | null>(null); // action waiting for the PIN

  useEffect(() => {
    refreshRemindersIfOn();
    loadRemindersOn().then(setRemindersOn);
  }, []);

  const toggleReminders = async () => {
    const next = await setReminders(!remindersOn);
    setRemindersOn(next);
    if (!next && !remindersOn) {
      Alert.alert('Notifications are off', "Allow notifications for Santa's List in your phone settings to get reminders.");
    }
  };

  useEffect(() => {
    Promise.all([loadKids(), loadPin()]).then(([k, p]) => {
      setKids(k);
      setPin(p);
      setLoaded(true);
      if (k.length === 0) setSetupOpen(true); // first run
    });
  }, []);

  // Relock whenever the app goes to the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st !== 'active') setUnlocked(false);
    });
    return () => sub.remove();
  }, []);

  const update = (next: Child[]) => {
    setKids(next);
    saveKids(next);
  };

  /** Run `action` now if unlocked, otherwise ask for (or create) the PIN first. */
  const requireParent = (action?: () => void) => {
    if (unlocked) return action?.();
    pending.current = action ?? null;
    setPinOpen(true);
  };

  const pinSuccess = async (entered: string) => {
    if (pin === null) {
      await savePin(entered);
      setPin(entered);
    }
    setUnlocked(true);
    setPinOpen(false);
    const act = pending.current;
    pending.current = null;
    act?.();
  };

  const pinCancel = () => {
    pending.current = null;
    setPinOpen(false);
  };

  const forgotPin = async () => {
    await resetAll();
    setKids([]);
    setPin(null);
    setUnlocked(false);
    setViewId(null);
    setPinOpen(false);
    pending.current = null;
    setSetupOpen(true); // back to the first-run state
  };

  const addDeed = (id: string, text: string, pts: number) =>
    update(kids.map((k) => (k.id === id ? { ...k, deeds: [...k.deeds, { text, pts, date: Date.now() }] } : k)));

  const removeDeed = (id: string, index: number) =>
    update(kids.map((k) => (k.id === id ? { ...k, deeds: k.deeds.filter((_, i) => i !== index) } : k)));

  const child = kids.find((k) => k.id === viewId);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        {loaded &&
          (child ? (
            <ChildScreen
              child={child}
              locked={!unlocked}
              onUnlock={() => requireParent()}
              onBack={() => {
                setUnlocked(false);
                setViewId(null);
              }}
              onAdd={(t, p) => addDeed(child.id, t, p)}
              onRemove={(i) => removeDeed(child.id, i)}
            />
          ) : (
            <SummaryScreen
              kids={kids}
              locked={!unlocked}
              remindersOn={remindersOn}
              onToggleReminders={toggleReminders}
              onOpen={setViewId}
              onEdit={() => requireParent(() => setSetupOpen(true))}
            />
          ))}
        <SetupModal
          visible={setupOpen}
          kids={kids}
          onCancel={() => setSetupOpen(false)}
          onSave={(next) => {
            update(next);
            setSetupOpen(false);
            // Right after first-time setup, ask the parent to create a PIN.
            if (pin === null && next.length > 0) requireParent();
          }}
        />
        <PinModal
          visible={pinOpen}
          mode={pin === null ? 'create' : 'enter'}
          verify={(p) => p === pin}
          onSuccess={pinSuccess}
          onCancel={pinCancel}
          onForgot={forgotPin}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
