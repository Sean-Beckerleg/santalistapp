import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'santaList_reminders';

// Show notifications even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function loadRemindersOn(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === 'on';
}

async function saveRemindersOn(on: boolean) {
  await AsyncStorage.setItem(KEY, on ? 'on' : 'off');
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Santa reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Days before Christmas (and message) for the countdown reminders, sent at 9:00 AM. */
const MILESTONES: [number, string][] = [
  [30, '🎄 30 days until Christmas! Santa is watching…'],
  [14, '🎅 Two weeks until Christmas! Keep those good deeds coming.'],
  [7, '🎁 One week until Christmas! Is everyone on the Nice List?'],
  [1, '⭐ Christmas Eve is tomorrow! Final check of the list.'],
];

/** Replace every scheduled reminder with a fresh set. */
export async function scheduleReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Every evening at 7 PM.
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Santa's List",
      body: "Don't forget to log today's deeds! 🎅",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0 },
  });

  // Countdown milestones for the next Christmas.
  const now = new Date();
  let year = now.getFullYear();
  if (now > new Date(year, 11, 25, 7, 0)) year += 1;

  const when: [Date, string][] = MILESTONES.map(([days, msg]) => [
    new Date(year, 11, 25 - days, 9, 0),
    msg,
  ]);
  when.push([new Date(year, 11, 25, 7, 0), '🎄 Merry Christmas! 🎁']);

  for (const [date, body] of when) {
    if (date > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "Santa's List", body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  }
}

/** Turn reminders on/off. Returns the resulting state (false if permission was denied). */
export async function setReminders(on: boolean): Promise<boolean> {
  if (on) {
    if (!(await ensurePermission())) {
      await saveRemindersOn(false);
      return false;
    }
    await scheduleReminders();
    await saveRemindersOn(true);
    return true;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  await saveRemindersOn(false);
  return false;
}

/** Re-schedule on app start so milestones roll over to the next year. */
export async function refreshRemindersIfOn() {
  if (await loadRemindersOn()) {
    try {
      await scheduleReminders();
    } catch {}
  }
}
