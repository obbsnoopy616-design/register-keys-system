import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURAÇÃO
// ============================================
// Credenciais obrigatórias via variáveis de ambiente
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Validar variáveis de ambiente
if (!JWT_SECRET) {
    console.error("ERRO: JWT_SECRET não configurado");
    process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ERRO: ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios");
    process.exit(1);
}

// ============================================
// BANCO DE DADOS EM ARQUIVO JSON
// ============================================
const DB_PATH = join(__dirname, "keys-db.json");
const USERS_PATH = join(__dirname, "users-db.json");

function readDB() {
    if (!existsSync(DB_PATH)) {
        writeFileSync(DB_PATH, JSON.stringify([]));
        return [];
    }
    const data = readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
}

function writeDB(data) {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function readUsers() {
    if (!existsSync(USERS_PATH)) {
        writeFileSync(USERS_PATH, JSON.stringify({}));
        return {};
    }
    const data = readFileSync(USERS_PATH, "utf-8");
    return JSON.parse(data);
}

function writeUsers(data) {
    writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
}

// ============================================
// INICIALIZAR USUÁRIO ADMIN
// ============================================
(async () => {
    const users = readUsers();
    if (!users[ADMIN_EMAIL]) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        users[ADMIN_EMAIL] = {
            email: ADMIN_EMAIL,
            password: hashedPassword,
            createdAt: Date.now()
        };
        writeUsers(users);
        console.log(`Admin user created: ${ADMIN_EMAIL}`);
    } else {
        console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    }
})();

// ============================================
// MIDDLEWARE: Verificar Token JWT
// ============================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token de acesso não fornecido" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido ou expirado" });
    }
}

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

// Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
        }

        const users = readUsers();
        const user = users[email];

        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // Gerar token JWT (válido por 7 dias)
        const token = jwt.sign(
            { email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            token,
            email: user.email
        });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Verificar se o token é válido
app.get("/api/me", authenticateToken, (req, res) => {
    res.json({ email: req.user.email });
});

// ============================================
// ROTAS DE REGISTER KEYS
// ============================================

// Listar todas as keys
app.get("/api/keys", authenticateToken, (req, res) => {
    try {
        const keys = readDB();
        res.json(keys);
    } catch (err) {
        console.error("Erro ao listar keys:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Estatísticas
app.get("/api/keys/stats", authenticateToken, (req, res) => {
    try {
        const keys = readDB();
        const total = keys.length;
        const available = keys.filter(k => k.status === "available").length;
        const used = keys.filter(k => k.status === "used").length;

        res.json({ total, available, used });
    } catch (err) {
        console.error("Erro ao obter estatísticas:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Adicionar key individual
app.post("/api/keys", authenticateToken, (req, res) => {
    try {
        const { key } = req.body;

        if (!key || typeof key !== "string" || key.trim().length === 0) {
            return res.status(400).json({ error: "Key é obrigatória" });
        }

        const keys = readDB();
        const trimmedKey = key.trim();

        // Verificar duplicata
        const exists = keys.find(k => k.key === trimmedKey);
        if (exists) {
            return res.status(409).json({ error: "Esta key já existe no sistema" });
        }

        const newKey = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            key: trimmedKey,
            status: "available",
            createdAt: Date.now(),
            usedAt: null
        };

        keys.push(newKey);
        writeDB(keys);

        res.status(201).json({ success: true, key: newKey });
    } catch (err) {
        console.error("Erro ao adicionar key:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Adicionar keys em lote
app.post("/api/keys/bulk", authenticateToken, (req, res) => {
    try {
        const { keys: keysArray } = req.body;

        if (!Array.isArray(keysArray) || keysArray.length === 0) {
            return res.status(400).json({ error: "Envie um array de keys" });
        }

        const allKeys = readDB();
        const existingKeys = allKeys.map(k => k.key);
        const added = [];

        for (const keyValue of keysArray) {
            if (typeof keyValue !== "string" || keyValue.trim().length === 0) continue;
            if (existingKeys.includes(keyValue.trim())) continue;

            const newKey = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                key: keyValue.trim(),
                status: "available",
                createdAt: Date.now(),
                usedAt: null
            };

            allKeys.push(newKey);
            existingKeys.push(keyValue.trim());
            added.push(newKey);
        }

        writeDB(allKeys);
        res.status(201).json({ success: true, added: added.length });
    } catch (err) {
        console.error("Erro ao adicionar keys em lote:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Excluir key
app.delete("/api/keys/:id", authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const keys = readDB();
        const index = keys.findIndex(k => k.id === id);

        if (index === -1) {
            return res.status(404).json({ error: "Key não encontrada" });
        }

        const removed = keys.splice(index, 1)[0];
        writeDB(keys);

        res.json({ success: true, removed });
    } catch (err) {
        console.error("Erro ao excluir key:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ============================================
// ROTA PÚBLICA: Gerar Key (sem autenticação)
// ============================================
app.post("/api/generate", (req, res) => {
    try {
        const keys = readDB();
        const availableKeyIndex = keys.findIndex(k => k.status === "available");

        if (availableKeyIndex === -1) {
            return res.status(404).json({ error: "Nenhuma key disponível" });
        }

        // Marcar como usada
        keys[availableKeyIndex].status = "used";
        keys[availableKeyIndex].usedAt = Date.now();
        writeDB(keys);

        res.json({
            success: true,
            key: keys[availableKeyIndex].key
        });
    } catch (err) {
        console.error("Erro ao gerar key:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Rota pública: verificar se há keys disponíveis
app.get("/api/generate/check", (req, res) => {
    try {
        const keys = readDB();
        const available = keys.filter(k => k.status === "available").length;
        res.json({ available });
    } catch (err) {
        console.error("Erro ao verificar:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ============================================
// SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
    console.log(`Endpoint: http://localhost:${PORT}`);
    console.log(`Admin email: ${ADMIN_EMAIL}`);
    console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
