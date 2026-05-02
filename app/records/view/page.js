"use client";

import { useEffect, useState } from "react";

export default function RecordsPage() {
    const [recordTypes, setRecordTypes] = useState([]); // 存放所有類型
    const [selectedTypeId, setSelectedTypeId] = useState(""); // 當前選中的類型 ID
    const [records, setRecords] = useState([]);
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 第一步：頁面載入時先抓取「紀錄類型」
    useEffect(() => {
        async function loadTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            setRecordTypes(data);
        }
        loadTypes();
    }, []);

    // 第二步：當 selectedTypeId 改變時，抓取對應的 Fields 和 Records
    useEffect(() => {
        if (!selectedTypeId) {
            setRecords([]);
            setFields([]);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                // 必須帶上 recordTypeId 參數
                const [resRecords, resFields] = await Promise.all([
                    fetch(`/api/records?recordTypeId=${selectedTypeId}`),
                    fetch(`/api/fields?recordTypeId=${selectedTypeId}`) // 假設你的 fields API 也需要此參數
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
                        <p className="text-gray-500 mt-1">請選擇類別以檢視數據</p>
                    </div>

                    {/* 類型選擇下拉選單 */}
                    <div className="w-full md:w-64">
                        <select
                            className="w-full p-2 border rounded-lg shadow-sm bg-white"
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
                        <div className="p-20 text-center">讀取中...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {fields.map((field) => (
                                            <th key={field.key} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {field.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            {fields.map((field) => (
                                                <td key={field.key} className="px-6 py-4 text-sm text-gray-700">
                                                    {/* 注意：你的資料存在 record.data 裡面 */}
                                                    {record.data?.[field.key] || "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}