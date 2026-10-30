import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { ParentGate } from '../components/ParentGate';
import { Button, Card, Page, styles } from '../components/ui';
import { useLibrary } from '../state/Library';

export default function Parent() {
  const library = useLibrary();
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState('');
  return <Page><Button secondary title="← Bibliothèque" onPress={() => router.back()} />
    <Text style={styles.title}>Le coin des parents</Text>
    <ParentGate><Card><Text style={styles.heading}>Votre premier essai</Text>
      <Text style={styles.text}>Des histoires pour 4 ans : entraide, petites enquêtes et fins tranquilles. Les interventions et le matériel restent réservés aux adultes.</Text>
      <Text style={styles.text}>Lisez chaque récit avant d’autoriser l’écoute. Vous connaissez mieux que nous ce qui peut inquiéter votre enfant.</Text>
      <Text style={styles.heading}>Ce que fait cette version</Text>
      <Text style={styles.muted}>Deux récits fixes et originaux. Aucune génération IA, publicité, mesure d’écoute, photo ou voix enregistrée. Favoris et autorisations sont conservés sur cet appareil.</Text>
      <Text style={styles.muted}>La narration utilise la synthèse vocale du système. La voix et son éventuel accès réseau dépendent de votre appareil et de ses réglages. Sur iPhone, désactivez le mode silencieux si aucun son ne sort.</Text>
      <Text style={styles.muted}>Arrière-plan, commandes écran verrouillé et voix de qualité ne sont pas encore validés. Aucun service de signalement distant n’est présent dans cette alpha privée.</Text>
      <Button secondary title="Effacer favoris et autorisations" onPress={() => setConfirmReset(true)} />
      {confirmReset && <Card>
        <Text style={styles.heading}>Effacer les choix locaux ?</Text>
        <Text style={styles.muted}>Les récits intégrés restent disponibles. Ils devront être autorisés de nouveau.</Text>
        <Button title="Effacer" onPress={() => { void library.reset().then(ok => { setConfirmReset(false); setMessage(ok ? 'Les choix locaux ont été effacés.' : 'L’effacement n’a pas pu être confirmé sur cet appareil.'); }); }} />
        <Button secondary title="Annuler" onPress={() => setConfirmReset(false)} />
      </Card>}
      {!!message && <Text accessibilityRole="alert" style={styles.muted}>{message}</Text>}
      <Button title="Verrouiller l’espace parent" onPress={library.lock} />
    </Card></ParentGate>
  </Page>;
}
