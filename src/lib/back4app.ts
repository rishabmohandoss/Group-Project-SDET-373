import AsyncStorage from '@react-native-async-storage/async-storage';
import Parse from 'parse/react-native';

const applicationId = process.env.EXPO_PUBLIC_BACK4APP_APP_ID ?? 'L8v7G69IRaZFISjgU5IqNikgu5xIiqJJQ6cCXgRc';
const javascriptKey = process.env.EXPO_PUBLIC_BACK4APP_JAVASCRIPT_KEY ?? '';
export const backendConfigured = Boolean(applicationId && javascriptKey);
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(applicationId, javascriptKey);
Parse.serverURL = 'https://parseapi.back4app.com/';
export { Parse };
