import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Dynamic Admin Dashboard",
    description: "高度自定義的紀錄與欄位管理系統",
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-TW" className={inter.className}>
            <body className="bg-gray-100 text-gray-900 antialiased font-sans">
                {/* 
                  確保最外層容器 h-screen 且 overflow-hidden
                  這樣捲動就會被限制在右側的 main 區域內
                */}
                <div className="flex h-screen overflow-hidden">

                    {/* 修正後的 Sidebar：不可捲動 (overflow-hidden) */}
                    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white z-20 hidden md:block h-full overflow-hidden">
                        <Sidebar />
                    </aside>

                    {/* 右側內容區 */}
                    <div className="flex flex-col flex-1 min-w-0 bg-gray-50 h-full">
                        {/* 固定 Header */}
                        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 flex-shrink-0 z-10">
                            <div className="flex-1 font-semibold text-gray-600">
                                系統後台
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    開發者模式
                                </span>
                            </div>
                        </header>

                        {/* 只有這裡可以捲動 */}
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                            <div className="max-w-7xl mx-auto min-h-full">
                                {children}

                                <footer className="mt-12 py-6 text-center text-xs text-gray-400 border-t border-gray-100">
                                    © 2026 程式夥伴專案管理系統
                                </footer>
                            </div>
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}