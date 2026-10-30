import { expect, test, type Page } from '@playwright/test';

async function unlock(page: Page) {
  const prompt = await page.getByText(/Pour ouvrir cet espace, calculez/).innerText();
  const match = prompt.match(/(\d+)\s*\+\s*(\d+)/);
  if (!match) throw new Error('Missing parental challenge');
  await page.getByRole('textbox', { name: 'Réponse au calcul parental' }).fill(String(Number(match[1]) + Number(match[2])));
  await page.getByRole('button', { name: 'Ouvrir l’espace parent' }).click();
}

test('review required before speech; approval persists after reload', async ({ page }) => {
  await page.addInitScript(() => {
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
  await page.getByRole('button', { name: 'Mettre en pause' }).click();
  await expect(page.getByRole('button', { name: 'Écouter l’histoire' })).toBeVisible();
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
  await page.getByRole('button', { name: 'Effacer favoris et autorisations' }).click();
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
