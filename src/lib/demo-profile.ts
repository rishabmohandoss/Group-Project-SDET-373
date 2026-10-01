// Fictional onboarding data for demos; never inferred from a person's name/email.
export function createDemoProfile() {
  return {
    age: 24,
    sex: 'female',
    weightKg: 65,
    device: {
      brand: 'Apple',
      model: 'Apple Watch Series 9',
      connectionStatus: 'demo',
      isConnected: false,
    },
    preferences: {
      diet: 'Mediterranean',
      favoriteCuisines: ['Mediterranean', 'Japanese'],
      dislikedFoods: ['Mushrooms'],
      mealBudgetMin: 6,
      mealBudgetMax: 12,
      currency: 'USD',
      maxCookingMinutes: 30,
      spiceLevel: 'Hot',
      goals: ['Eat balanced meals', 'Improve energy'],
    },
    profileDataSource: 'demo',
    demoProfileVersion: 1,
  };
}

export type DemoProfile = ReturnType<typeof createDemoProfile>;
