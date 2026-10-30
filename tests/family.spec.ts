import { expect, test, type Page } from '@playwright/test';

test('modern home fits an iPhone viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Imaginer l’histoire de ce soir' })).toBeVisible();
  await expect(page.getByText('Édition du soir · 0.3')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/appaudio-home-03.png' });
});

async function unlock(page: Page) {
  const prompt = await page.getByText(/Pour ouvrir cet espace, calculez/).innerText();
  const match = prompt.match(/(\d+)\s*\+\s*(\d+)/);
  if (!match) throw new Error('Missing parental challenge');
  await page.getByRole('textbox', { name: 'Réponse au calcul parental' }).fill(String(Number(match[1]) + Number(match[2])));
  await page.getByRole('button', { name: 'Ouvrir l’espace parent' }).click();
}

test('review required before speech; approval persists after reload', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      document.documentElement.dataset.music = 'playing';
      document.documentElement.dataset.musicVolume = String(this.volume);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      document.documentElement.dataset.music = 'paused';
    };
    Object.defineProperty(window.speechSynthesis, 'speak', { value: (utterance: SpeechSynthesisUtterance) => {
      document.documentElement.dataset.spoken = utterance.text;
    } });
    Object.defineProperty(window.speechSynthesis, 'cancel', { value: () => {} });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Lire ensemble avant l’écoute' }).first().click();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toHaveCount(0);
  await expect(page.getByText('Le récit complet', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Réponse au calcul parental' }).fill('0');
  await page.getByRole('button', { name: 'Ouvrir l’espace parent' }).click();
  await expect(page.getByText('Essayez ce nouveau calcul.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'J’ai lu ce récit et j’autorise son écoute' })).toHaveCount(0);
  await unlock(page);
  await page.getByRole('button', { name: 'J’ai lu ce récit et j’autorise son écoute' }).click();
  await page.getByRole('button', { name: 'Écouter l’histoire' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-spoken', /Au village des Tilleuls/);
  await expect(page.locator('html')).toHaveAttribute('data-music', 'playing');
  await expect(page.locator('html')).toHaveAttribute('data-music-volume', '0.12');
  await page.getByRole('button', { name: 'Mettre en pause' }).click();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-music', 'paused');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toBeVisible();
});

test('favorites persist, and parent reset removes both favorites and approvals', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Lire ensemble avant l’écoute' }).first().click();
  await unlock(page);
  await page.getByRole('button', { name: 'J’ai lu ce récit et j’autorise son écoute' }).click();
  await page.getByRole('button', { name: 'Bibliothèque' }).click();
  await page.getByRole('button', { name: 'Garder dans les favoris' }).first().click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Espace parent', exact: true }).click();
  await unlock(page);
  await page.getByRole('button', { name: 'Effacer les données locales' }).click();
  await page.getByRole('button', { name: 'Effacer', exact: true }).click();
  await expect(page.getByText('Les choix locaux ont été effacés.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bibliothèque' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:8081/');
  await expect(page.getByText('La bibliothèque', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lire ensemble avant l’écoute' })).toHaveCount(2);
});

test('universe filters do not expose the wrong story', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '🚒 Pompiers' }).click();
  await expect(page.getByText('Éclair et la petite lumière', { exact: true })).toBeVisible();
  await expect(page.getByText('Le mystère du doudou bleu', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '🚓 Police' }).click();
  await expect(page.getByText('Le mystère du doudou bleu', { exact: true })).toBeVisible();
  await expect(page.getByText('Éclair et la petite lumière', { exact: true })).toHaveCount(0);
});

test('parent configures names; choosing a friend revokes approval and persists the cast', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Espace parent', exact: true }).click();
  await unlock(page);
  await page.getByRole('textbox', { name: 'Prénom du héros' }).fill('Hugo');
  await page.getByRole('textbox', { name: 'Prénoms des amis' }).fill('Zoé, Adam');
  await page.getByRole('button', { name: 'Enregistrer la personnalisation' }).click();
  await expect(page.getByText('Personnalisation enregistrée. Relisez et autorisez les récits modifiés.')).toBeVisible();
  await page.getByRole('button', { name: 'Bibliothèque' }).click();
  await page.getByRole('button', { name: 'Lire ensemble avant l’écoute' }).first().click();
  await expect(page.getByText('Avec Hugo', { exact: true })).toBeVisible();
  await expect(page.getByText(/Hugo, un enfant du village/)).toBeVisible();
  await page.getByRole('button', { name: 'J’ai lu ce récit et j’autorise son écoute' }).click();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toBeVisible();
  await page.getByRole('button', { name: 'Zoé', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toHaveCount(0);
  await expect(page.getByText(/Aujourd’hui, Hugo retrouve Zoé/)).toBeVisible();
  await expect(page.getByText(/Hugo et Zoé se retrouvent avec leurs parents/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Aujourd’hui, Hugo retrouve Zoé/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sans les amis', exact: true }).click();
  await expect(page.getByText(/Aujourd’hui, Hugo retrouve Zoé/)).toHaveCount(0);
});

test('music preview decodes the bundled track and advances without speech', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      this.addEventListener('timeupdate', () => { document.documentElement.dataset.previewTime = String(this.currentTime); });
      return original.call(this);
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Espace parent', exact: true }).click();
  await unlock(page);
  await page.getByRole('button', { name: 'Écouter la musique seule (6 secondes)' }).click();
  await expect(page.getByRole('button', { name: 'Arrêter le test musical' })).toBeVisible();
  await expect.poll(() => page.locator('html').getAttribute('data-preview-time').then(t => Number(t || 0))).toBeGreaterThan(0.2);
  await page.getByRole('button', { name: 'Arrêter le test musical' }).click();
  await expect(page.getByRole('button', { name: 'Écouter la musique seule (6 secondes)' })).toBeVisible();
});

test('evening composer saves a guided idea without pretending to generate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Imaginer l’histoire de ce soir' }).click();
  await unlock(page);
  await page.getByRole('button', { name: 'La police', exact: true }).click();
  await page.getByRole('button', { name: 'Retrouver un voleur', exact: true }).click();
  await page.getByRole('textbox', { name: 'Son idée pour l’histoire' }).fill('Un malfrat a caché le camion rouge.');
  await page.getByRole('button', { name: 'Garder cette idée pour ce soir' }).click();
  await expect(page.getByText('Votre idée est sauvegardée sur cet appareil.')).toBeVisible();
  await expect(page.getByText('La création attend sa connexion')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Créer puis relire l’histoire' })).toHaveCount(0);
  await page.reload();
  await unlock(page);
  await expect(page.getByRole('textbox', { name: 'Son idée pour l’histoire' })).toHaveValue('Un malfrat a caché le camion rouge.');
});

test('configured generation requires permission and quote, then parental review', async ({ page }) => {
  await page.route('http://127.0.0.1:4180/health', route => route.fulfill({ json: { ready: true, provider: 'anthropic', budgetEuro: 5 } }));
  await page.route('http://127.0.0.1:4180/estimate', route => route.fulfill({ json: { maximumEuro: 0.05, remainingEuro: 5, budgetEuro: 5 } }));
  await page.route('http://127.0.0.1:4180/stories', route => route.fulfill({ json: { story: {
    id: 'created-browser-test', title: 'Le mystère des biscuits', subtitle: 'Votre aventure du soir.', universe: 'fire', icon: '🚒', fixedCast: true,
    paragraphs: ['Hugo vient au village avec son papa.', 'Les adultes retrouvent le panier.', 'La soirée se termine au calme.'],
  } } }));
  await page.goto('/parent');
  await unlock(page);
  await page.getByRole('textbox', { name: 'Prénom du héros' }).fill('Hugo');
  await page.getByRole('button', { name: 'Enregistrer la personnalisation' }).click();
  await page.getByRole('textbox', { name: 'Adresse du service familial' }).fill('http://127.0.0.1:4180');
  await page.getByRole('textbox', { name: 'Jeton du service familial' }).fill('browser-test-token-not-real-1234567890');
  await page.getByRole('button', { name: 'Connecter le service', exact: true }).click();
  await expect(page.getByText(/Anthropic connecté pour cette session/)).toBeVisible();
  await page.getByRole('button', { name: 'Imaginer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Créer puis relire l’histoire' })).toBeDisabled();
  await page.getByRole('button', { name: 'Autoriser l’envoi des prénoms et des idées' }).click();
  await page.getByRole('button', { name: 'Vérifier le coût maximal' }).click();
  await expect(page.getByText(/Au maximum 0.050/)).toBeVisible();
  await page.getByRole('button', { name: 'Créer puis relire l’histoire' }).click();
  await expect(page.getByText('Le mystère des biscuits', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toHaveCount(0);
  await page.getByRole('button', { name: 'J’ai lu ce récit et j’autorise son écoute' }).click();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Le mystère des biscuits', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toBeVisible();
});
