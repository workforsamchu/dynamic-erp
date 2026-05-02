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
    // 新增：存儲作為數據來源的 Record Type ID
    const [sourceRecordTypeId, setSourceRecordTypeId] = useState("");

    // 1. 載入所有類別 (供選擇當前管理類別 & 供選擇數據來源)
    useEffect(() => {
        async function loadRecordTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            console.log('record type data', data);
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
            console.log('fields data', data);
            setExistingFields(data);
        }
        loadFields();
    }, [selectedType]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 準備提交的資料
        const payload = {
            recordTypeId: selectedType,
            key: fieldKey,
            label: fieldLabel,
            type: fieldType,
            sourceRecordTypeId: sourceRecordTypeId
        };

        // if (fieldType === "codelist" || fieldType === "array") {
        //     payload.sourceRecordTypeId = sourceRecordTypeId;
        // }

        console.log('payload', payload);
        const res = await fetch("/api/fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            alert("✅ Field created!");
            setFieldLabel("");
            setFieldKey("");
            setSourceRecordTypeId(""); // 重設來源

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
                        {/* 當前操作的 Record Type */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">管理目標類別</label>
                            <select
                                className="w-full p-2 border rounded-md bg-gray-50"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                required
                            >
                                <option value="">-- 請選擇 --</option>
                                {recordTypes.map((rt) => (
                                    <option key={rt._id} value={rt._id}>{rt.name}</option>
                                ))}
                            </select>
                        </div>

                        <hr className="my-4" />

                        <div>
                            <label className="block text-sm font-medium mb-1">Field Key (ID)</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={fieldKey}
                                onChange={(e) => setFieldKey(e.target.value)}
                                placeholder="e.g. sex"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Field Name (Label)</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={fieldLabel}
                                onChange={(e) => setFieldLabel(e.target.value)}
                                placeholder="e.g. 性別"
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
                                <option value="codelist">Selection (Dropdown)</option>
                                <option value="array">Multiple Selection</option>
                            </select>
                        </div>

                        {/* 重點：動態顯示數據來源選擇 */}
                        {(fieldType === "codelist" || fieldType === "array") && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-bold text-blue-700 mb-2">
                                    ⚙️ 數據來源 (Source Record Type)
                                </label>
                                <select
                                    className="w-full p-2 border border-blue-200 rounded-md bg-white"
                                    value={sourceRecordTypeId}
                                    onChange={(e) => {
                                        console.log("當前的 e.target.value 是:", e.target.value);
                                        setSourceRecordTypeId(
                                            e.target.value)
                                    }}
                                    required
                                >
                                    <option value="">-- 選擇來源類別 --</option>
                                    {recordTypes.map((rt) => (
                                        <option key={rt._id} value={rt._id}>{rt.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-blue-500 mt-2">
                                    * 此欄位的選項將會自動讀取該類別的所有紀錄。
                                </p>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-sm">
                            建立欄位
                        </button>
                    </form>
                </div>

                {/* 右側：顯示現有欄位 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-6">現有欄位列表</h2>
                    {!selectedType ? (
                        <div className="p-10 text-center text-gray-400 border-2 border-dashed rounded-lg">
                            請先選擇一個類別以查看欄位
                        </div>
                    ) : existingFields.length === 0 ? (
                        <p className="text-gray-400">目前尚無欄位定義</p>
                    ) : (
                        <ul className="space-y-3">
                            {existingFields.map((f) => (
                                <li key={f._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800">{f.label}</p>
                                            <p className="text-xs text-gray-500 font-mono">{f.key} ({f.type})</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {f.sourceRecordTypeId && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                    Link: {recordTypes.find(r => r._id === f.sourceRecordTypeId)?.name || "Unknown"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function FieldsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FieldsManagerContent />
        </Suspense>
    );
}