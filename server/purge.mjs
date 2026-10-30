import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(process.env.AI_DB_PATH || 'server/family.sqlite');
try {
  db.exec('BEGIN IMMEDIATE');
  if (db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE state = 'pending'").get().n) throw new Error('Création en attente : réconcilier avec le fournisseur avant purge.');
  db.exec("UPDATE jobs SET result = NULL, state = 'deleted' WHERE result IS NOT NULL");
  db.exec('COMMIT');
  db.exec('VACUUM');
  console.log('Contenus du registre effacés. Dépenses et identifiants conservés. Les copies et sauvegardes externes ne sont pas effacées.');
} finally { db.close(); }
