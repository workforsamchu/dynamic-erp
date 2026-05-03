"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function RecordsListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [recordTypes, setRecordTypes] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [records, setRecords] = useState([]);
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. 載入紀錄類型
    useEffect(() => {
        async function loadTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            setRecordTypes(data);
        }
        loadTypes();
    }, []);

    const activeFields = fields.filter(f => f.isActive !== false);
    // 2. 初始化：從 URL 讀取 ID
    useEffect(() => {
        const typeIdFromUrl = searchParams.get("recordTypeId");
        if (typeIdFromUrl) {
            setSelectedTypeId(typeIdFromUrl);
        }
    }, [searchParams]);

    // 3. 核心功能：當選單切換時，主動修改 URL
    const handleTypeChange = (e) => {
        const newId = e.target.value;
        setSelectedTypeId(newId);

        // 建立新的 URL 參數物件
        const params = new URLSearchParams(searchParams);
        if (newId) {
            params.set("recordTypeId", newId);
        } else {
            params.delete("recordTypeId");
        }

        // 執行跳轉，{ scroll: false } 防止頁面跳回頂部
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 4. 當 selectedTypeId 改變時抓取數據
    useEffect(() => {
        if (!selectedTypeId) {
            setRecords([]);
            setFields([]);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                const [resRecords, resFields] = await Promise.all([
                    fetch(`/api/records?recordTypeId=${selectedTypeId}`),
                    fetch(`/api/fields?recordTypeId=${selectedTypeId}`)
                ]);

                if (resRecords.ok && resFields.ok) {
                    setRecords(await resRecords.json());
                    setFields(await resFields.json());
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [selectedTypeId]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">資料紀錄總覽</h1>

                    <div className="w-64">
                        <select
                            className="w-full p-2 border rounded-lg shadow-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedTypeId}
                            onChange={handleTypeChange} // 改用新的處理函式
                        >
                            <option value="">-- 選擇紀錄類別 --</option>
                            {recordTypes.map(type => (
                                <option key={type._id} value={type._id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 表格部分保持不變... */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    {!selectedTypeId ? (
                        <div className="p-20 text-center text-gray-400">請先選擇一個類別</div>
                    ) : isLoading ? (
                        <div className="p-20 text-center">讀取中...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {/* 2. 渲染表頭：僅限活躍欄位 */}
                                        {activeFields.map((field) => (
                                            <th
                                                key={field.key}
                                                className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-wider"
                                            >
                                                {field.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeFields.length} className="px-6 py-10 text-center text-gray-400 italic">
                                                尚無任何紀錄
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record) => (
                                            <tr key={record._id} className="hover:bg-blue-50/30 transition-colors">
                                                {/* 3. 渲染內容：必須與表頭使用同一個 activeFields 陣列 */}
                                                {activeFields.map((field) => (
                                                    <td key={field.key} className="px-6 py-4 text-sm text-gray-700">
                                                        {/* 處理不同類型的顯示邏輯，例如 array 或 null */}
                                                        {Array.isArray(record.data?.[field.key])
                                                            ? record.data[field.key].join(", ")
                                                            : (record.data?.[field.key] || "-")
                                                        }
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function RecordsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RecordsListContent />
        </Suspense>
    );
}