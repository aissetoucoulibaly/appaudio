import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { ParentGate } from '../components/ParentGate';
import { Button, Card, Page, styles } from '../components/ui';
import { missions, settings, type Brief } from '../content/brief';
import { useLibrary } from '../state/Library';

export default function Create() {
  const library = useLibrary();
  return <Page>
    <Text style={styles.eyebrow}>L’HISTOIRE DE CE SOIR</Text>
    <Text style={styles.title}>Son idée.{ '\n' }Votre petite aventure.</Text>
    <Text style={styles.muted}>Quelques choix suffisent. Vous relirez le récit avant l’écoute.</Text>
    {library.loaded && <ParentGate><Composer /></ParentGate>}
  </Page>;
}
function Composer() {
  const library = useLibrary();
  const [brief, setBrief] = useState<Brief>(library.brief);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [quote, setQuote] = useState<{ maximumEuro: number; remainingEuro: number } | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  function change(patch: Partial<Brief>) { setBrief(b => ({ ...b, ...patch })); setMessage(''); setQuote(null); setConsent(false); }
  async function estimate() {
    if (!library.connection || busy) return;
    setBusy(true); setQuote(null);
    const request = new AbortController(); controller.current = request;
    const timer = setTimeout(() => request.abort(), 15_000);
    try {
      const response = await fetch(`${library.connection.url}/estimate`, {
        method: 'POST', signal: request.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${library.connection.token}` },
        body: JSON.stringify({ brief, hero: library.settings.hero }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Estimation indisponible.');
      if (typeof result.maximumEuro !== 'number' || typeof result.remainingEuro !== 'number') throw new Error('Estimation illisible.');
      setQuote(result); setMessage('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Service indisponible.'); }
    finally { clearTimeout(timer); setBusy(false); }
  }
  async function generate() {
    if (!library.connection || !consent || !quote || !library.settings.hero || busy) return;
    setBusy(true); setMessage('Préparation du récit. Vous pourrez le relire avant de l’écouter.');
    const request = new AbortController(); controller.current = request;
    const timer = setTimeout(() => request.abort(), 120_000);
    try {
      const key = await library.saveBrief(brief);
      if (!key) throw new Error('Enregistrement impossible ou espace parent verrouillé. Rouvrez-le et réessayez.');
      const response = await fetch(`${library.connection.url}/stories`, {
        method: 'POST', signal: request.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${library.connection.token}`, 'Idempotency-Key': key },
        body: JSON.stringify({ brief: { ...brief, companions: brief.companions.filter(n => library.settings.friends.includes(n)) }, hero: library.settings.hero }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Création indisponible.');
      if (!(await library.addStory(result.story))) throw new Error('Le récit n’a pas pu être sauvegardé. Réessayez avec les mêmes choix pour récupérer le résultat sans relancer la création.');
      router.push({ pathname: '/story/[id]', params: { id: result.story.id } });
    } catch (error) {
      if (!request.signal.aborted) setMessage(error instanceof Error ? error.message : 'Le service ne répond pas.');
      else setMessage('La réponse tarde. Réessayez avec les mêmes choix : le service vérifiera la demande existante.');
    } finally { clearTimeout(timer); setBusy(false); }
  }
  return <>
    {!library.settings.hero && <Card><Text style={styles.text}>Commençons par son prénom et les amis qu’il pourra inviter.</Text><Button title="Renseigner les personnages" onPress={() => router.push('/parent')} /></Card>}
    <View pointerEvents={busy ? 'none' : 'auto'} style={{ gap: 20, opacity: busy ? 0.65 : 1 }}><Card><Text style={styles.heading}>1. Dans quel univers ?</Text>
      <View style={styles.row}><Button title="Les pompiers" secondary={brief.universe !== 'fire'} onPress={() => change({ universe: 'fire' })} /><Button title="La police" secondary={brief.universe !== 'police'} onPress={() => change({ universe: 'police' })} /></View>
      <Text style={styles.heading}>2. Que va-t-il se passer ?</Text>
      <View style={styles.row}>{Object.entries(missions).map(([id, label]) => <Button key={id} title={label} secondary={brief.mission !== id} onPress={() => change({ mission: id as Brief['mission'] })} />)}</View>
      {brief.mission === 'thief' && <Text style={styles.muted}>Une enquête sans violence : les adultes retrouvent le voleur, les enfants restent accompagnés. La fin sera rassurante.</Text>}
      <Text style={styles.heading}>3. Où part-on ?</Text>
      <View style={styles.row}>{Object.entries(settings).map(([id, label]) => <Button key={id} title={label} secondary={brief.setting !== id} onPress={() => change({ setting: id as Brief['setting'] })} />)}</View>
    </Card>
    <Card><Text style={styles.heading}>Avec qui ?</Text><Text style={styles.text}>{library.settings.hero || 'Son prénom reste à renseigner'}</Text>
      <View style={styles.row}><Button title="Sans les amis" secondary={brief.companions.length > 0} onPress={() => change({ companions: [] })} />
      {library.settings.friends.map(name => <Button key={name} title={name} secondary={!brief.companions.includes(name)} onPress={() => change({ companions: brief.companions.includes(name) ? brief.companions.filter(n => n !== name) : [...brief.companions, name] })} />)}</View>
      <Text style={styles.heading}>Et pour l’ambiance ?</Text>
      <View style={styles.row}><Button title="Tout doux, pour dormir" secondary={brief.mood !== 'sleep'} onPress={() => change({ mood: 'sleep' })} /><Button title="Une petite aventure" secondary={brief.mood !== 'adventure'} onPress={() => change({ mood: 'adventure' })} /></View>
    </Card>
    <Card><Text style={styles.heading}>Il a une idée en plus ?</Text>
      <Text style={styles.muted}>Facultatif. Par exemple : « Un camion rouge, un chat caché et un voleur de biscuits. » Gardez ici les idées imaginaires, sans école, adresse ni information de santé.</Text>
      <TextInput accessibilityLabel="Son idée pour l’histoire" multiline maxLength={400} editable={!busy} placeholder="Ce soir, il aimerait…" value={brief.detail} onChangeText={detail => change({ detail })} style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]} />
      <Text style={styles.muted}>{brief.detail.length}/400 · Environ 4 à 5 minutes</Text>
    </Card></View>
    <Button secondary title="Garder cette idée pour ce soir" disabled={busy} onPress={() => { void library.saveBrief(brief).then(key => setMessage(key ? 'Votre idée est sauvegardée sur cet appareil.' : 'Sauvegarde impossible. Rouvrez l’espace parent.')); }} />
    {library.connection ? <Card>
      <Text style={styles.heading}>Prêt à préparer le récit ?</Text>
      <Text style={styles.muted}>Le prénom, les amis et les idées seront transmis à votre serveur familial puis à {library.connection.provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} pour écrire et vérifier le récit. Le coût sera déduit du budget configuré sur le serveur, qui prévaut sur le réglage local. La narration utilise encore la voix du téléphone.</Text>
      <Button secondary={!consent} disabled={busy} title={consent ? '✓ J’autorise cet envoi pour cette création' : 'Autoriser l’envoi des prénoms et des idées'} onPress={() => setConsent(v => !v)} />
      <Button secondary title="Vérifier le coût maximal" disabled={busy || !library.settings.hero || !consent} onPress={() => { void estimate(); }} />
      {quote && <Text style={styles.text}>Au maximum {quote.maximumEuro.toFixed(3)} € pour le texte et sa vérification. Budget disponible : {quote.remainingEuro.toFixed(2)} €. La voix du téléphone n’ajoute pas de frais fournisseur.</Text>}
      <Button title={busy ? 'Préparation en cours…' : 'Créer puis relire l’histoire'} disabled={busy || !consent || !quote || quote.maximumEuro > quote.remainingEuro || !library.settings.hero} onPress={() => { void generate(); }} />
    </Card> : <Card>
      <Text style={styles.heading}>La création attend sa connexion</Text>
      <Text style={styles.muted}>Vous pouvez déjà préparer et sauvegarder son idée. Pour écrire une nouvelle histoire avec l’IA, il reste à configurer le service familial et son budget. Aucun appel payant n’est effectué tant qu’il n’est pas connecté.</Text>
      <Button secondary title="Configurer le service familial" onPress={() => router.push('/parent')} />
    </Card>}
    {!!message && <Text accessibilityRole="alert" style={styles.text}>{message}</Text>}
  </>;
}
