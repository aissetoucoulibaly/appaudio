import { useEffect, useRef, useState } from 'react';
import { AppState, Text } from 'react-native';
import { setAudioModeAsync, setIsAudioActiveAsync, useAudioPlayer } from 'expo-audio';
import { Button, styles } from './ui';

/** Isolates the music from speech so device audio problems can be diagnosed. */
export function MusicPreview({ volume }: { volume: number }) {
  const player = useAudioPlayer(require('../../assets/tilleuls-ambience.wav'));
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const run = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Expo Audio native player properties are mutable, unlike React state.
    // eslint-disable-next-line react-hooks/immutability
    player.volume = volume;
  }, [player, volume]);

  function stop() {
    run.current += 1;
    if (timer.current) clearTimeout(timer.current);
    player.pause(); setActive(false);
  }
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        run.current += 1;
        if (timer.current) clearTimeout(timer.current);
        player.pause(); setActive(false);
      }
    });
    return () => {
      run.current += 1;
      if (timer.current) clearTimeout(timer.current);
      sub.remove(); // useAudioPlayer releases/stops the player on unmount.
    };
  }, [player]);

  async function preview() {
    const token = ++run.current;
    setError('');
    try {
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false });
      await setIsAudioActiveAsync(true);
      await player.seekTo(0);
      if (token !== run.current) return;
      player.play(); setActive(true);
      timer.current = setTimeout(() => {
        if (token !== run.current) return;
        player.pause(); setActive(false);
      }, 6000);
    } catch {
      if (token === run.current) { setError('La musique ne peut pas démarrer. Vérifiez le volume et la sortie audio du téléphone.'); setActive(false); }
    }
  }
  return <>
    <Button secondary title={active ? 'Arrêter le test musical' : 'Écouter la musique seule (6 secondes)'} onPress={() => { if (active) stop(); else void preview(); }} />
    {!!error && <Text accessibilityRole="alert" style={styles.muted}>{error}</Text>}
  </>;
}
