// app/admin/layout.js
import Sidebar from "@/components/Sidebar";
// ❌ 移除 Inter, globals.css, 以及 html/body 標籤

export const metadata = {
    title: "Dynamic Admin Dashboard",
    description: "高度自定義的紀錄與欄位管理系統",
};

export default function AdminLayout({ children }) {
    return (
        // ✅ 直接從最外層的容器 div 開始
        <div className="flex h-screen overflow-hidden w-full">
            {/* 修正後的 Sidebar */}
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
    );
}