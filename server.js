const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const databaseDir = path.join(rootDir, "data");
const databaseFile = path.join(databaseDir, "site.db");

fs.mkdirSync(databaseDir, { recursive: true });

const db = new sqlite3.Database(databaseFile);

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (req.path.startsWith("/data/") || req.path.endsWith(".db")) {
    return res.status(404).end();
  }

  next();
});
app.use(express.static(rootDir));

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatarUsuario(usuario) {
  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    createdAt: usuario.createdAt,
    lastAccessAt: usuario.lastAccessAt
  };
}

function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function conferirSenha(senha, senhaArmazenada) {
  const [salt, hashArmazenado] = String(senhaArmazenada).split(":");

  if (!salt || !hashArmazenado) {
    return false;
  }

  const hashAtual = crypto.scryptSync(senha, salt, 64);
  const hashAnterior = Buffer.from(hashArmazenado, "hex");

  return hashAtual.length === hashAnterior.length &&
    crypto.timingSafeEqual(hashAtual, hashAnterior);
}

function inicializarBanco() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        lastAccessAt TEXT
      )
    `);
  });
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/admin/users", (req, res) => {
  db.all(
    `SELECT id, name, email, createdAt, lastAccessAt FROM users ORDER BY lastAccessAt DESC, createdAt DESC LIMIT 20`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar usuários." });
      }

      res.json(rows.map(formatarUsuario));
    }
  );
});

app.post("/api/users/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  const nome = String(name).trim();
  const emailFormatado = String(email).trim().toLowerCase();
  const senha = String(password).trim();

  if (!nome || !emailFormatado || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos corretamente." });
  }

  if (!validarEmail(emailFormatado)) {
    return res.status(400).json({ error: "Digite um e-mail válido." });
  }

  if (senha.length < 4) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 4 caracteres." });
  }

  db.get("SELECT id FROM users WHERE email = ?", [emailFormatado], (err, usuarioExistente) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao consultar usuário." });
    }

    if (usuarioExistente) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    db.run(
      `INSERT INTO users (name, email, password, createdAt, lastAccessAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [nome, emailFormatado, gerarHashSenha(senha)],
      function (insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: "Erro ao salvar usuário." });
        }

        return res.status(201).json({
          id: this.lastID,
          name: nome,
          email: emailFormatado,
          lastAccessAt: new Date().toISOString()
        });
      }
    );
  });
});

app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const emailFormatado = String(email).trim().toLowerCase();
  const senha = String(password).trim();

  if (!validarEmail(emailFormatado)) {
    return res.status(400).json({ error: "Digite um e-mail válido." });
  }

  db.get(
    `SELECT id, name, email, password FROM users WHERE email = ?`,
    [emailFormatado],
    (err, usuario) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao autenticar usuário." });
      }

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      if (!conferirSenha(senha, usuario.password)) {
        return res.status(401).json({ error: "Senha incorreta." });
      }

      db.run(
        `UPDATE users SET lastAccessAt = datetime('now') WHERE id = ?`,
        [usuario.id],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: "Erro ao registrar acesso." });
          }

          return res.json({
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            lastAccessAt: new Date().toISOString()
          });
        }
      );
    }
  );
});

app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

inicializarBanco();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
