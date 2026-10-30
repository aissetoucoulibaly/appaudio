import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { approvalVersion, estimatedMinutes, stories, type Universe } from '../content/stories';
import { useLibrary } from '../state/Library';
import { Button, Card, Page, styles } from '../components/ui';

export default function Home() {
  const [filter, setFilter] = useState<Universe | 'all' | 'favorites'>('all');
  const library = useLibrary();
  const visible = stories.filter(s => filter === 'all' || (filter === 'favorites' ? library.favorites.includes(s.id) : s.universe === filter));
  return <Page>
    <View style={styles.row}><Text style={styles.eyebrow}>LES PETITES AVENTURES</Text><Text style={styles.muted}>Alpha familiale · 4 ans</Text></View>
    <Text style={styles.title}>De grands héros.{ '\n' }De douces histoires.</Text>
    <Text style={styles.text}>Bienvenue aux Tilleuls. Retrouvons Éclair le camion, Nougat le chat et les amis du village.</Text>
    <Card><Text style={styles.heading}>Un moment à partager</Text><Text style={styles.muted}>Choisissez une histoire. Un parent lit d’abord le texte et autorise ensuite la lecture vocale.</Text><Button secondary title="Espace parent" onPress={() => router.push('/parent')} /></Card>
    <Text style={styles.heading}>La bibliothèque</Text>
    <View style={styles.row}>{([['all','Tout'],['fire','🚒 Pompiers'],['police','🚓 Police'],['favorites','♡ Favoris']] as const).map(([id,label]) =>
      <Button key={id} title={label} secondary={filter !== id} onPress={() => setFilter(id)} />)}</View>
    {!library.loaded && <Text style={styles.muted}>Ouverture de votre bibliothèque…</Text>}
    {library.storageError && <Text accessibilityRole="alert" style={styles.muted}>La sauvegarde locale est indisponible. Vos choix peuvent être perdus à la fermeture.</Text>}
    {library.loaded && visible.map(story => <Card key={story.id}>
      <Text style={{ fontSize: 42 }} accessibilityElementsHidden>{story.icon}</Text>
      <Text style={styles.eyebrow}>{story.universe === 'fire' ? 'À LA CASERNE' : 'AU VILLAGE'} · ENV. {estimatedMinutes(story)} MIN</Text>
      <Text style={styles.heading}>{story.title}</Text><Text style={styles.muted}>{story.subtitle}</Text>
      <Button title={library.approvals[story.id] === approvalVersion ? 'Ouvrir et écouter' : 'Lire ensemble avant l’écoute'} onPress={() => router.push({ pathname: '/story/[id]', params: { id: story.id } })} />
      <Button secondary title={library.favorites.includes(story.id) ? '♥ Retirer des favoris' : '♡ Garder dans les favoris'} onPress={() => library.toggleFavorite(story.id)} />
    </Card>)}
    {library.loaded && visible.length === 0 && <Text style={styles.muted}>Vos histoires favorites apparaîtront ici.</Text>}
    <Text style={styles.muted}>Deux histoires intégrées, sans génération IA ni compte. La durée est une estimation. Lecture par la voix du téléphone : gardez l’app ouverte pour ce premier essai.</Text>
  </Page>;
}
