import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { useLibrary } from '../state/Library';
import { Button, Card, styles } from './ui';

export function ServiceConnection() {
  const library = useLibrary();
  const [url, setUrl] = useState(library.connection?.url || '');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function connect() {
    setBusy(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(parsed.hostname))) throw new Error('Utilisez HTTPS ou une adresse du réseau familial.');
      if (parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('Adresse invalide.');
      const response = await fetch(`${parsed.origin}/health`, { headers: { Authorization: `Bearer ${token.trim()}` }, signal: controller.signal });
      const result = await response.json();
      if (!response.ok || !['anthropic', 'openai'].includes(result.provider)) throw new Error('Connexion refusée. Vérifiez l’adresse et le jeton du service.');
      const ok = library.connect(parsed.origin, token.trim(), result.provider);
      setMessage(ok ? `${result.provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} connecté pour cette session.${result.ready ? ' Le coût sera vérifié avant création.' : ' Le fournisseur et ses tarifs restent à activer côté serveur.'}` : 'Rouvrez l’espace parent et vérifiez le jeton.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Service inaccessible.'); }
    finally { clearTimeout(timeout); setBusy(false); }
  }
  return <Card>
    <Text style={styles.heading}>Le service familial</Text>
    <Text style={styles.muted}>Connexion avancée pour créer de nouveaux récits. À configurer une fois le serveur, le fournisseur et les tarifs vérifiés. Ne saisissez jamais de clé Anthropic ou OpenAI dans l’application.</Text>
    <TextInput style={styles.input} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Adresse du service familial" placeholder="http://adresse-du-Mac:4180" value={url} onChangeText={setUrl} />
    <TextInput style={styles.input} autoCapitalize="none" autoCorrect={false} secureTextEntry accessibilityLabel="Jeton du service familial" placeholder="Jeton du service, distinct de la clé fournisseur" value={token} onChangeText={setToken} />
    <Text style={styles.muted}>La connexion reste en mémoire pour cette session. Sur le Wi-Fi familial de confiance uniquement si vous utilisez HTTP ; utilisez HTTPS pour un serveur distant.</Text>
    <Button secondary title={busy ? 'Vérification du service…' : 'Connecter le service'} disabled={busy} onPress={() => { void connect(); }} />
    {!!message && <Text accessibilityRole="alert" style={styles.muted}>{message}</Text>}
  </Card>;
}
