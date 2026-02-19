import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@greenup:onboarding_completed';

/**
 * Kontrollerar om användaren redan har gått igenom onboardingen.
 * @returns true om onboarding redan är genomförd, annars false
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Fel vid läsning av onboarding-status:', error);
    return false;
  }
}

/**
 * Markerar onboardingen som genomförd och sparar detta i AsyncStorage.
 */
export async function setOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Fel vid sparande av onboarding-status:', error);
  }
}

/**
 * Återställer onboarding-status (användbart för testning).
 * OBS: Använd endast för utveckling/testning!
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Fel vid återställning av onboarding-status:', error);
  }
}
