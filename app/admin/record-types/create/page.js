"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import Link from "next/link"

export default function CreateRecordType() {
    const router = useRouter()
    const { mutate } = useSWRConfig()

    const [key, setKey] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/record-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, name, description }),
            })

            if (!res.ok) throw new Error("無法建立紀錄類型，請檢查 Key 是否重複")

            mutate("/api/dashboard")
            router.push("/")
            router.refresh()

        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="max-w-xl mx-auto w-full mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <span className="mr-2">←</span> 返回控制台
                </Link>
            </div>

            <div className="max-w-xl mx-auto w-full">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">建立紀錄類型</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        定義一個新的資料模型，以便後續為其添加自定義欄位。
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {/* Top Decorative Bar */}
                    <div className="h-2 bg-blue-600 w-full"></div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="flex items-center p-4 text-sm text-red-800 border border-red-100 rounded-2xl bg-red-50 animate-shake">
                                <span className="mr-2">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Type Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    類型名稱 (Display Name)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="例如：客戶清單、財務報告"
                                />
                            </div>

                            {/* Type Key */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    類型代碼 (Type Key)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                        placeholder="例如：customerList"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-300">
                                        <span className="text-xs uppercase font-bold tracking-widest">ID</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-[10px] text-gray-400">
                                    此代碼將用於程式內部引用，建立後建議不要頻繁修改。
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    描述 (Description)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
                                    rows="3"
                                    placeholder="簡短描述這個類型的用途..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white transition-all transform active:scale-[0.98]
                                    ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        建立中...
                                    </div>
                                ) : "確認建立紀錄類型"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}