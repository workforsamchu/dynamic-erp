const { Server } = require("socket.io");

const io = new Server(3001, {
    cors: {
        origin: "http://localhost:3000", // 允許 Next.js 前端連線
        methods: ["GET", "POST"]
    }
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

        // 避免重複加入
        const existing = rooms[roomId].players.find(p => p.id === socket.id);
        if (!existing) {
            rooms[roomId].players.push({ id: socket.id, name: playerName, role: null });
        }

        io.to(roomId).emit("roomUpdate", rooms[roomId]);
    });

    // 2. 開始遊戲：隨機挑選一名村長，進入出題階段
    socket.on("startGame", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room || room.players.length < 3) return;

        room.status = 'SETTING_WORD';
        // 隨機選一個村長 ID
        const mayorIndex = Math.floor(Math.random() * room.players.length);
        room.mayorId = room.players[mayorIndex].id;

        io.to(roomId).emit("gameStatusUpdate", {
            status: 'SETTING_WORD',
            mayorId: room.mayorId
        });
        console.log(`房間 ${roomId}：由 ${room.mayorId} 擔任村長並開始出題`);
    });

    // 3. 村長提交謎底：此時才分配角色，並同步謎底
    socket.on("submitWord", ({ roomId, word }) => {
        const room = rooms[roomId];
        if (!room) return;

        room.secretWord = word;

        // 洗牌分配身分 (與玩家人數相同)
        let deck = [...ROLES_POOL].slice(0, room.players.length).sort(() => Math.random() - 0.5);

        room.players.forEach((player, index) => {
            player.role = deck[index];

            // A. 發送身分給每個人 (私密)
            io.to(player.id).emit("assignRole", { role: player.role });

            // B. 判斷是否有權限看謎底：是村長 OR 是狼人 OR 是先知
            const canSeeWord = (player.id === room.mayorId) || (player.role === 'Werewolf') || (player.role === 'Seer');

            if (canSeeWord) {
                io.to(player.id).emit("revealWord", { word: room.secretWord });
            }
        });

        room.status = 'GUESSING';
        io.to(roomId).emit("gameStatusUpdate", { status: 'GUESSING' });
        console.log(`房間 ${roomId}：謎底設定完成，進入猜測階段`);
    });

    // 4. 斷連處理
    socket.on("disconnect", () => {
        console.log("玩家離開:", socket.id);
        // 這裡可視需求加入從房間移除玩家的邏輯
    });
});

console.log("✅ 謎語狼人殺伺服器運行在 http://localhost:3001");