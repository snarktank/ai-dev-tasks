import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingProps {
  onComplete: () => void;
}

/**
 * Onboarding-komponent som visas första gången användaren öppnar appen.
 * Innehåller en välkomsttext och en knapp för att fortsätta till login.
 */
export default function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <LinearGradient
      colors={['#6b9467', '#5a8a5e', '#4a7a4e']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Huvudrubrik */}
        <Text style={styles.title}>Välkommen till GreenUp</Text>
        
        {/* Primär undertext */}
        <Text style={styles.subtitle}>
          Var med och förbättra klimatet – ett steg i taget.
        </Text>
        
        {/* Stödjande text */}
        <Text style={styles.supportingText}>
          "Ingen kan göra allt, men alla kan göra något."
        </Text>
      </View>

      {/* Primär knapp längst ner */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={onComplete}
          accessibilityLabel="Gå vidare till login"
        >
          <Text style={styles.buttonText}>Gå vidare</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.2, // Börja 20% från toppen
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#f0f8f0',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  supportingText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#2f7147',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
