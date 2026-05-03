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

    // 新增：儲存所有關聯欄位的顯示名稱映射
    // 格式：{ [fieldKey]: { [recordId]: "顯示名稱" } }
    const [lookupTable, setLookupTable] = useState({});

    useEffect(() => {
        async function loadTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            setRecordTypes(data);
        }
        loadTypes();
    }, []);

    useEffect(() => {
        const typeIdFromUrl = searchParams.get("recordTypeId");
        if (typeIdFromUrl) {
            setSelectedTypeId(typeIdFromUrl);
        }
    }, [searchParams]);

    const handleTypeChange = (e) => {
        const newId = e.target.value;
        setSelectedTypeId(newId);
        const params = new URLSearchParams(searchParams);
        if (newId) params.set("recordTypeId", newId);
        else params.delete("recordTypeId");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

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
                    const fetchedRecords = await resRecords.json();
                    const fetchedFields = await resFields.json();

                    setRecords(fetchedRecords);
                    setFields(fetchedFields);

                    // --- 處理關聯數據顯示名稱 ---
                    const newLookupTable = {};
                    const activeFields = fetchedFields.filter(f => f.isActive !== false);

                    for (const field of activeFields) {
                        if ((field.type === "codelist" || field.type === "array") && field.sourceRecordTypeId) {
                            const res = await fetch(`/api/records?recordTypeId=${field.sourceRecordTypeId}`);
                            if (res.ok) {
                                const sourceRecords = await res.json();
                                // 建立映射物件 { id: label }
                                const mapping = {};
                                sourceRecords.forEach(r => {
                                    // 抓取該紀錄的第一個欄位值作為顯示標籤
                                    mapping[r._id] = Object.values(r.data)[0] || r._id;
                                });
                                newLookupTable[field.key] = mapping;
                            }
                        }
                    }
                    setLookupTable(newLookupTable);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [selectedTypeId]);

    const activeFields = fields.filter(f => f.isActive !== false);

    // 新增：格式化顯示內容的函數
    const renderCellContent = (record, field) => {
        const value = record.data?.[field.key];

        // 1. 處理 Boolean (問題 2)
        if (field.type === "boolean") {
            return value === true ? (
                <span className="text-green-600 font-bold">✅</span>
            ) : (
                <span className="text-red-500 font-bold">❌</span>
            );
        }

        // 2. 處理 Codelist (單選關聯 - 問題 1)
        if (field.type === "codelist") {
            return lookupTable[field.key]?.[value] || value || "-";
        }

        // 3. 處理 Array (多選關聯 - 問題 1)
        if (field.type === "array" && Array.isArray(value)) {
            const labels = value.map(id => lookupTable[field.key]?.[id] || id);
            return labels.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                    {labels.map((label, idx) => (
                        <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{label}</span>
                    ))}
                </div>
            ) : "-";
        }

        // 4. 普通內容
        return value || "-";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* 標題與選單部分 */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">資料紀錄總覽</h1>
                    <div className="w-64">
                        <select
                            className="w-full p-2 border rounded-lg shadow-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedTypeId}
                            onChange={handleTypeChange}
                        >
                            <option value="">-- 選擇紀錄類別 --</option>
                            {recordTypes.map(type => (
                                <option key={type._id} value={type._id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

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
                                        {activeFields.map((field) => (
                                            <th key={field.key} className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                                                {field.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeFields.length} className="px-6 py-10 text-center text-gray-400 italic">尚無任何紀錄</td>
                                        </tr>
                                    ) : (
                                        records.map((record) => (
                                            <tr key={record._id} className="hover:bg-blue-50/30 transition-colors">
                                                {activeFields.map((field) => (
                                                    <td key={field.key} className="px-6 py-4 text-sm text-gray-700">
                                                        {renderCellContent(record, field)}
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