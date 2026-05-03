"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FieldsManagerContent() {
    const searchParams = useSearchParams();
    const urlRecordTypeId = searchParams.get("recordTypeId");

    // 資料狀態
    const [recordTypes, setRecordTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(urlRecordTypeId || "");
    const [existingFields, setExistingFields] = useState([]);
    const [showActiveOnly, setShowActiveOnly] = useState(true); // 預設只顯示啟用的
    // 表單狀態
    const [editingFieldId, setEditingFieldId] = useState(null); // 追蹤編輯中的 ID
    const [fieldLabel, setFieldLabel] = useState("");
    const [fieldKey, setFieldKey] = useState("");
    const [fieldType, setFieldType] = useState("string");
    const [sourceRecordTypeId, setSourceRecordTypeId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const filteredFields = showActiveOnly
        ? existingFields.filter(f => f.isActive !== false)
        : existingFields;
    // 1. 載入所有 Record Types
    useEffect(() => {
        async function loadRecordTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            setRecordTypes(data);
        }
        loadRecordTypes();
    }, []);

    // 2. 載入當前類別的欄位列表
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

    // 重設表單
    const resetForm = () => {
        setEditingFieldId(null);
        setFieldKey("");
        setFieldLabel("");
        setFieldType("string");
        setSourceRecordTypeId("");
        setIsActive(true);
    };

    // 進入編輯模式
    const startEdit = (field) => {
        setEditingFieldId(field._id);
        setFieldKey(field.key);
        setFieldLabel(field.label);
        setFieldType(field.type);
        setSourceRecordTypeId(field.sourceRecordTypeId || "");
        setIsActive(field.isActive !== false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 提交表單 (建立 或 更新)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            recordTypeId: selectedType,
            key: fieldKey,
            label: fieldLabel,
            type: fieldType,
            isActive: isActive,
            // 只有特定類型才傳送數據來源
            sourceRecordTypeId: (fieldType === "codelist" || fieldType === "array") ? sourceRecordTypeId : null
        };

        const url = editingFieldId ? `/api/fields/${editingFieldId}` : "/api/fields";
        const method = editingFieldId ? "PATCH" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            alert(editingFieldId ? "✅ 欄位已更新" : "✅ 欄位已建立");
            resetForm();
            // 重新刷新列表
            const updatedRes = await fetch(`/api/fields?recordTypeId=${selectedType}`);
            const updatedData = await updatedRes.json();
            setExistingFields(updatedData);
        } else {
            const err = await res.json();
            alert("❌ 操作失敗: " + err.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 左側：表單 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-8">
                    <h2 className="text-xl font-bold mb-6">
                        {editingFieldId ? "📝 編輯欄位" : "➕ 建立新欄位"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">管理目標類別</label>
                            <select
                                className="w-full p-2 border rounded-md bg-gray-50"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                disabled={!!editingFieldId} // 編輯時禁止切換目標類別
                                required
                            >
                                <option value="">-- 請選擇 --</option>
                                {recordTypes.map((rt) => (
                                    <option key={rt._id} value={rt._id}>{rt.name}</option>
                                ))}
                            </select>
                        </div>

                        <hr />

                        <div>
                            <label className="block text-sm font-medium mb-1">Field Key (ID)</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={fieldKey}
                                onChange={(e) => setFieldKey(e.target.value)}
                                placeholder="e.g. status_code"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Field Name (Label)</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={fieldLabel}
                                onChange={(e) => setFieldLabel(e.target.value)}
                                placeholder="e.g. 狀態"
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

                        {(fieldType === "codelist" || fieldType === "array") && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <label className="block text-sm font-bold text-blue-700 mb-2">⚙️ 數據來源</label>
                                <select
                                    className="w-full p-2 border border-blue-200 rounded-md bg-white"
                                    value={sourceRecordTypeId}
                                    onChange={(e) => setSourceRecordTypeId(e.target.value)}
                                    required
                                >
                                    <option value="">-- 選擇來源類別 --</option>
                                    {recordTypes.map((rt) => (
                                        <option key={rt._id} value={rt._id}>{rt.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">啟用此欄位</label>
                        </div>

                        <div className="pt-2 space-y-2">
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold">
                                {editingFieldId ? "儲存更新" : "建立欄位"}
                            </button>
                            {editingFieldId && (
                                <button type="button" onClick={resetForm} className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                    取消編輯
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 右側：列表 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">現有欄位列表</h2>

                        {/* Toggle 開關 */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setShowActiveOnly(true)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${showActiveOnly ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                僅啟用
                            </button>
                            <button
                                onClick={() => setShowActiveOnly(false)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${!showActiveOnly ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                全部
                            </button>
                        </div>
                    </div>

                    {!selectedType ? (
                        <p className="text-gray-400 text-center py-10">請選擇類別以查看內容</p>
                    ) : filteredFields.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">
                            {showActiveOnly ? "目前沒有啟用的欄位" : "目前尚無欄位定義"}
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {filteredFields.map((f) => (
                                <li
                                    key={f._id}
                                    className={`p-3 rounded-lg border transition-all ${f.isActive === false
                                            ? 'opacity-50 bg-gray-100 border-gray-200'
                                            : 'bg-gray-50 border-gray-100 shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {f.label}
                                                {f.isActive === false && <span className="ml-2 text-[10px] bg-gray-300 text-white px-1.5 py-0.5 rounded">已停用</span>}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">{f.key} | {f.type}</p>
                                        </div>
                                        <button
                                            onClick={() => startEdit(f)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded-md transition"
                                        >
                                            編輯
                                        </button>
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