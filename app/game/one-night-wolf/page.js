'use client';

import GameLobby from '@/components/GameLobby'; // 確保路徑指向你的組件位置

export default function OneNightWolfPage() {
    return (
        <main className="min-h-screen bg-slate-950">
            {/* 你可以在這裡加入全域的導覽列或標題 */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <GameLobby />
            </div>
        </main>
    );
}