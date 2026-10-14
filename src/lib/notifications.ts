import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type Meal = { id: MealId; hour: number; minute: number; title: string; messages: string[] };
export type MealId = 'breakfast' | 'lunch' | 'dinner';
export type NotificationSettings = {
  enabled: boolean;
  sound: boolean;
  meals: Record<MealId, { enabled: boolean; minutes: number }>; // minutes after midnight
};
export const MEAL_LABELS: Record<MealId, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  meals: { breakfast: { enabled: true, minutes: 8 * 60 }, lunch: { enabled: true, minutes: 12 * 60 + 30 }, dinner: { enabled: true, minutes: 18 * 60 + 30 } },
};
const SETTINGS_KEY = 'mise.notificationSettings';

export async function loadSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...saved, meals: { ...DEFAULT_SETTINGS.meals, ...saved.meals } };
  } catch { return DEFAULT_SETTINGS; }
}
export async function saveSettings(settings: NotificationSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  await scheduleMealReminders();
}
export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

const MEALS: Meal[] = [
  { id: 'breakfast', hour: 8, minute: 0, title: 'Breakfast time', messages: [
    'Warm oats, yogurt and berries are ready when you are.',
    'Start soft: something simple before the day gets loud.',
    'Your morning menu is in. Breakfast takes ten minutes.',
  ] },
  { id: 'lunch', hour: 12, minute: 30, title: 'Lunch reminder', messages: [
    'Step away for a proper lunch. Your picks are waiting.',
    'Midday check-in: something good and quick is on the menu.',
    'Pause, eat, then get back to it.',
  ] },
  { id: 'dinner', hour: 18, minute: 30, title: 'Dinner reminder', messages: [
    'Tonight’s dinner fits your 30 minutes. Take a look.',
    'Time to cook something good. Your menu is ready.',
    'Wind down with dinner. Tonight’s pick is in the app.',
  ] },
];
const DAYS_AHEAD = 7;

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export async function ensurePermission() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'Meal reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function sendTestNotification() {
  if (!(await ensurePermission())) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'MISE', body: 'Notifications are working. Your meal reminders are on.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });
  return true;
}

/** Schedules breakfast, lunch and dinner for the next week with a varied message each day. Safe to call on every launch. */
export async function scheduleMealReminders() {
  if (!(await ensurePermission())) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const settings = await loadSettings();
  if (!settings.enabled) return true;
  const now = new Date();
  for (let day = 0; day < DAYS_AHEAD; day++) {
    for (const meal of MEALS) {
      const config = settings.meals[meal.id];
      if (!config.enabled) continue;
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, 0, config.minutes);
      if (date <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: meal.title, body: meal.messages[(date.getDate() + day) % meal.messages.length], data: { meal: meal.id }, sound: settings.sound },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  }
  return true;
}

/** Gets this device's Expo push token and saves it on the signed-in Back4App user (field: expoPushToken). */
export async function registerPushToken() {
  if (Platform.OS === 'web' || !(await ensurePermission())) return null;
  const Constants = (await import('expo-constants')).default;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  const { Parse } = await import('@/lib/back4app');
  const user = Parse.User.current();
  if (user && user.get('expoPushToken') !== data) { user.set('expoPushToken', data); await user.save(); }
  return data;
}
