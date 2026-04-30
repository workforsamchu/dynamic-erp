"use client"

import useSWR from "swr"
import Link from "next/link"
import fetcher from "@/lib/fetcher"

export default function Dashboard() {
    // 直接使用 SWR，不再手動控管 mounted 狀態
    // SWR 會在客戶端自動處理請求
    const { data, error, isLoading } = useSWR(
        "/api/dashboard",
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateIfStale: true,
            keepPreviousData: true,
            // 增加一段配置：如果 back 沒反應，強制它在掛載時重新驗證
            revalidateOnMount: true
        }
    )

    // 只有在完全沒有數據且加載中時才顯示簡短提示
    if (!data && isLoading) {
        return <div className="p-6 font-sans">載入中...</div>
    }

    if (error) {
        return <div className="p-6 text-red-500">連線錯誤，請重新整理頁面。</div>
    }

    // 使用防禦性賦值，確保 data 即使在 back 的瞬間是 undefined 也不會崩潰
    const summary = data?.summary || { recordTypes: 0, fields: 0, records: 0 }
    const recentRecords = data?.recentRecords || []
    const recordTypes = data?.recordTypes || []

    return (
        <div className="p-6 space-y-6 font-sans">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <Card title="Record Types" value={summary.recordTypes} />
                <Card title="Fields" value={summary.fields} />
                <Card title="Records" value={summary.records} />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <Link href="/record-types/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    ➕ Record Type
                </Link>
                <Link href="/fields/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    ➕ Field
                </Link>
                <Link href="/records/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    ➕ Record
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded shadow border">
                    <h2 className="font-bold mb-3 border-b pb-2">Recent Records</h2>
                    <div className="space-y-1">
                        {recentRecords.map((rec) => (
                            <Link
                                key={rec._id}
                                href={`/records/${rec._id}`}
                                className="block py-2 px-2 hover:bg-gray-100 rounded border-b last:border-0"
                            >
                                <span className="text-blue-600 font-medium">
                                    {rec.recordTypeId?.name || "未知類型"}
                                </span>
                                <span className="text-gray-400 text-xs ml-2">{rec._id}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow border">
                    <h2 className="font-bold mb-3 border-b pb-2">Record Types</h2>
                    <div className="space-y-1">
                        {recordTypes.map((rt) => (
                            <div key={rt._id} className="py-2 px-2 border-b last:border-0 text-gray-700">
                                {rt.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Card({ title, value }) {
    return (
        <div className="bg-white p-4 rounded shadow border">
            <div className="text-gray-500 text-sm">{title}</div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
        </div>
    )
}