"use client"

import { useEffect, useState } from "react"

export default function DynamicForm({ recordTypeId, onSubmit }) {
    const [fields, setFields] = useState([])
    const [formData, setFormData] = useState({})

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
    }, [recordTypeId])

    // 2️⃣ handle input change
    function handleChange(key, value) {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    // 3️⃣ submit
    function handleSubmit(e) {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            {fields.map((field) => (
                <div key={field._id} style={{ marginBottom: 12 }}>
                    <label>{field.label}</label>

                    {field.type === "string" && (
                        <input
                            type="text"
                            onChange={(e) =>
                                handleChange(field.key, e.target.value)
                            }
                        />
                    )}

                    {field.type === "number" && (
                        <input
                            type="number"
                            onChange={(e) =>
                                handleChange(field.key, e.target.value)
                            }
                        />
                    )}

                    {/* BOOLEAN */}
                    {field.type === "boolean" && (
                        <input
                            type="checkbox"
                            onChange={(e) =>
                                handleChange(field.key, e.target.checked)
                            }
                        />
                    )}
                </div>
            ))}

            <button type="submit">Save</button>
        </form>
    )
}