import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';
import { cleanName } from '../content/personalization';
import { useLibrary } from '../state/Library';
import { Button, Card, colors, styles } from './ui';
import { MusicPreview } from './MusicPreview';

export function FamilySettings() {
  const library = useLibrary();
  const [draft, setDraft] = useState(library.settings);
  const [friendText, setFriendText] = useState(library.settings.friends.join(', '));
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    void Speech.getAvailableVoicesAsync().then(list => { if (active) setVoices(list.filter(v => v.language.toLowerCase().startsWith('fr'))); }).catch(() => {});
    return () => { active = false; void Speech.stop(); };
  }, []);
  const input = { borderWidth: 1, borderColor: colors.muted, padding: 14, borderRadius: 12, fontSize: 18, color: colors.ink };
  return <Card>
    <Text style={styles.heading}>Son prénom, ses amis</Text>
    <Text style={styles.muted}>Prénoms seulement, conservés sur cet appareil. Trois amis maximum. Il pourra ensuite choisir lesquels participent.</Text>
    <TextInput accessibilityLabel="Prénom du héros" placeholder="Prénom du héros" value={draft.hero} onChangeText={hero => setDraft({ ...draft, hero })} maxLength={24} autoCorrect={false} style={input} />
    <TextInput accessibilityLabel="Prénoms des amis" placeholder="Amis, séparés par des virgules" value={friendText} onChangeText={setFriendText} maxLength={78} autoCorrect={false} style={input} />
    <Text style={styles.heading}>La voix</Text>
    <Text style={styles.muted}>Voix françaises disponibles sur votre appareil. Ce choix ne remplace pas encore la voix par une narration professionnelle.</Text>
    <Button secondary={draft.voice !== ''} title="Voix française par défaut" onPress={() => setDraft({ ...draft, voice: '' })} />
    {voices.map(voice => <Button key={voice.identifier} secondary={draft.voice !== voice.identifier} title={`${voice.name}${voice.quality === Speech.VoiceQuality.Enhanced ? ' · améliorée' : ''}`} onPress={() => setDraft({ ...draft, voice: voice.identifier })} />)}
    <Button secondary title="Essayer la voix" onPress={() => {
      const hero = cleanName(draft.hero) || 'notre héros';
      void Speech.stop().then(() => Speech.speak(`Bonjour ${hero}. Une petite aventure nous attend au village des Tilleuls.`, { language: 'fr-FR', voice: draft.voice || undefined, rate: 0.9 }));
    }} />
    <Text style={styles.heading}>Musique douce</Text>
    <Text style={styles.muted}>Version musique 0.2.1 · Testez la musique seule au volume choisi, puis enregistrez les réglages.</Text>
    <View style={styles.row}><Button secondary={!draft.music} title="Avec musique" onPress={() => setDraft({ ...draft, music: true })} /><Button secondary={draft.music} title="Sans musique" onPress={() => setDraft({ ...draft, music: false })} /></View>
    <View style={styles.row}>{([0.06, 0.12, 0.2] as const).map((volume, i) => <Button key={volume} secondary={draft.musicVolume !== volume} title={['Très douce', 'Douce', 'Plus présente'][i]} onPress={() => setDraft({ ...draft, musicVolume: volume })} />)}</View>
    <MusicPreview volume={draft.musicVolume} />
    <Text style={styles.heading}>Budget futur de l’IA</Text>
    <View style={styles.row}>{([5, 10] as const).map(budget => <Button key={budget} secondary={draft.monthlyBudget !== budget} title={`${budget} € / mois`} onPress={() => setDraft({ ...draft, monthlyBudget: budget })} />)}</View>
    <Text style={styles.muted}>Service payant non activé. Cette préférence n’est pas encore un plafond de facturation serveur. Aucun appel IA ni TTS payant n’est effectué par cette version.</Text>
    <Button title="Enregistrer la personnalisation" onPress={() => {
      const names = friendText.split(',').map(n => n.trim()).filter(Boolean);
      if (!cleanName(draft.hero) || names.length > 3 || names.some(n => !cleanName(n))) {
        setMessage('Indiquez un prénom de 24 caractères maximum et jusqu’à trois amis séparés par des virgules. Lettres, espaces, apostrophes et tirets seulement.'); return;
      }
      const settings = { ...draft, hero: cleanName(draft.hero), friends: names.map(cleanName), selectedFriends: [] };
      void Speech.stop();
      void library.saveSettings(settings).then(ok => setMessage(ok ? 'Personnalisation enregistrée. Relisez et autorisez les récits modifiés.' : 'Enregistrement non confirmé. Vérifiez la sauvegarde et rouvrez l’espace parent.'));
    }} />
    {!!message && <Text accessibilityRole="alert" style={styles.muted}>{message}</Text>}
  </Card>;
}
