"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FieldsManagerContent() {
    const searchParams = useSearchParams();
    const urlRecordTypeId = searchParams.get("recordTypeId");

    const [recordTypes, setRecordTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(urlRecordTypeId || "");
    const [existingFields, setExistingFields] = useState([]);

    // 表單狀態
    const [fieldLabel, setFieldLabel] = useState("");
    const [fieldKey, setFieldKey] = useState("");
    const [fieldType, setFieldType] = useState("string");

    // 1. 載入所有類別
    useEffect(() => {
        async function loadRecordTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            setRecordTypes(data);
        }
        loadRecordTypes();
    }, []);

    // 2. 當選擇的類別改變時，抓取該類別已有的欄位
    useEffect(() => {
        if (!selectedType) {
            setExistingFields([]);
            return;
        }
        async function loadFields() {
            const res = await fetch(`/api/fields?recordTypeId=${selectedType}`);
            const data = await res.json();
            setExistingFields(data);
        }
        loadFields();
    }, [selectedType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recordTypeId: selectedType,
                key: fieldKey,
                label: fieldLabel,
                type: fieldType,
            }),
        });

        if (res.ok) {
            alert("✅ Field created!");
            setFieldLabel("");
            setFieldKey("");
            // 重新整理列表
            const updatedRes = await fetch(`/api/fields?recordTypeId=${selectedType}`);
            const updatedData = await updatedRes.json();
            setExistingFields(updatedData);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 左側：建立欄位表單 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-6">建立新欄位</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Record Type</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                required
                            >
                                <option value="">-- select --</option>
                                {recordTypes.map((rt) => (
                                    <option key={rt._id} value={rt._id}>{rt.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Field Key (ID)</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={fieldKey}
                                onChange={(e) => setFieldKey(e.target.value)}
                                placeholder="e.g. email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Field Name (Label)</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={fieldLabel}
                                onChange={(e) => setFieldLabel(e.target.value)}
                                placeholder="e.g. Email Address"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Field Type</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={fieldType}
                                onChange={(e) => setFieldType(e.target.value)}
                            >
                                <option value="string">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="boolean">Boolean</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                            Create Field
                        </button>
                    </form>
                </div>

                {/* 右側：顯示現有欄位 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-6">現有欄位列表</h2>
                    {!selectedType ? (
                        <p className="text-gray-400 italic">請先選擇一個類別以查看欄位</p>
                    ) : existingFields.length === 0 ? (
                        <p className="text-gray-400">目前尚無欄位定義</p>
                    ) : (
                        <ul className="space-y-3">
                            {existingFields.map((f) => (
                                <li key={f._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{f.label}</p>
                                        <p className="text-xs text-gray-500 font-mono">{f.key} ({f.type})</p>
                                    </div>
                                    {f.required && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full">必填</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}

// 導出組件並包裹 Suspense
export default function FieldsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FieldsManagerContent />
        </Suspense>
    );
}