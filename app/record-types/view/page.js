"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RecordTypesPage() {
    const [types, setTypes] = useState([]);
    const [newTypeName, setNewTypeName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

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

    // 2. 處理新增類型
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTypeName.trim()) return;

        const res = await fetch("/api/record-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newTypeName }),
        });

        if (res.ok) {
            setNewTypeName("");
            fetchTypes(); // 重新整理列表
        } else {
            alert("建立失敗");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">紀錄類型管理</h1>
                    <p className="text-gray-500 mt-2">定義系統中的資料模型類別</p>
                </header>

                {/* 新增類型區塊 */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <form onSubmit={handleCreate} className="flex gap-4">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="輸入新類型名稱 (例如: 客戶資料, 庫存項目)"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                            建立新類別
                        </button>
                    </form>
                </section>

                {/* 類型列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        <p className="text-gray-500">讀取中...</p>
                    ) : types.length === 0 ? (
                        <p className="text-gray-500">目前沒有定義任何類型。</p>
                    ) : (
                        types.map((type) => (
                            <div key={type._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">{type.name}</h3>
                                <div className="flex gap-3">
                                    <Link
                                        href={`/fields?recordTypeId=${type._id}`}
                                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition"
                                    >
                                        ⚙️ 管理欄位
                                    </Link>
                                    <Link
                                        href={`/records?recordTypeId=${type._id}`}
                                        className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-md transition"
                                    >
                                        📊 查看數據
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}