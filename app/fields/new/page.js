"use client";

import { useEffect, useState } from "react";

export default function CreateFieldPage() {
    const [recordTypes, setRecordTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("");

    const [fieldLabel, setFieldLabel] = useState("");
    const [fieldKey, setFieldKey] = useState("");
    const [fieldType, setFieldType] = useState("");

    useEffect(() => {
        async function loadRecordTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            console.log('data', data);
            setRecordTypes(data);
        }

        loadRecordTypes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/fields", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                recordTypeId: selectedType,
                key: fieldKey,
                label: fieldLabel,
                type: fieldType,
            }),
        });

        if (res.ok) {
            alert("Field created!");
            setFieldLabel("");
        } else {
            alert("Failed to create field");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Create Field</h1>

            <form onSubmit={handleSubmit}>
                {/* Record Type */}
                <div>
                    <label>Record Type</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="">-- select --</option>
                        {recordTypes.map((rt) => (
                            <option key={rt._id} value={rt._id}>
                                {rt.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Field Key */}
                <div>
                    <label>Field Key</label>
                    <input
                        value={fieldKey}
                        onChange={(e) => setFieldKey(e.target.value)}
                        placeholder="e.g. email"
                    />
                </div>
                {/* Field Name */}
                <div>
                    <label>Field Name</label>
                    <input
                        value={fieldLabel}
                        onChange={(e) => setFieldLabel(e.target.value)}
                        placeholder="e.g. Email"
                    />
                </div>

                {/* Field Type */}
                <div>
                    <label>Field Type</label>
                    <select
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value)}
                    >
                        <option value="string">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                    </select>
                </div>

                <button type="submit">Create Field</button>
            </form>
        </div>
    );
}