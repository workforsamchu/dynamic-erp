"use client";

import { useState } from "react";

export default function CreateRecordTypePage() {
    const [name, setName] = useState("");
    const [key, setKey] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/record-types", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key,
                name,
                description,
            }),
        });

        if (res.ok) {
            alert("Record Type created!");
            setName("");
            setDescription("");
        } else {
            alert("Failed to create record type");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Create Record Type</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Key</label>
                    <input
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="e.g. customer"
                    />
                </div>
                <div>
                    <label>Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. 客戶"
                    />
                </div>

                <div>
                    <label>Description</label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="optional"
                    />
                </div>

                <button type="submit">Create</button>
            </form>
        </div>
    );
}