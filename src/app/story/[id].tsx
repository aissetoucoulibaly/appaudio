import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { AppState, Text } from 'react-native';
import { approvalVersion, stories } from '../../content/stories';
import { ParentGate } from '../../components/ParentGate';
import { Button, Card, Page, styles } from '../../components/ui';
import { useLibrary } from '../../state/Library';

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = stories.find(s => s.id === id);
  const library = useLibrary();
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const approved = !!story && library.approvals[story.id] === approvalVersion;

  function stop() { generation.current += 1; void Speech.stop(); setPlaying(false); }
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') { generation.current += 1; void Speech.stop(); setPlaying(false); }
    });
    return () => { generation.current += 1; void Speech.stop(); sub.remove(); };
  }, []);
  useEffect(() => {
    if (!approved) {
      generation.current += 1;
      void Speech.stop().then(() => setPlaying(false));
    }
  }, [approved]);

  async function play(from: number) {
    if (!story || !approved) return;
    const run = ++generation.current;
    await Speech.stop();
    if (run !== generation.current) return;
    setError(''); setPlaying(true);
    function next(index: number) {
      if (run !== generation.current || !story) return;
      if (index >= story.paragraphs.length) { setPlaying(false); setPosition(0); return; }
      setPosition(index);
      Speech.speak(story.paragraphs[index], {
        language: 'fr-FR', rate: 0.85,
        onDone: () => next(index + 1),
        onError: () => { if (run === generation.current) { setError('La voix est indisponible. Vérifiez le volume et les réglages de synthèse vocale.'); setPlaying(false); } },
      });
    }
    next(from);
  }

  if (!story) return <Page><Text style={styles.title}>Histoire introuvable</Text><Button title="Bibliothèque" onPress={() => router.replace('/')} /></Page>;
  return <Page>
    <Button secondary title="← Bibliothèque" onPress={() => { stop(); router.back(); }} />
    <Text style={{ fontSize: 48 }} accessibilityElementsHidden>{story.icon}</Text>
    <Text style={styles.title}>{story.title}</Text><Text style={styles.text}>{story.subtitle}</Text>
    {approved ? <Card>
      <Text style={styles.eyebrow}>LECTURE VOCALE · PASSAGE {position + 1}/{story.paragraphs.length}</Text>
      <Text style={styles.text}>{story.paragraphs[position]}</Text>
      <Button title={playing ? 'Mettre en pause' : 'Écouter l’histoire'} onPress={() => { if (playing) stop(); else void play(position); }} />
      <Button secondary title="Revenir au début" onPress={() => { stop(); setPosition(0); }} />
      <Text style={styles.muted}>La reprise recommence au début du passage. Gardez cette page ouverte ; quitter l’app arrête la voix. Sur iPhone, vérifiez le mode silencieux.</Text>
      {!!error && <Text accessibilityRole="alert" style={styles.muted}>{error}</Text>}
    </Card> : <Card><Text style={styles.heading}>D’abord, une lecture par le parent</Text><Text style={styles.text}>Lisez le texte ci-dessous. L’autorisation d’écoute se trouve après la dernière phrase.</Text></Card>}
    <Text style={styles.heading}>Le récit complet</Text>
    {story.paragraphs.map((paragraph, i) => <Text key={i} style={styles.paragraph}>{paragraph}</Text>)}
    {!approved && library.loaded && <ParentGate>
      <Button title="J’ai lu ce récit et j’autorise son écoute" onPress={() => { void library.approve(story.id).then(ok => { if (!ok) setError('Autorisation non enregistrée. Rouvrez l’espace parent et réessayez.'); }); }} />
    </ParentGate>}
    {!approved && !!error && <Text accessibilityRole="alert" style={styles.muted}>{error}</Text>}
  </Page>;
}
