"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RecordTypesPage() {
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 表單狀態
    const [key, setKey] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // 1. 取得所有紀錄類型
    const fetchTypes = async () => {
        try {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            setTypes(data);
        } catch (error) {
            console.error("Failed to fetch types:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // 2. 處理新增類型 (整合原本的 Create 邏輯)
    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/record-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, name, description }),
            });

            if (!res.ok) throw new Error("建立失敗，Key 可能已重複");

            // 清空表單
            setKey("");
            setName("");
            setDescription("");
            fetchTypes(); // 重新整理列表
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">紀錄類型管理</h1>
                        <p className="text-gray-500 mt-2">定義並組織您的資料模型結構</p>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                        共有 {types.length} 個類別
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 左側：建立新類型表單 (佔 1 欄) */}
                    <section className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <span className="bg-blue-600 w-2 h-6 rounded-full mr-3"></span>
                                快速建立類別
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-4">
                                {error && (
                                    <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">類型名稱</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="例如: 客戶資料"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">類型代碼 (Key)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-mono text-sm"
                                        placeholder="customerList"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">描述 (選填)</label>
                                    <textarea
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                        placeholder="此類型的用途..."
                                        rows="2"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                                        }`}
                                >
                                    {isSubmitting ? "建立中..." : "確認建立"}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* 右側：類型列表 (佔 2 欄) */}
                    <section className="lg:col-span-2">
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        ) : types.length === 0 ? (
                            <div className="text-center py-20 bg-gray-100 rounded-2xl border-2 border-dashed">
                                <p className="text-gray-400">尚未定義任何類型，請從左側開始。</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {types.map((type) => (
                                    <div key={type._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">{type.name}</h3>
                                            <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-400 uppercase">{type.key}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-6 line-clamp-2 min-h-[32px]">
                                            {type.description || "暫無描述資訊"}
                                        </p>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/fields/view?recordTypeId=${type._id}`}
                                                className="flex-1 text-center text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 rounded-lg transition"
                                            >
                                                ⚙️ 欄位定義
                                            </Link>
                                            <Link
                                                href={`/records/view?recordTypeId=${type._id}`}
                                                className="flex-1 text-center text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg transition"
                                            >
                                                📊 數據瀏覽
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}