// server/server.js
import express from 'express';
import next from 'next';
import http from 'http';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// 初始化 Next.js 準備後再啟動伺服器
app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);

    // 1. 設定 Socket.io
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        allowEIO3: true
    });

    let rooms = {};
    const ROLES_POOL = ['Werewolf', 'Seer', 'Villager', 'Villager', 'Villager', 'Villager'];

    // 2. 遊戲邏輯 (保留你原有的功能)
    io.on("connection", (socket) => {
        console.log("連線成功:", socket.id);

        socket.on("joinRoom", ({ roomId, playerName }) => {
            socket.join(roomId);
            if (!rooms[roomId]) {
                rooms[roomId] = {
                    id: roomId,
                    status: 'LOBBY',
                    players: [],
                    mayorId: null,
                    secretWord: null
                };
            }

            const existing = rooms[roomId].players.find(p => p.id === socket.id);
            if (!existing) {
                rooms[roomId].players.push({ id: socket.id, name: playerName, role: null });
            }
            io.to(roomId).emit("roomUpdate", rooms[roomId]);
        });

        socket.on("startGame", ({ roomId }) => {
            const room = rooms[roomId];
            if (!room || room.players.length < 3) return;

            room.status = 'SETTING_WORD';
            room.mayorId = socket.id;

            io.to(roomId).emit("gameStatusUpdate", {
                status: 'SETTING_WORD',
                mayorId: room.mayorId
            });
        });

        socket.on("submitWord", ({ roomId, word }) => {
            const room = rooms[roomId];
            if (!room) return;

            room.secretWord = word;
            let deck = [...ROLES_POOL].slice(0, room.players.length).sort(() => Math.random() - 0.5);

            room.players.forEach((player, index) => {
                player.role = deck[index];
                io.to(player.id).emit("assignRole", { role: player.role });

                const canSeeWord = (player.id === room.mayorId) || (player.role === 'Werewolf') || (player.role === 'Seer');
                if (canSeeWord) {
                    io.to(player.id).emit("revealWord", { word: room.secretWord });
                }
            });

            room.status = 'GUESSING';
            io.to(roomId).emit("gameStatusUpdate", { status: 'GUESSING' });
        });

        socket.on("disconnect", () => {
            console.log("玩家離開:", socket.id);
        });
    });

    // 3. 處理 Next.js 網頁路由
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // 4. 重要：監聽 Render 指定的埠號
    const PORT = process.env.PORT || 10000;
    httpServer.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ 伺服器已在埠號 ${PORT} 啟動，支援 Next.js & Socket.io`);
    });
});