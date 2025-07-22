const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Загружаем хеши
const DB_FILE = 'hashes.txt';
let hashes = {};

function loadHashes() {
  if (fs.existsSync(DB_FILE)) {
    const lines = fs.readFileSync(DB_FILE, 'utf-8').split('\n');
    for (let line of lines) {
      const [hash, value, type] = line.trim().split(':');
      if (hash) hashes[hash] = { value, type };
    }
  }
}
loadHashes();

function saveHash(hash, value, type) {
  hashes[hash] = { value, type };
  fs.appendFileSync(DB_FILE, `${hash}:${value}:${type}\n`);
}

// ➕ Добавить хеш
app.post('/add', (req, res) => {
  const { hash, value, type } = req.body;
  if (!hash || !value || !type) return res.status(400).send('Bad request');
  if (!hashes[hash]) saveHash(hash, value, type);
  res.json({ success: true });
});

// 🔍 Найти хеш
app.post('/find', (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).send('Missing hash');
  if (hashes[hash]) {
    res.json({ found: true, ...hashes[hash] });
  } else {
    res.json({ found: false });
  }
});

app.get('/', (req, res) => res.send('Hash server is working'));

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
