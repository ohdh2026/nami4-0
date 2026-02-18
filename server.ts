
import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import { INITIAL_USERS, INITIAL_SHIPS, INITIAL_LOGS } from './constants.js';
import { User, Ship, OperationLog, TelegramConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const FILES = {
  USERS: path.join(DATA_DIR, 'users.json'),
  SHIPS: path.join(DATA_DIR, 'ships.json'),
  LOGS: path.join(DATA_DIR, 'logs.json'),
  TELEGRAM: path.join(DATA_DIR, 'telegram.json'),
};

// 데이터 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// 초기 데이터 파일 생성
const initFile = (filePath: string, initialData: any) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
  }
};

initFile(FILES.USERS, INITIAL_USERS);
initFile(FILES.SHIPS, INITIAL_SHIPS);
initFile(FILES.LOGS, INITIAL_LOGS);
initFile(FILES.TELEGRAM, { botToken: '', recipients: [] });

const app = express();
app.use(cors());
app.use(express.json());

const readJson = (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeJson = (filePath: string, data: any) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// API Routes
app.get('/api/health', (req: Request, res: Response) => res.json({ status: 'ok' }));

app.get('/api/users', (req: Request, res: Response) => res.json(readJson(FILES.USERS)));
app.post('/api/users', (req: Request, res: Response) => {
  writeJson(FILES.USERS, req.body);
  res.json({ success: true });
});

app.get('/api/ships', (req: Request, res: Response) => res.json(readJson(FILES.SHIPS)));
app.post('/api/ships', (req: Request, res: Response) => {
  writeJson(FILES.SHIPS, req.body);
  res.json({ success: true });
});

app.get('/api/logs', (req: Request, res: Response) => res.json(readJson(FILES.LOGS)));
app.post('/api/logs', (req: Request, res: Response) => {
  writeJson(FILES.LOGS, req.body);
  res.json({ success: true });
});

app.get('/api/telegram', (req: Request, res: Response) => res.json(readJson(FILES.TELEGRAM)));
app.post('/api/telegram', (req: Request, res: Response) => {
  writeJson(FILES.TELEGRAM, req.body);
  res.json({ success: true });
});

// Login API
app.post('/api/login', (req: Request, res: Response) => {
  const { userId, password } = req.body;
  const users: User[] = readJson(FILES.USERS);
  const user = users.find(u => u.id === userId);

  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
  }
});

// Weather API (Proxy to Gemini)
app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key not set");

    const ai = new GoogleGenAI({ apiKey: apiKey as string });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "현재 경기도 가평군 남이섬의 실시간 날씨 정보를 알려줘. 반드시 temp(기온), condition(날씨상태), windSpeed(풍속 m/s), humidity(습도 %) 키를 가진 JSON 형식으로만 응답해. 예: {\"temp\": \"18°C\", \"condition\": \"맑음\", \"windSpeed\": \"3m/s\", \"humidity\": \"55%\"}",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    if (!response.text) throw new Error("No response text");
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Weather API Error:", error);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve('dist');
  const publicPath = path.resolve('public');
  
  console.log(`[DIAGNOSTIC] Current Working Directory: ${process.cwd()}`);
  console.log(`[DIAGNOSTIC] Dist Path: ${distPath}`);
  console.log(`[DIAGNOSTIC] Dist Exists: ${fs.existsSync(distPath)}`);

  if (isProd) {
    console.log("[INFO] Running in PRODUCTION mode");
    
    if (fs.existsSync(distPath)) {
      // 정적 파일 서비스
      app.use(express.static(distPath));
      
      // SPA를 위한 Catch-all 라우트
      app.get('*', (req: Request, res: Response) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error(`[ERROR] index.html not found at ${indexPath}`);
          res.status(404).send("Frontend build exists but index.html is missing. Please check your build process.");
        }
      });
    } else {
      console.error("[ERROR] 'dist' directory not found.");
      app.get('*', (req: Request, res: Response) => {
        res.status(500).send("Frontend build (dist) is missing. Did you run 'npm run build'?");
      });
    }
  } else {
    console.log("[INFO] Running in DEVELOPMENT mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SUCCESS] Server is listening on port ${PORT}`);
  });
}

startServer();
