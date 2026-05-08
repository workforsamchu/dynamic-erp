// 使用 ES Module 語法取代 require
import { Server } from "socket.io";
import http from "http";

const httpServer = http.createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Required for cross-device testing
        methods: ["GET", "POST"]
    },
    allowEIO3: true
});
let rooms = {};

// 角色池定義：根據人數彈性取用
const ROLES_POOL = ['Werewolf', 'Seer', 'Villager', 'Villager', 'Villager', 'Villager'];

io.on("connection", (socket) => {
    console.log("連線成功:", socket.id);

    // 1. 加入房間邏輯
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

    // 2. 開始遊戲：隨機挑選一名村長
    socket.on("startGame", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;

        // 基本人數檢查 (維持遊戲可玩性)
        if (room.players.length < 3) return;

        room.status = 'SETTING_WORD';

        // 【修改關鍵】：將發送此事件的玩家設為村長
        room.mayorId = socket.id;

        io.to(roomId).emit("gameStatusUpdate", {
            status: 'SETTING_WORD',
            mayorId: room.mayorId
        });

        console.log(`房間 ${roomId}：玩家 ${socket.id} 主動成為村長並開始出題`);
    });

    // 3. 村長提交謎底：此時才分配角色，並同步謎底
    socket.on("submitWord", ({ roomId, word }) => {
        const room = rooms[roomId];
        if (!room) return;

        room.secretWord = word;

        // 洗牌分配身分
        let deck = [...ROLES_POOL].slice(0, room.players.length).sort(() => Math.random() - 0.5);

        room.players.forEach((player, index) => {
            player.role = deck[index];

            // A. 私密發送身分
            io.to(player.id).emit("assignRole", { role: player.role });

            // B. 資訊隔離：村長、狼人、先知可見謎底
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

const PORT = 3001;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
    console.log(`✅ 遊戲伺服器已在 http://0.0.0.0:${PORT} 啟動`);
});


console.log("🚀 伺服器已啟動並監聽埠號 3001");