"use client"

import useSWR from "swr"
import Link from "next/link"
import fetcher from "@/lib/fetcher"

export default function Dashboard() {
    const { data, error, isLoading } = useSWR(
        "/api/dashboard",
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnMount: true,
            keepPreviousData: true
        }
    )

    if (isLoading && !data) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-gray-400 font-medium">系統資料讀取中...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                    ⚠️ 連線錯誤，請檢查資料庫連線或重新整理。
                </div>
            </div>
        )
    }

    const summary = data?.summary || { recordTypes: 0, fields: 0, records: 0 }
    const recentRecords = data?.recentRecords || []
    const recordTypes = data?.recordTypes || []

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">控制台</h1>
                    <p className="text-gray-500 mt-1">歡迎回來，這是您目前的系統概況</p>
                </div>
                <div className="text-sm text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border">
                    最後更新: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="紀錄類別"
                    value={summary.recordTypes}
                    color="bg-blue-600"
                    desc="定義的資料模型數量"
                />
                <StatCard
                    title="欄位定義"
                    value={summary.fields}
                    color="bg-indigo-600"
                    desc="跨類別的欄位總數"
                />
                <StatCard
                    title="數據紀錄"
                    value={summary.records}
                    color="bg-emerald-600"
                    desc="已建立的實體紀錄"
                />
            </div>

            {/* Quick Actions Container */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">快速操作</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionButton href="/record-types/view" label="管理類別" icon="📁" />
                    <ActionButton href="/fields/view" label="定義欄位" icon="⚙️" />
                    <ActionButton href="/records/create" label="新增數據" icon="➕" primary />
                    <ActionButton href="/records/view" label="檢視全部" icon="👁️" />
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Records List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 text-lg">最近新增紀錄</h2>
                        <Link href="/records/view" className="text-blue-600 text-sm hover:underline">查看所有</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentRecords.length > 0 ? (
                            recentRecords.map((rec) => (
                                <Link
                                    key={rec._id}
                                    href={`/records?id=${rec._id}`}
                                    className="block p-4 hover:bg-blue-50/30 transition-colors group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                            <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                                {rec.recordTypeId?.name || "未知類型"}
                                            </span>
                                        </div>
                                        <span className="text-gray-400 text-xs font-mono">{rec._id.substring(0, 8)}...</span>
                                    </div>
                                    <div className="mt-1 ml-5 text-sm text-gray-500 truncate">
                                        {/* 這裡可以顯示紀錄中的第一個欄位值作為預覽 */}
                                        {rec.data ? Object.values(rec.data)[0] : "無內容預覽"}
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-400">尚無紀錄</div>
                        )}
                    </div>
                </div>

                {/* Record Types Quick List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="font-bold text-gray-800 text-lg">模型清單</h2>
                    </div>
                    <div className="p-4 space-y-2">
                        {recordTypes.map((rt) => (
                            <div
                                key={rt._id}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition"
                            >
                                <span className="text-gray-700 font-medium">{rt.name}</span>
                                <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase">Type</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// 內部子組件：統計卡片
function StatCard({ title, value, color, desc }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</div>
            <div className="text-3xl font-black text-gray-900 mt-2">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{desc}</div>
        </div>
    )
}

// 內部子組件：操作按鈕
function ActionButton({ href, label, icon, primary = false }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all shadow-sm
                ${primary
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </Link>
    )
}