import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { approvalVersion, estimatedMinutes, type Universe } from '../content/stories';
import { useLibrary } from '../state/Library';
import { Button, Card, Page, styles, colors } from '../components/ui';
import { StoryCover } from '../components/StoryCover';

export default function Home() {
  const [filter, setFilter] = useState<Universe | 'all' | 'favorites'>('all');
  const library = useLibrary();
  const visible = library.allStories.filter(s => filter === 'all' || (filter === 'favorites' ? library.favorites.includes(s.id) : s.universe === filter));
  return <Page>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 15, color: colors.ink, fontWeight: '600' }}>les petites aventures</Text>
      <Text style={styles.muted}>Édition du soir · 0.3</Text>
    </View>
    <View style={{ paddingVertical: 12, gap: 14 }}>
      <Text style={styles.eyebrow}>{library.settings.hero ? `POUR ${library.settings.hero.toLocaleUpperCase('fr')}` : 'UN MOMENT À VOUS'}</Text>
      <Text style={styles.title}>Ce soir,{ '\n' }on part où ?</Text>
      <Text style={styles.text}>Une envie, quelques personnages.{ '\n' }Et une aventure à écouter ensemble.</Text>
    </View>
    <View style={{ padding: 24, borderRadius: 22, backgroundColor: '#E8EAF3', gap: 16 }}>
      <Text style={styles.heading}>Son idée devient une aventure</Text>
      <Text style={styles.muted}>Des pompiers, un mystère, ses amis. Préparez l’aventure dont il a envie.</Text>
      <Button title="Imaginer l’histoire de ce soir" onPress={() => router.push('/create')} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={styles.heading}>La bibliothèque</Text>
      <Text style={styles.muted}>{library.allStories.length} histoires</Text>
    </View>
    <View style={styles.row}>{([['all','Tout'],['fire','🚒 Pompiers'],['police','🚓 Police'],['favorites','♡ Favoris']] as const).map(([id,label]) =>
      <Button key={id} title={label} secondary={filter !== id} onPress={() => setFilter(id)} />)}</View>
    {!library.loaded && <Text style={styles.muted}>Ouverture de votre bibliothèque…</Text>}
    {library.storageError && <Text accessibilityRole="alert" style={styles.muted}>La sauvegarde locale est indisponible. Vos choix peuvent être perdus à la fermeture.</Text>}
    {library.loaded && visible.map(story => <Card key={story.id}>
      <StoryCover universe={story.universe} />
      <Text style={styles.eyebrow}>{story.universe === 'fire' ? 'À LA CASERNE' : 'AU VILLAGE'} · ENV. {estimatedMinutes(story)} MIN</Text>
      <Text style={styles.heading}>{story.title}</Text><Text style={styles.muted}>{story.subtitle}</Text>
      <Button title={library.approvals[story.id] === approvalVersion ? 'Ouvrir et écouter' : 'Lire ensemble avant l’écoute'} onPress={() => router.push({ pathname: '/story/[id]', params: { id: story.id } })} />
      <Button secondary title={library.favorites.includes(story.id) ? '♥ Retirer des favoris' : '♡ Garder dans les favoris'} onPress={() => library.toggleFavorite(story.id)} />
    </Card>)}
    {library.loaded && visible.length === 0 && <Text style={styles.muted}>Vos histoires favorites apparaîtront ici.</Text>}
    <Button secondary title="Espace parent" onPress={() => router.push('/parent')} />
    <Text style={styles.muted}>Deux récits sont prêts à découvrir. La création de nouvelles histoires nécessite la connexion au service familial dans l’espace parent. Lecture par la voix du téléphone.</Text>
  </Page>;
}
