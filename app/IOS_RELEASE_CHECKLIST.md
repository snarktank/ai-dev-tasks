# GreenUp - iOS App Store Release Checklista

## ✅ Färdigt (Automatiskt fixat)
- [x] iOS konfiguration i app.json
- [x] Bundle Identifier: `com.greenup.app`
- [x] Privacy permissions beskrivningar
- [x] EAS Build konfiguration (eas.json)

## 📋 Du måste göra följande:

### 1. Apple Developer Account (Obligatoriskt)
- [ ] Gå till https://developer.apple.com
- [ ] Skapa/logga in med ditt Apple ID
- [ ] Betala årsavgiften (99 USD)
- [ ] Godkänn användarvillkoren

### 2. Installera EAS CLI
```bash
npm install -g eas-cli
```

### 3. Logga in på Expo
```bash
eas login
```

### 4. Konfigurera projektet
```bash
cd /Users/frodemaneskold/Desktop/Justus/greenup/app
eas build:configure
```

### 5. Uppdatera eas.json med dina uppgifter
✅ **Apple Team ID**: Redan satt! (`U7L2HGTZK7`)
✅ **Apple ID**: Redan satt! (`frode.maneskold@outlook.com`)

Du behöver fortfarande uppdatera:
```json
"ascAppId": "ditt-app-store-connect-id"
```

**Hitta denna uppgift:**
- **ASC App ID**: Skapas när du skapar appen i App Store Connect (steg 7). Det är ett 10-siffrigt nummer.

### 6. Bygg appen för iOS
```bash
eas build --platform ios
```

Detta kommer:
- Skapa ett Apple Developer certifikat
- Skapa en provisioning profile
- Bygga din app i molnet
- Ta ca 10-20 minuter

### 7. Skapa app i App Store Connect
- [ ] Gå till https://appstoreconnect.apple.com
- [ ] Klicka på "My Apps" → "+" → "New App"
- [ ] Fyll i:
  - **Platform**: iOS
  - **Name**: GreenUp
  - **Primary Language**: Swedish
  - **Bundle ID**: com.greenup.app (välj från dropdown)
  - **SKU**: greenup-ios-v1 (eller något unikt)

### 8. Förbered App Store metadata

#### Screenshots (Obligatoriskt)
Du behöver screenshots för minst en enhetsstorlek:
- **iPhone 6.7"** (iPhone 15 Pro Max): 1290 x 2796 pixels
- **iPhone 6.5"** (iPhone 11 Pro Max): 1242 x 2688 pixels
- **iPhone 5.5"** (iPhone 8 Plus): 1242 x 2208 pixels

Tips: 
- Använd iOS Simulator för att ta screenshots
- Behöver minst 3 screenshots (max 10)
- Kör: `xcrun simctl io booted screenshot screenshot.png`

#### App Information
- [ ] **App Beskrivning** (max 4000 tecken)
- [ ] **Keywords** (max 100 tecken, kommaseparerade)
- [ ] **Support URL** (din webbsida eller support email)
- [ ] **Marketing URL** (valfritt)
- [ ] **Privacy Policy URL** (Obligatoriskt!)

#### Age Rating
- [ ] Fyll i "App Privacy" frågorna
- [ ] Sätt åldersklassificering

### 9. Privacy Policy (Obligatoriskt!)
Du måste ha en privacy policy. Exempel struktur:

```markdown
# Privacy Policy för GreenUp

## Data vi samlar in
- Användarnamn och email
- Profilbilder
- Aktivitetsdata och poäng
- [Lägg till mer baserat på din app]

## Hur vi använder data
- För att ge dig en personlig upplevelse
- För att visa dina framsteg
- [Lägg till mer]

## Datadelning
Vi delar inte dina personuppgifter med tredje part.

## Kontakt
[Din email]
```

Lägg upp den på:
- Din egen webbsida
- GitHub Pages (gratis)
- Eller använd en privacy policy generator

### 10. Ladda upp builden till App Store
När din build är klar från EAS:

```bash
eas submit --platform ios
```

Eller ladda upp manuellt via Transporter app från Mac App Store.

### 11. Skicka in för granskning
I App Store Connect:
- [ ] Välj din build under "Build" sektionen
- [ ] Fyll i all metadata
- [ ] Lägg till screenshots
- [ ] Lägg till App Privacy information
- [ ] Klicka "Save"
- [ ] Klicka "Submit for Review"

### 12. Vänta på granskning
- Granskningsprocessen tar normalt 1-3 dagar
- Du får email när status ändras
- Apple kan avvisa om något saknas eller bryter mot deras riktlinjer

## 🚨 Viktiga saker att tänka på

### Bundle Identifier
Jag har satt `com.greenup.app` - ändra detta om du vill ha något annat NU innan du börjar bygga. Efter första builden kan du inte ändra det.

### Version & Build Number
- **Version**: `1.0.0` (syns för användare)
- **Build Number**: Auto-incrementeras av EAS

### Supabase API Keys
⚠️ **VIKTIGT**: Du har API nycklar exponerade i app.json. För produktion bör du:
1. Flytta dem till environment variables
2. Inte committa dem till Git
3. Använd `.env` filen istället

### Kostnad
- Apple Developer: 99 USD/år
- EAS Build: Gratis för första 30 builds/månad

## 📱 Testa innan release

### TestFlight (Rekommenderat)
Innan du publicerar, testa med riktiga användare:

```bash
eas build --platform ios --profile preview
```

Sedan bjud in testare via App Store Connect → TestFlight

## ❓ Vanliga problem

### "No bundle identifier"
- Kontrollera att `bundleIdentifier` finns i app.json

### "Missing provisioning profile"
- Kör `eas credentials` för att hantera certificates

### "Build failed"
- Kolla EAS dashboard för felmeddelanden
- Vanligt: Dependency konflikter eller native module issues

## 📚 Användbara länkar

- [Expo EAS Documentation](https://docs.expo.dev/build/introduction/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [EAS Build Dashboard](https://expo.dev/accounts/[your-account]/projects/greenup/builds)

## Nästa steg
Börja med steg 1: Skaffa Apple Developer Account!
