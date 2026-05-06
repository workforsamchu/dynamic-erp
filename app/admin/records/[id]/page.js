"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function RecordDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const router = useRouter();

    const [record, setRecord] = useState(null);
    const [fields, setFields] = useState([]);
    const [lookupTable, setLookupTable] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDetail() {
            try {
                // 1. 抓取紀錄內容
                const resRecord = await fetch(`/api/records/${id}`);
                const recordData = await resRecord.json();
                setRecord(recordData);

                // 2. 抓取該類別的欄位定義
                const resFields = await fetch(`/api/fields?recordTypeId=${recordData.recordTypeId}`);
                const fieldsData = await resFields.json();
                const activeFields = fieldsData.filter(f => f.isActive !== false);
                setFields(activeFields);

                // 3. 處理關聯顯示名稱 (Codelist/Array)
                const newLookupTable = {};
                for (const field of activeFields) {
                    if ((field.type === "codelist" || field.type === "array") && field.sourceRecordTypeId) {
                        const res = await fetch(`/api/records?recordTypeId=${field.sourceRecordTypeId}`);
                        if (res.ok) {
                            const sourceData = await res.json();
                            const mapping = {};
                            sourceData.forEach(r => {
                                mapping[r._id] = Object.values(r.data)[0] || r._id;
                            });
                            newLookupTable[field.key] = mapping;
                        }
                    }
                }
                setLookupTable(newLookupTable);
            } catch (error) {
                console.error("載入詳情失敗", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetail();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center">載入中...</div>;
    if (!record) return <div className="p-8 text-center text-red-500">紀錄不存在</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">紀錄詳情</h1>
                    <button
                        onClick={() => router.back()}
                        className="cursor-pointer text-sm text-blue-600 hover:underline"
                    >
                        返回列表
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {fields.map(field => {
                        const value = record.data?.[field.key];
                        return (
                            <div key={field.key} className="border-b border-gray-50 pb-4 last:border-0">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                    {field.label}
                                </label>
                                <div className="text-gray-700 font-medium">
                                    {field.type === "boolean" ? (
                                        value ? "✅" : "❌"
                                    ) : field.type === "codelist" ? (
                                        lookupTable[field.key]?.[value] || value || "-"
                                    ) : field.type === "array" && Array.isArray(value) ? (
                                        <div className="flex gap-2">
                                            {value.map(v => (
                                                <span key={v} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                                    {lookupTable[field.key]?.[v] || v}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        value || "-"
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}