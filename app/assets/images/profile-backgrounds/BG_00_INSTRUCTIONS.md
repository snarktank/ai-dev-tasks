# Instruktioner för bg_00 (Exklusiv Bakgrund)

## Vad är bg_00?
`bg_00` är en exklusiv profilbakgrund som **INTE** visas som ett val i profil-inställningarna. Den kan endast sättas manuellt i databasen.

## Hur lägger du till bilderna?

### 1. Lägg till portrait-bild
Placera din fullstorlek profilbakgrund här:
```
assets/images/profile-backgrounds/portrait/bg_00.jpeg
```

### 2. Lägg till thumbnail
Placera din thumbnail här:
```
assets/images/profile-backgrounds/thumbs/bg_00.png
```

### 3. Uppdatera koden
Efter att du lagt till bilderna, uppdatera dessa rader i:
`src/constants/profileBackgrounds.ts`

Ändra från:
```typescript
bg_00: require('../../assets/images/profile-backgrounds/portrait/bg_01.jpeg'), // TODO: Byt till rätt bg_00 bild
```

Till:
```typescript
bg_00: require('../../assets/images/profile-backgrounds/portrait/bg_00.jpeg'),
```

Och samma för thumbnails:
```typescript
bg_00: require('../../assets/images/profile-backgrounds/thumbs/bg_00.png'),
```

## Hur sätter du bg_00 för en användare?

1. Gå till **Supabase Dashboard**
2. Öppna **Table Editor** → `profiles`
3. Hitta användaren
4. Ändra `background_key` till `bg_00`
5. Spara

Nu kommer användaren att ha den exklusiva bakgrunden! 🎨

## Viktigt
- Användaren kan **inte** byta tillbaka till bg_00 via appen om de väljer en annan bakgrund
- De kan bara få tillbaka bg_00 genom att du sätter det manuellt i databasen igen
- bg_00 syns **inte** i bakgrundsväljar-karusellen i appen
