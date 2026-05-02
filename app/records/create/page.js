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
            .then(data => {
                setFields(data);
                // 初始化表單資料結構，例如 { name: "", age: "" }
                const initialData = {};
                data.forEach(f => initialData[f.key] = "");
                setFormData(initialData);
            });
    }, [selectedTypeId]);

    // 處理輸入變動
    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // 3. 提交資料
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
                router.push("/records"); // 跳轉回列表頁
            } else {
                const errorData = await res.json();
                alert(`建立失敗: ${errorData.details ? JSON.stringify(errorData.details) : errorData.error}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseStyle = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none";

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold mb-6">新增紀錄</h1>

                {/* 步驟一：選擇類別 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">選擇紀錄類別</label>
                    <select
                        className={inputBaseStyle}
                        value={selectedTypeId}
                        onChange={(e) => setSelectedTypeId(e.target.value)}
                    >
                        <option value="">-- 請選擇 --</option>
                        {recordTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                </div>

                {/* 步驟二：動態生成欄位 */}
                {fields.length > 0 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(field => (
                            <div key={field.key}>
                                <label className="block text-sm font-medium mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.type === "number" ? "number" : "text"}
                                    className={inputBaseStyle}
                                    value={formData[field.key] || ""}
                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                    placeholder={`輸入 ${field.label}`}
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
                        >
                            {isSubmitting ? "儲存中..." : "確認新增"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}