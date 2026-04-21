"use client"

import { useEffect, useState } from "react"

export default function DynamicForm({
    recordTypeId,
    onSuccess,
    selectedRecord,
}) {
    const [fields, setFields] = useState([])
    const [formData, setFormData] = useState({})
    const [errors, setErrors] = useState({})

    // 1️⃣ load schema
    useEffect(() => {
        async function loadFields() {
            const res = await fetch(
                `/api/fields?recordTypeId=${recordTypeId}`
            )
            const data = await res.json()
            setFields(data)
        }

        loadFields()
    }, [recordTypeId,])

    useEffect(() => {
        if (selectedRecord) {
            setFormData(selectedRecord.data || {})
        } else {
            setFormData({})
        }
    }, [selectedRecord])

    // 2️⃣ handle input change
    function handleChange(key, value) {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    // 3️⃣ submit
    async function handleSubmit(e) {
        e.preventDefault()

        const isEdit = selectedRecord && selectedRecord._id

        const res = await fetch("/api/records", {
            method: isEdit ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                recordTypeId,
                data: formData,
                id: selectedRecord?._id, // edit 用
            }),
        })

        const result = await res.json()

        if (!res.ok) {
            setErrors(result.details || {})
            return
        }

        setFormData({})
        setErrors({})

        if (onSuccess) { onSuccess() }
        alert(isEdit ? "updated" : "created")
    }

    return (
        <form onSubmit={handleSubmit}>
            {fields.map((field) => (
                <div key={field._id} style={{ marginBottom: 12 }}>
                    <label>{field.label}</label>

                    {field.type === "string" && (
                        <input
                            type="text"
                            value={formData[field.key] || ""}
                            onChange={(e) =>
                                handleChange(field.key, e.target.value)
                            }
                        />
                    )}

                    {field.type === "number" && (
                        <input
                            type="number"
                            value={formData[field.key] || ""}
                            onChange={(e) =>
                                handleChange(field.key, e.target.value)
                            }
                        />
                    )}

                    {field.type === "boolean" && (
                        <input
                            type="checkbox"
                            checked={formData[field.key] || false}
                            onChange={(e) =>
                                handleChange(field.key, e.target.checked)
                            }
                        />
                    )}

                    {/* ERROR MESSAGE  */}
                    {errors[field.key] && (
                        <p style={{ color: "red" }}>
                            {errors[field.key]}
                        </p>
                    )}
                </div>
            ))}

            <button type="submit">Save</button>
        </form>
    )
}