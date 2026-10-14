import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Parse, backendConfigured } from '@/lib/back4app';

const SEEN_KEY = 'mise.loggedNotifications';
type Event = 'received' | 'opened';

async function alreadyLogged(key: string) {
  try { return (JSON.parse((await AsyncStorage.getItem(SEEN_KEY)) ?? '[]') as string[]).includes(key); } catch { return false; }
}
async function markLogged(key: string) {
  try {
    const seen = JSON.parse((await AsyncStorage.getItem(SEEN_KEY)) ?? '[]') as string[];
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...seen, key].slice(-300)));
  } catch { /* dedupe is best effort */ }
}

/** Writes one row to the Back4App `NotificationLog` class, owned by the signed-in user. */
export async function logNotification(event: Event, notification: Notifications.Notification) {
  const user = backendConfigured ? Parse.User.current() : null;
  if (!user) return;
  const key = `${event}:${notification.request.identifier}`;
  if (await alreadyLogged(key)) return;
  const row = new Parse.Object('NotificationLog');
  row.set('user', user);
  row.set('event', event);
  row.set('notificationId', notification.request.identifier);
  row.set('title', notification.request.content.title ?? '');
  row.set('body', notification.request.content.body ?? '');
  row.set('meal', (notification.request.content.data as { meal?: string } | undefined)?.meal ?? 'test');
  row.set('deliveredAt', new Date(notification.date * 1000));
  row.set('platform', Platform.OS);
  const acl = new Parse.ACL(user);
  acl.setPublicReadAccess(false);
  row.setACL(acl);
  await row.save();
  await markLogged(key);
}

/** Listens for arrivals and taps while the app runs, and catches up on notifications that arrived while it was closed. */
export function startNotificationLogging() {
  if (Platform.OS === 'web') return () => {};
  const received = Notifications.addNotificationReceivedListener(n => { logNotification('received', n).catch(() => {}); });
  const opened = Notifications.addNotificationResponseReceivedListener(r => { logNotification('opened', r.notification).catch(() => {}); });
  Notifications.getPresentedNotificationsAsync()
    .then(list => Promise.all(list.map(n => logNotification('received', n).catch(() => {}))))
    .catch(() => {});
  return () => { received.remove(); opened.remove(); };
}
