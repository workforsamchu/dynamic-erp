"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRecordPage() {
    const router = useRouter();
    const [recordTypes, setRecordTypes] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 儲存各個關聯欄位的選項清單，格式如：{ fieldKey: [option1, option2] }
    const [remoteOptions, setRemoteOptions] = useState({});

    // 1. 初始化：抓取所有紀錄類別
    useEffect(() => {
        fetch("/api/record-types")
            .then(res => res.json())
            .then(data => setRecordTypes(data));
    }, []);

    // 2. 當類別改變：抓取對應的欄位定義
    useEffect(() => {
        if (!selectedTypeId) {
            setFields([]);
            return;
        }

        fetch(`/api/fields?recordTypeId=${selectedTypeId}`)
            .then(res => res.json())
            .then(async (data) => {
                // 1. 關鍵步驟：篩選出僅啟用的欄位
                // 如果 isActive 是 undefined (舊資料)，我們預設它是啟用的
                const activeFields = data.filter(field => field.isActive !== false);

                // 2. 設定 state 只儲存活躍欄位
                setFields(activeFields);

                const initialData = {};
                const optionsMap = {};

                // 3. 只遍歷活躍的欄位來初始化資料與抓取遠端選項
                for (const field of activeFields) {
                    if ((field.type === "codelist" || field.type === "array") && field.sourceRecordTypeId) {
                        try {
                            const res = await fetch(`/api/records?recordTypeId=${field.sourceRecordTypeId}`);
                            const sourceRecords = await res.json();
                            optionsMap[field.key] = sourceRecords;
                        } catch (err) {
                            console.error(`無法抓取欄位 ${field.key} 的選項:`, err);
                        }
                    }

                    // 初始化 formData：如果是 array 類型給予空陣列，否則空字串
                    initialData[field.key] = field.type === "array" ? [] : "";
                }

                setRemoteOptions(optionsMap);
                setFormData(initialData);
            });
    }, [selectedTypeId]);

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // 處理多選標籤 (array) 的變動
    const handleTagChange = (key, value) => {
        setFormData(prev => {
            const currentTags = prev[key] || [];
            if (currentTags.includes(value)) {
                return { ...prev, [key]: currentTags.filter(t => t !== value) };
            } else {
                return { ...prev, [key]: [...currentTags, value] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recordTypeId: selectedTypeId,
                    data: formData
                }),
            });

            if (res.ok) {
                alert("建立成功！");
                router.push("/records/view?recordTypeId=" + selectedTypeId);
            } else {
                const errorData = await res.json();
                alert(`失敗: ${errorData.error}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseStyle = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white";

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">新增紀錄數據</h1>

                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                    <label className="block text-sm font-bold text-blue-700 mb-2">1. 選擇操作類別</label>
                    <select
                        className={inputBaseStyle}
                        value={selectedTypeId}
                        onChange={(e) => setSelectedTypeId(e.target.value)}
                    >
                        <option value="">-- 請選擇 Record Type --</option>
                        {recordTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                </div>

                {fields.length > 0 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">2. 填寫欄位資料</h2>
                        {fields.map(field => (
                            <div key={field.key} className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-600">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {/* 情況 A: 單選 (codelist) */}
                                {field.type === "codelist" ? (
                                    <select
                                        className={inputBaseStyle}
                                        value={formData[field.key] || ""}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        required={field.required}
                                    >
                                        <option value="">-- 請選擇 --</option>
                                        {remoteOptions[field.key]?.map(opt => (
                                            <option key={opt._id} value={opt._id}>
                                                {/* 這裡假設你想顯示紀錄中第一個欄位的值，或特定格式 */}
                                                {Object.values(opt.data)[0] || opt._id}
                                            </option>
                                        ))}
                                    </select>

                                    /* 情況 B: 多選 (array) */
                                ) : field.type === "array" ? (
                                    <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                                        {remoteOptions[field.key]?.map(opt => {
                                            const isChecked = formData[field.key]?.includes(opt._id);
                                            return (
                                                <label key={opt._id} className={`flex items-center px-3 py-1 rounded-full border cursor-pointer transition ${isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isChecked}
                                                        onChange={() => handleTagChange(field.key, opt._id)}
                                                    />
                                                    <span className="text-xs">{Object.values(opt.data)[0] || opt._id}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    /* 情況 C: 普通輸入 (Text/Number/Date) */
                                ) : (
                                    <input
                                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                                        className={inputBaseStyle}
                                        value={formData[field.key] || ""}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        placeholder={`請輸入 ${field.label}`}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-lg transition-all"
                            >
                                {isSubmitting ? "正在儲存..." : "確認提交紀錄"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}