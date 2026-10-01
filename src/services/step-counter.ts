export type StepCounterState =
  | 'idle'
  | 'connecting'
  | 'loading'
  | 'ready'
  | 'unavailable'
  | 'error';

export type StepCounterPlatform = 'Demo wearable' | 'Preview';

export type StepCounterService = {
  platform: StepCounterPlatform;
  requestStepPermissions: () => Promise<boolean>;
  readTodaySteps: () => Promise<number>;
};

export const stepCounterService: StepCounterService = {
  platform: 'Demo wearable',

  requestStepPermissions: async () => true,

  // Sample data keeps the demo useful until a wearable provider is connected.
  readTodaySteps: async () => 6842,
};
