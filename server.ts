import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";

// Khởi tạo SQLite để lưu trữ dữ liệu vĩnh viễn (không bị mất khi restart server)
const db = new Database('database.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY,
    data TEXT
  );
  CREATE TABLE IF NOT EXISTS users (
    userHash TEXT PRIMARY KEY,
    settings TEXT
  );
`);

function getAllBlocks() {
  const rows = db.prepare('SELECT data FROM blocks').all();
  return rows.map((row: any) => JSON.parse(row.data));
}

function saveBlock(block: any) {
  const stmt = db.prepare('INSERT OR REPLACE INTO blocks (id, data) VALUES (?, ?)');
  stmt.run(block.id.toString(), JSON.stringify(block));
}

function getUserSettings(userHash: string) {
  const row = db.prepare('SELECT settings FROM users WHERE userHash = ?').get(userHash);
  return row ? JSON.parse((row as any).settings) : null;
}

function saveUserSettings(userHash: string, settings: any) {
  const stmt = db.prepare('INSERT OR REPLACE INTO users (userHash, settings) VALUES (?, ?)');
  stmt.run(userHash, JSON.stringify(settings));
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Tăng giới hạn body để nhận ảnh base64
  app.use(express.json({ limit: '50mb' }));

  // Cấu hình Socket.io hỗ trợ cả polling và websocket để vượt qua proxy
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket']
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Gửi toàn bộ dữ liệu hiện có cho client mới kết nối
    socket.emit("init_data", getAllBlocks());

    // Xử lý khi người dùng đăng nhập để lấy settings
    socket.on("user_login", (userHash) => {
      const settings = getUserSettings(userHash);
      if (settings) {
        socket.emit("user_settings", settings);
      }
    });

    // Cập nhật settings (ví dụ theme)
    socket.on("update_settings", ({ userHash, settings }) => {
      saveUserSettings(userHash, settings);
    });

    // Xử lý khi có block mới
    socket.on("add_block", (block) => {
      saveBlock(block);
      io.emit("block_added", block);
    });

    // Xử lý khi cập nhật block
    socket.on("update_block", (block) => {
      saveBlock(block);
      io.emit("block_updated", block);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy API cho Gemini để bảo mật API Key và giảm tải cho Client
  app.post("/api/verify-proof", async (req, res) => {
    try {
      const { imageBase64, prompt, model = "gemini-3-flash-preview" } = req.body;
      
      if (!imageBase64 || !prompt) {
        return res.status(400).json({ error: "Thiếu dữ liệu ảnh hoặc prompt" });
      }

      let apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (apiKey === "undefined" || apiKey === "your_api_key_here") apiKey = undefined;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Server chưa cấu hình GEMINI_API_KEY hợp lệ. Vui lòng kiểm tra file .env" });
      }

      console.log("API Key found. Length:", apiKey.length, "Starts with:", apiKey.substring(0, 4));

      const ai = new GoogleGenAI({ apiKey });
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      let rawText = response.text || '{}';
      // Clean up markdown code blocks if Gemini returns them despite responseMimeType
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      
      const result = JSON.parse(rawText);
      res.json(result);
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ 
        error: "Lỗi xử lý AI trên Server", 
        details: error.message || error.toString() 
      });
    }
  });

  // Vite middleware cho môi trường dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
