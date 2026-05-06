// app/components/GameLobby.js (精簡版，確保居中)
'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function GameLobby() {
    const [joined, setJoined] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [roomData, setRoomData] = useState({ players: [] });

    useEffect(() => {
        socket.on('roomUpdate', (data) => setRoomData(data));
        return () => socket.off('roomUpdate');
    }, []);

    const handleJoin = () => {
        if (playerName.trim() && roomId.trim()) {
            socket.emit('joinRoom', { roomId, playerName });
            setJoined(true);
        }
    };

    // 1. 登入介面居中
    if (!joined) {
        return (
            <div className="w-full max-w-sm p-10 bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">THE HUNT BEGINS</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Identify Yourself</p>
                </div>
                <div className="space-y-4">
                    <input
                        className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl outline-none focus:border-orange-500 text-white transition-all text-center font-bold"
                        placeholder="NICKNAME"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <input
                        className="w-full bg-black/40 border border-slate-800 p-4 rounded-2xl outline-none focus:border-orange-500 text-white transition-all text-center font-bold"
                        placeholder="ROOM ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button
                        onClick={handleJoin}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                    >
                        ENTER THE DARK
                    </button>
                </div>
            </div>
        );
    }

    // 2. 玩家大廳居中
    return (
        <div className="w-full max-w-4xl bg-slate-900/20 p-8 rounded-[40px] border border-white/5 flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center px-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter">ROOM {roomId}</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                        <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em]">Waiting for victims</p>
                    </div>
                </div>
                <div className="text-right bg-black/40 px-6 py-3 rounded-2xl border border-slate-800">
                    <span className="text-3xl font-black text-white font-mono">{roomData.players.length}</span>
                    <span className="text-slate-600 font-black ml-2">/ 6</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roomData.players.map((p) => (
                    <div
                        key={p.id}
                        className={`aspect-[4/3] flex flex-col justify-center items-center rounded-[32px] border-2 transition-all duration-500 ${p.id === socket.id
                                ? 'bg-orange-600 border-orange-400 shadow-2xl shadow-orange-900/40 scale-105 z-10'
                                : 'bg-slate-900/60 border-slate-800/50 hover:border-slate-700'
                            }`}
                    >
                        <span className="text-4xl mb-3">{p.id === socket.id ? '👤' : '💀'}</span>
                        <span className={`font-black text-sm uppercase tracking-widest ${p.id === socket.id ? 'text-white' : 'text-slate-400'}`}>
                            {p.name}
                        </span>
                    </div>
                ))}
                {/* 填充空格 */}
                {[...Array(Math.max(0, 6 - roomData.players.length))].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-[32px] border-2 border-dashed border-slate-800/30 flex items-center justify-center text-slate-800 text-[10px] font-black tracking-widest uppercase">
                        Searching...
                    </div>
                ))}
            </div>

            <div className="px-4">
                <button
                    disabled={roomData.players.length < 3}
                    className={`w-full py-6 rounded-[24px] font-black text-2xl tracking-widest transition-all ${roomData.players.length >= 3
                            ? 'bg-white text-black hover:bg-orange-500 hover:text-white hover:-translate-y-1 shadow-2xl active:translate-y-0'
                            : 'bg-slate-800/50 text-slate-700 cursor-not-allowed border border-slate-800'
                        }`}
                >
                    {roomData.players.length >= 3 ? 'START HUNT' : 'WAITING FOR HUNTERS'}
                </button>
            </div>
        </div>
    );
}