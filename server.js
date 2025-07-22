const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;
const HASH_FILE = 'hashes.txt';

app.use(cors());
app.use(bodyParser.json());

// Создание хеша и сохранение
app.post('/generate', (req, res) => {
    const { text, type } = req.body;
    if (!text || !type) {
        return res.status(400).json({ error: 'Нужно указать text и type' });
    }

    let hash;
    try {
        hash = crypto.createHash(type.toLowerCase()).update(text).digest('hex');
    } catch (e) {
        return res.status(400).json({ error: 'Неподдерживаемый тип хеша' });
    }

    const line = `${hash}:${text}:${type.toUpperCase()}\n`;

    fs.appendFile(HASH_FILE, line, err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Не удалось сохранить хеш' });
        }
        res.json({ success: true, hash, type: type.toUpperCase() });
    });
});

// Поиск по хешу
app.get('/find', (req, res) => {
    const { hash } = req.query;
    if (!hash) return res.status(400).json({ error: 'Нужен параметр hash' });

    fs.readFile(HASH_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Не удалось прочитать файл' });

        const lines = data.trim().split('\n');
        const found = lines.find(line => line.startsWith(hash + ':'));

        if (found) {
            const [, text, type] = found.split(':');
            res.json({ found: true, hash, text, type });
        } else {
            res.json({ found: false });
        }
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
