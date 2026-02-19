/**
 * Script för att återställa onboarding-status.
 * Detta är användbart under utveckling när du vill testa onboarding-flödet igen.
 * 
 * Använd detta genom att importera och köra resetOnboardingForDev() 
 * någonstans i din app (t.ex. i _layout.tsx).
 */

import { resetOnboarding } from '@/lib/onboarding-storage';

export async function resetOnboardingForDev() {
  console.log('🔄 Återställer onboarding-status...');
  await resetOnboarding();
  console.log('✅ Onboarding-status har återställts. Appen kommer visa onboarding nästa gång.');
}
