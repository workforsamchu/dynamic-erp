// app/game/one-night-wolf/layout.js
export default function WolfLayout({ children }) {
    return (
        <div className="h-screen bg-[#020617] text-slate-200 relative flex flex-col overflow-hidden font-sans">

            {/* 背景裝飾層 */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-orange-500/5 to-transparent" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>

            {/* Header (固定在頂部) */}
            <header className="relative z-10 px-6 py-4 flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🐺</span>
                    <h1 className="font-black tracking-[0.1em] text-lg text-white uppercase">
                        One Night <span className="text-orange-500">Wolf</span>
                    </h1>
                </div>
                <div className="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/80 text-[10px] font-bold text-emerald-500 tracking-widest uppercase">
                    Live Session
                </div>
            </header>

            {/* 主舞台：關鍵在於 items-center justify-center */}
            <main className="relative z-10 flex-grow flex items-center justify-center p-4">
                {/* 這個 div 確保內容不會溢出，且始終居中 */}
                <div className="w-full max-w-5xl flex items-center justify-center">
                    {children}
                </div>
            </main>

            {/* Footer (固定在底部) */}
            <footer className="relative z-10 py-4 text-center">
                <p className="text-slate-600 text-[8px] tracking-[0.3em] uppercase italic">
                    — Keep your eyes closed until the sun rises —
                </p>
            </footer>
        </div>
    );
}