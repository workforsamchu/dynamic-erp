'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// 將 socket 定義在組件外部，確保重繪時不會重複建立實例
let socket;

export default function GameLobby() {
    // --- 1. 基礎狀態 ---
    const [hasMounted, setHasMounted] = useState(false);
    const [joined, setJoined] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [connStatus, setConnStatus] = useState('連線中...');
    const [roomData, setRoomData] = useState({ players: [] });
    const [showRole, setShowRole] = useState(false);

    // --- 2. 遊戲邏輯狀態 ---
    const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, SETTING_WORD, GUESSING
    const [mayorId, setMayorId] = useState(null);
    const [myRole, setMyRole] = useState(null);
    const [secretWord, setSecretWord] = useState(null);
    const [inputWord, setInputWord] = useState('');

    useEffect(() => {
        setHasMounted(true);

        // 取得當前網址 Host (iPhone 會是 192.168.x.x)
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || `http://${window.location.hostname}:3001`;
        console.log("嘗試連線至:", socketUrl);
        setConnStatus(`正在連線伺服器: ${socketUrl}`);


        socket = io(socketUrl, {
            transports: ['websocket'],
            secure: socketUrl.startsWith('https')
        });

        // 監聽連線成功
        socket.on("connect", () => {
            setConnStatus("連線成功 ✅");
            // 如果已經點擊過 Join，斷線重連時自動重新加入
            if (joined && roomId && playerName) {
                socket.emit("joinRoom", { roomId, playerName });
            }
        });

        // 監聽房間資料更新
        socket.on("roomUpdate", (data) => {
            console.log("房間資料更新:", data);
            setRoomData(data);
            setConnStatus("房間同步完成 ✅");
        });

        // 監聽連線錯誤
        socket.on("connect_error", (err) => {
            console.error("連線錯誤:", err);
            setConnStatus(`連線錯誤: ${err.message} ❌`);
        });

        // 監聽遊戲狀態切換
        socket.on('gameStatusUpdate', ({ status, mayorId }) => {
            setGameStatus(status);
            if (mayorId) setMayorId(mayorId);
        });

        // 監聽角色分配
        socket.on('assignRole', ({ role }) => {
            setMyRole(role);
        });

        // 監聽謎底揭曉
        socket.on('revealWord', ({ word }) => {
            setSecretWord(word);
        });

        return () => {
            if (socket) {
                socket.off("connect");
                socket.off("roomUpdate");
                socket.off("connect_error");
                socket.off("gameStatusUpdate");
                socket.off("assignRole");
                socket.off("revealWord");
                socket.disconnect();
            }
        };
    }, [joined, roomId, playerName]);

    // --- 3. 互動行為 ---
    const handleJoin = () => {
        if (playerName.trim() && roomId.trim()) {
            if (socket && socket.connected) {
                socket.emit('joinRoom', { roomId, playerName });
                setJoined(true);
            } else {
                alert("伺服器尚未連線，請稍候");
            }
        } else {
            alert("請輸入暱稱與房間 ID");
        }
    };

    const handleStartGame = () => {
        // 開發測試建議至少 3 人，正式可改回 4 人
        if (roomData.players.length >= 3) {
            socket.emit('startGame', { roomId });
        } else {
            alert("需要至少 3 名玩家才能開始遊戲");
        }
    };

    const handleSubmitWord = () => {
        if (inputWord.trim()) {
            socket.emit('submitWord', { roomId, word: inputWord });
        } else {
            alert("請輸入謎底");
        }
    };

    if (!hasMounted) return null;

    // --- 4. 介面渲染邏輯 ---

    // 階段 A: 登入介面
    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <div className="fixed top-2 right-2 bg-slate-900 px-3 py-1 rounded-full text-[10px] text-white border border-white/10">
                    狀態: {connStatus}
                </div>
                <div className="w-full max-w-md p-10 bg-slate-900 rounded-[40px] border border-white/5 shadow-2xl space-y-6">
                    <h2 className="text-3xl font-black text-white italic text-center uppercase tracking-tighter text-orange-600">Enter The Fog</h2>
                    <div className="space-y-4">
                        <input
                            className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white text-center font-bold outline-none focus:border-orange-500"
                            placeholder="你的暱稱"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                        <input
                            className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white text-center font-bold outline-none focus:border-orange-500"
                            placeholder="房間 ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                    </div>
                    <button onClick={handleJoin} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                        JOIN GAME
                    </button>
                </div>
            </div>
        );
    }

    // 階段 B: 村長設定謎底
    if (gameStatus === 'SETTING_WORD') {
        const isMayor = socket?.id === mayorId;
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
                <div className="text-center p-10 bg-slate-900 rounded-[50px] border border-orange-500/20 max-w-lg w-full shadow-2xl">
                    <div className="mb-8">
                        <span className="text-5xl block mb-4 animate-bounce">{isMayor ? '📜' : '⌛'}</span>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">
                            {isMayor ? '你是村長，請設定謎底' : '村長正在思考謎底...'}
                        </h2>
                    </div>
                    {isMayor && (
                        <div className="space-y-4">
                            <input
                                className="w-full bg-black/50 border-2 border-slate-700 p-4 rounded-2xl text-white text-center text-xl font-bold focus:border-orange-500 outline-none"
                                placeholder="例如：珍珠奶茶"
                                value={inputWord}
                                onChange={(e) => setInputWord(e.target.value)}
                            />
                            <button onClick={handleSubmitWord} className="w-full bg-orange-600 py-4 rounded-2xl text-white font-black hover:bg-orange-500 transition-colors">
                                確認並發放身分
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 階段 C: 遊戲主畫面 (猜測階段)
    if (gameStatus === 'GUESSING') {
        return (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-10 animate-in fade-in duration-700 p-4">
                <div className="bg-orange-600/20 px-6 py-2 rounded-full border border-orange-500/30">
                    <span className="text-orange-500 font-black tracking-widest text-sm">
                        {socket && socket.id === mayorId ? '🛡️ MAYOR' : '👥 PLAYER'}
                    </span>
                </div>

                <div
                    className="relative w-72 h-96 cursor-pointer perspective-1000"
                    onClick={() => setShowRole(!showRole)}
                >
                    <div
                        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${showRole ? 'rotate-y-180' : ''}`}
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: showRole ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                    >
                        {/* 卡片背面 */}
                        <div className="absolute inset-0 backface-hidden bg-slate-900 border-4 border-white/5 rounded-[50px] flex flex-col items-center justify-center shadow-2xl">
                            <div className="text-6xl mb-4 opacity-30">🔍</div>
                            <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">點擊翻開身分</p>
                        </div>

                        {/* 卡片正面 */}
                        <div
                            className="absolute inset-0 backface-hidden bg-white border-4 border-white rounded-[50px] flex flex-col items-center justify-center p-8 text-center shadow-2xl"
                            style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden'
                            }}
                        >
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Your Role</p>
                            <h3 className="text-3xl font-black text-slate-900 mb-6 italic">{myRole || 'Villager'}</h3>
                            <div className="w-full h-px bg-slate-100 mb-6"></div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Secret Word</p>
                            <h2 className={`text-4xl font-black italic tracking-tighter ${secretWord ? 'text-orange-600' : 'text-slate-200'}`}>
                                {secretWord || '????'}
                            </h2>
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 text-sm font-bold animate-pulse text-center">
                    {showRole ? "再次點擊以蓋牌保護資訊" : "請私下查看你的資訊"}
                </p>
            </div>
        );
    }

    // 階段 D: 初始大廳
    return (
        <div className="w-full max-w-4xl flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-700 p-4">
            <div className="fixed top-2 right-2 z-50 bg-slate-900 px-3 py-1 rounded-full text-[10px] text-white border border-white/10">
                伺服器: {connStatus}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 px-4">
                <div className="text-center md:text-left">
                    <h2 className="text-5xl font-black text-orange-600 italic tracking-tighter">LOBBY</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Room ID: {roomId}</p>
                </div>
                <div className="text-4xl font-mono font-black text-white bg-slate-900 px-6 py-2 rounded-2xl border border-slate-800 shadow-xl">
                    {roomData.players.length}<span className="text-slate-700 text-xl">/6</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roomData.players.map((p) => (
                    <div key={p.id} className={`p-8 rounded-[35px] border-2 flex flex-col items-center gap-3 transition-all ${socket && p.id === socket.id ? 'bg-orange-600 border-orange-400 scale-105 shadow-xl' : 'bg-slate-900/50 border-slate-800'}`}>
                        <span className="text-3xl">{socket && p.id === socket.id ? '👤' : '💀'}</span>
                        <span className="font-black text-white uppercase text-sm truncate w-full text-center">{p.name}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleStartGame}
                className={`py-6 rounded-3xl font-black text-2xl transition-all shadow-2xl ${roomData.players.length >= 3
                    ? 'bg-white text-black hover:bg-orange-600 hover:text-white active:scale-95'
                    : 'bg-slate-800 text-slate-700 cursor-not-allowed'
                    }`}
            >
                {roomData.players.length >= 3 ? 'START HUNT' : 'WAITING FOR HUNTERS...'}
            </button>
        </div>
    );
}