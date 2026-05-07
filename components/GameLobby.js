'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

export default function GameLobby() {
    // --- 1. 基礎狀態 ---
    const [hasMounted, setHasMounted] = useState(false);
    const [joined, setJoined] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [roomData, setRoomData] = useState({ players: [] });
    const [showRole, setShowRole] = useState(false); // 控制翻轉的局部狀態

    // --- 2. 遊戲邏輯狀態 ---
    const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, SETTING_WORD, GUESSING
    const [mayorId, setMayorId] = useState(null);
    const [myRole, setMyRole] = useState(null);
    const [secretWord, setSecretWord] = useState(null);
    const [inputWord, setInputWord] = useState('');

    useEffect(() => {
        setHasMounted(true);
        // 初始化 Socket 連線
        socket = io('http://localhost:3001');

        // 監聽房間資訊更新
        socket.on('roomUpdate', (data) => {
            setRoomData(data);
        });

        // 監聽遊戲狀態切換 (包含村長是誰)
        socket.on('gameStatusUpdate', ({ status, mayorId }) => {
            setGameStatus(status);
            if (mayorId) setMayorId(mayorId);
        });

        // 監聽角色分配
        socket.on('assignRole', ({ role }) => {
            setMyRole(role);
        });

        // 監聽謎底揭曉 (僅特定角色會收到)
        socket.on('revealWord', ({ word }) => {
            setSecretWord(word);
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    // --- 3. 互動行為 ---
    const handleJoin = () => {
        if (playerName.trim() && roomId.trim()) {
            socket.emit('joinRoom', { roomId, playerName });
            setJoined(true);
        }
    };

    const handleStartGame = () => {
        socket.emit('startGame', { roomId });
    };

    const handleSubmitWord = () => {
        if (inputWord.trim()) {
            socket.emit('submitWord', { roomId, word: inputWord });
        }
    };

    if (!hasMounted) return null;

    // --- 4. 介面渲染邏輯 ---

    // 階段 A: 登入介面
    if (!joined) {
        return (
            <div className="w-full max-w-md p-10 bg-slate-900 rounded-[40px] border border-white/5 shadow-2xl space-y-6">
                <h2 className="text-3xl font-black text-white italic text-center uppercase tracking-tighter">Enter The Fog</h2>
                <input
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white text-center font-bold"
                    placeholder="你的暱稱"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <input
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl text-white text-center font-bold"
                    placeholder="房間 ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button onClick={handleJoin} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-2xl transition-all">
                    JOIN GAME
                </button>
            </div>
        );
    }

    // 階段 B: 村長設定謎底
    if (gameStatus === 'SETTING_WORD') {
        const isMayor = socket.id === mayorId;
        return (
            <div className="text-center p-12 bg-slate-900 rounded-[50px] border border-orange-500/20 max-w-lg w-full">
                <div className="mb-8">
                    <span className="text-5xl block mb-4">{isMayor ? '📜' : '⌛'}</span>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">
                        {isMayor ? '你是村長，請設定謎底' : '村長正在思考謎底...'}
                    </h2>
                </div>
                {isMayor && (
                    <div className="space-y-4">
                        <input
                            className="w-full bg-black/50 border-2 border-slate-700 p-4 rounded-2xl text-white text-center text-xl font-bold focus:border-orange-500 outline-none"
                            placeholder="輸入謎底關鍵字"
                            value={inputWord}
                            onChange={(e) => setInputWord(e.target.value)}
                        />
                        <button onClick={handleSubmitWord} className="w-full bg-orange-600 py-4 rounded-2xl text-white font-black hover:scale-105 transition-transform">
                            確認並發放身分
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // 階段 C: 遊戲主畫面 (猜測階段)
    if (gameStatus === 'GUESSING') {

        return (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-10 animate-in fade-in duration-700">
                {/* 頂部身分提示 */}
                <div className="bg-orange-600/20 px-6 py-2 rounded-full border border-orange-500/30">
                    <span className="text-orange-500 font-black tracking-widest text-sm">
                        {socket.id === mayorId ? '🛡️ MAYOR' : '👥 HUNTER'}
                    </span>
                </div>

                {/* 3D 翻轉卡片容器 */}
                <div
                    className="relative w-72 h-96 cursor-pointer perspective-1000 text-black"
                    onClick={() => setShowRole(!showRole)}
                >
                    <div
                        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${showRole ? 'rotate-y-180' : ''}`}
                        style={{ transform: showRole ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                        {/* 卡片背面 (未點擊時顯示) */}
                        <div className="absolute inset-0 backface-hidden bg-slate-900 border-4 border-white/5 rounded-[50px] flex flex-col items-center justify-center shadow-2xl">
                            <div className="text-6xl mb-4 opacity-50">㊙️</div>
                            <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">點擊翻開身分與謎底</p>
                        </div>

                        {/* 卡片正面 (點擊後顯示) */}
                        <div
                            className="absolute inset-0 backface-hidden bg-white border-4 border-white rounded-[50px] flex flex-col items-center justify-center p-8 text-center shadow-2xl"
                            style={{ transform: 'rotateY(180deg)' }}
                        >
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 text-orange-600">Your Identity</p>
                            <h3 className="text-3xl font-black text-slate-900 mb-6 italic">{myRole}</h3>

                            <div className="w-full h-px bg-slate-100 mb-6"></div>

                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Secret Word</p>
                            <h2 className={`text-4xl font-black italic tracking-tighter ${secretWord ? 'text-orange-600' : 'text-slate-200'}`}>
                                {secretWord ? secretWord : 'UNKNOWN'}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-slate-500 text-sm font-bold animate-pulse">
                        {showRole ? "再次點擊以蓋牌保護資訊" : "請私下查看你的資訊"}
                    </p>
                </div>
            </div>
        );
    }

    // 階段 D: 初始大廳
    return (
        <div className="w-full max-w-4xl flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end px-4">
                <div>
                    <h2 className="text-5xl font-black text-orange-600 italic tracking-tighter">LOBBY</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Waiting for hunters: {roomId}</p>
                </div>
                <div className="text-4xl font-mono font-black text-white bg-slate-900 px-6 py-2 rounded-2xl border border-slate-800">
                    {roomData.players.length}<span className="text-slate-700 text-xl">/6</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roomData.players.map((p) => (
                    <div key={p.id} className={`p-8 rounded-[35px] border-2 flex flex-col items-center gap-3 transition-all ${p.id === socket.id ? 'bg-orange-600 border-orange-400 scale-105 shadow-xl' : 'bg-slate-900/50 border-slate-800'}`}>
                        <span className="text-3xl">{p.id === socket.id ? '👤' : '💀'}</span>
                        <span className="font-black text-white uppercase text-sm">{p.name}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleStartGame}
                disabled={roomData.players.length < 3}
                className={`py-6 rounded-3xl font-black text-2xl transition-all ${roomData.players.length >= 3 ? 'bg-white text-black hover:bg-orange-600 hover:text-white' : 'bg-slate-800 text-slate-700 cursor-not-allowed'}`}
            >
                {roomData.players.length >= 3 ? 'START HUNT' : 'NEED 3 PLAYERS'}
            </button>
        </div>
    );
}