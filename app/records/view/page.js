"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 內部組件：處理邏輯
function RecordsListContent() {
    const searchParams = useSearchParams();
    const [recordTypes, setRecordTypes] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [records, setRecords] = useState([]);
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 第一步：載入所有紀錄類型
    useEffect(() => {
        async function loadTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            setRecordTypes(data);
        }
        loadTypes();
    }, []);

    // 第二步：主動從 URL 獲取 recordTypeId 並設定狀態
    useEffect(() => {
        const typeIdFromUrl = searchParams.get("recordTypeId");
        if (typeIdFromUrl) {
            setSelectedTypeId(typeIdFromUrl);
        }
    }, [searchParams]); // 當網址參數改變時同步狀態

    // 第三步：當 selectedTypeId 改變時，抓取對應的 Fields 和 Records
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
                    const recordsData = await resRecords.json();
                    const fieldsData = await resFields.json();
                    setRecords(recordsData);
                    setFields(fieldsData);
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">資料紀錄總覽</h1>
                        <p className="text-gray-500 mt-1">
                            {selectedTypeId ? "檢視當前類別數據" : "請選擇類別以檢視數據"}
                        </p>
                    </div>

                    <div className="w-full md:w-64">
                        <select
                            className="w-full p-2 border rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={selectedTypeId}
                            onChange={(e) => setSelectedTypeId(e.target.value)}
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
                        <div className="p-20 text-center text-gray-400">請先從右上角選擇一個類別</div>
                    ) : isLoading ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            讀取中...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {fields.map((field) => (
                                            <th key={field.key} className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                {field.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.length > 0 ? (
                                        records.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50 transition">
                                                {fields.map((field) => (
                                                    <td key={field.key} className="px-6 py-4 text-sm text-gray-700">
                                                        {record.data?.[field.key] || "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={fields.length} className="px-6 py-10 text-center text-gray-400 italic">
                                                此類別暫無任何紀錄
                                            </td>
                                        </tr>
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

// 主頁面出口：必須包裹 Suspense
export default function RecordsPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center">正在初始化頁面...</div>}>
            <RecordsListContent />
        </Suspense>
    );
}