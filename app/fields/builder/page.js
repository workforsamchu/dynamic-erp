"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- 子組件：可拖拽的欄位卡片 ---
function SortableField({ field }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-2 cursor-grab active:cursor-grabbing"
        >
            <div className="bg-white border-2 border-blue-50 rounded-xl p-4 shadow-sm hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                        {field.type}
                    </span>
                    <div className="text-gray-300">⠿</div>
                </div>
                <label className="block text-sm font-semibold text-gray-700">{field.label}</label>
                <div className="mt-2 h-8 bg-gray-50 border border-dashed border-gray-200 rounded shrink-0"></div>
            </div>
        </div>
    );
}

// --- 主組件邏輯 ---
function BuilderContent() {
    const searchParams = useSearchParams();
    const recordTypeId = searchParams.get("recordTypeId");
    const [fields, setFields] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (!recordTypeId) return;
        async function loadFields() {
            const res = await fetch(`/api/fields?recordTypeId=${recordTypeId}`);
            const data = await res.json();
            // 確保資料按 order 排序
            setFields(data.sort((a, b) => a.order - b.order));
        }
        loadFields();
    }, [recordTypeId]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((i) => i._id === active.id);
                const newIndex = items.findIndex((i) => i._id === over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);

                // 可以在這裡呼叫 API 儲存 newArray 的順序
                console.log("New Order:", newArray.map((f, index) => ({ id: f._id, order: index })));
                return newArray;
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">表單佈局選單</h1>
                    <p className="text-gray-500 text-sm">拖拽欄位以調整在三欄位網格中的順序</p>
                </header>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="bg-gray-200/50 p-6 rounded-3xl min-h-[400px]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <SortableContext items={fields.map(f => f._id)} strategy={rectSortingStrategy}>
                                {fields.map((field) => (
                                    <SortableField key={field._id} field={field} />
                                ))}
                            </SortableContext>
                        </div>
                    </div>
                </DndContext>

                <div className="mt-6 flex justify-end">
                    <button className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">
                        儲存佈局
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FormBuilderPage() {
    return (
        <Suspense fallback={<div>Loading Builder...</div>}>
            <BuilderContent />
        </Suspense>
    );
}