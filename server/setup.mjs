import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

async function secret() {
  if (!process.stdin.isTTY) throw new Error('Utiliser un Terminal interactif pour saisir la clé masquée.');
  process.stdout.write('Clé API Anthropic (masquée, jamais à partager dans le chat) : ');
  return new Promise((resolve, reject) => {
    let value = '';
    process.stdin.setRawMode(true); process.stdin.setEncoding('utf8'); process.stdin.resume();
    function finish(error) {
      process.stdin.removeListener('data', read); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n');
      if (error) reject(error); else resolve(value.trim());
    }
    function read(chunk) {
      for (const char of chunk) {
        if (char === '\u0003') { finish(new Error('Configuration annulée.')); return; }
        if (char === '\r' || char === '\n') { finish(); return; }
        if (char === '\u007f' || char === '\b') { if (value) { value = value.slice(0, -1); process.stdout.write('\b \b'); } }
        else if (char >= ' ' && char <= '~') { value += char; process.stdout.write('*'); }
        if (value.length > 1000) { finish(new Error('Clé trop longue.')); return; }
      }
    }
    process.stdin.on('data', read);
  });
}
try {
  if (existsSync('.env.server.local') || existsSync('server/.access-token')) throw new Error('Une configuration existe déjà. Aucun fichier écrasé ; consultez server/README.md.');
  console.log('Configuration locale Anthropic. Aucun appel API ni paiement pendant cette étape.');
  const key = await secret();
  if (key.length < 20 || /\s/.test(key)) throw new Error('Clé invalide. Aucun fichier créé.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let model, inputRate, outputRate, budget;
  try {
    model = (await rl.question('Identifiant exact du modèle disponible sur votre compte : ')).trim();
    console.log('Utilisez les tarifs vérifiés en euros par million de tokens, avec conversion USD/EUR prudente si nécessaire.');
    inputRate = Number((await rl.question('Tarif entrée, euros / million (point décimal) : ')).trim());
    outputRate = Number((await rl.question('Tarif sortie, euros / million (point décimal) : ')).trim());
    budget = (await rl.question('Budget mensuel : 5 ou 10 euros [5] : ')).trim() || '5';
  } finally { rl.close(); }
  if (!/^[a-zA-Z0-9._-]+$/.test(model) || !Number.isFinite(inputRate) || inputRate <= 0 || !Number.isFinite(outputRate) || outputRate <= 0 || !['5', '10'].includes(budget)) throw new Error('Modèle, tarifs ou budget invalides. Aucun fichier créé.');
  const token = randomBytes(32).toString('hex');
  await writeFile('server/.access-token', token + '\n', { mode: 0o600, flag: 'wx' });
  const content = `AI_PROVIDER=anthropic\nANTHROPIC_API_KEY=${key}\nAI_MODEL=${model}\nAI_INPUT_EUR_PER_MILLION=${inputRate}\nAI_OUTPUT_EUR_PER_MILLION=${outputRate}\nMONTHLY_BUDGET_EUR=${budget}\nSERVER_TOKEN=${token}\nSERVER_HOST=0.0.0.0\nPORT=4180\n`;
  await writeFile('.env.server.local', content, { mode: 0o600, flag: 'wx' });
  console.log('Configuration sauvegardée localement. Gardez le serveur sur votre Wi-Fi familial de confiance, sans ouverture de port Internet.');
  console.log('Lancez npm run server dans ce Terminal, puis npm start dans un second.');
  console.log('Pour lire le jeton de connexion sur votre Mac : open -a TextEdit server/.access-token. Ne partagez pas ce fichier.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
