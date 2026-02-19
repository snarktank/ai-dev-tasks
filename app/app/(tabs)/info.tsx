import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InfoScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('@/assets/images/main_background/bg_info.jpeg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 56, paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Varför är det viktigt att vara hållbar?</Text>
          <Text style={styles.paragraph}>
            Hållbarhet minskar resursförbrukning, utsläpp och avfall, vilket förbättrar både klimat och hälsa.
            Små förändringar i vardagen—som att resa smartare, äta mer växtbaserat och minska energiförbrukning—har
            stor effekt när många gör dem tillsammans.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hur mycket vegetarisk mat hjälper klimatet?</Text>
          <Text style={styles.paragraph}>
            Växtbaserad kost ger ofta betydligt lägre klimatpåverkan än kött, särskilt nötkött och lamm.
            Om fler byter några måltider i veckan till vegetariskt kan utsläppen minska markant över tid.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enkla steg för att komma igång</Text>
          <Text style={styles.bullet}>• Planera vegetariska måltider ett par gånger i veckan.</Text>
          <Text style={styles.bullet}>• Cykla, gå eller åk kollektivt där det är möjligt.</Text>
          <Text style={styles.bullet}>• Sänk inomhustemperaturen och släck onödig belysning.</Text>
          <Text style={styles.bullet}>• Återvinn och minska engångsartiklar.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tillsammans gör vi skillnad</Text>
          <Text style={styles.paragraph}>
            I GreenUp kan du se din egen minskning och hur alla användare tillsammans bidrar. Ju fler som deltar,
            desto större blir effekten.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  paragraph: {
    color: '#2a2a2a',
    lineHeight: 20,
  },
  bullet: {
    color: '#2a2a2a',
    lineHeight: 20,
  },
});


