import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useLibrary } from '../state/Library';
import { Button, Card, styles } from './ui';

export function ParentGate({ children }: { children: React.ReactNode }) {
  const library = useLibrary();
  const [challenge, setChallenge] = useState(() => ({ a: 12 + Math.floor(Math.random() * 9), b: 7 + Math.floor(Math.random() * 8) }));
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  if (library.parentUntil > 0) return <>{children}</>;
  return <Card>
    <Text style={styles.heading}>Un petit passage pour les parents</Text>
    <Text style={styles.text}>Pour ouvrir cet espace, calculez {challenge.a} + {challenge.b}.</Text>
    <TextInput accessibilityLabel="Réponse au calcul parental" placeholder="Votre réponse" value={answer} onChangeText={setAnswer}
      keyboardType="number-pad" style={{ borderWidth: 1, borderColor: '#59665F', borderRadius: 12, padding: 16, fontSize: 20, color: '#20372F' }} />
    {error && <Text accessibilityRole="alert" style={styles.muted}>Essayez ce nouveau calcul.</Text>}
    <Button title="Ouvrir l’espace parent" onPress={() => {
      if (Number(answer.trim()) === challenge.a + challenge.b) { library.unlock(); setError(false); }
      else { setError(true); setAnswer(''); setChallenge({ a: 12 + Math.floor(Math.random() * 9), b: 7 + Math.floor(Math.random() * 8) }); }
    }} />
    <View><Text style={styles.muted}>Protection simple pour un enfant de 4 ans. Ce calcul ne vérifie ni l’identité ni la majorité. L’espace se verrouille quand vous quittez l’application.</Text></View>
  </Card>;
}
