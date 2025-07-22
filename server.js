const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;
const HASH_FILE = 'hashes.txt';

app.use(cors());
app.use(express.json());

// Хранилище в памяти
let hashes = {};

// Загрузка из файла
if (fs.existsSync(HASH_FILE)) {
  const lines = fs.readFileSync(HASH_FILE, 'utf8').split('\n');
  for (const line of lines) {
    const [hash, type, text] = line.split(' | ');
    if (hash) hashes[hash] = { type, text };
  }
}

// Генерация и сохранение хеша
app.post('/generate', (req, res) => {
  const { text, type } = req.body;
  if (!text || !type) return res.status(400).json({ error: "Missing text or type" });

  let hash;
  try {
    hash = crypto.createHash(type).update(text).digest('hex');
  } catch {
    return res.status(400).json({ error: "Invalid hash type" });
  }

  if (!hashes[hash]) {
    hashes[hash] = { type, text };
    fs.appendFileSync(HASH_FILE, `${hash} | ${type} | ${text}\n`);
  }

  res.json({ hash, type });
});

// Поиск по хешу
app.get('/find', (req, res) => {
  const hash = req.query.hash;
  if (!hash) return res.status(400).json({ error: "Missing hash" });

  const record = hashes[hash];
  if (record) {
    res.json({ found: true, ...record });
  } else {
    res.json({ found: false });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
