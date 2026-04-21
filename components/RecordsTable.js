"use client"

import { useEffect, useState } from "react"

export default function RecordsTable
    ({
        recordTypeId,
        refreshKey,
        onRowClick,
    }) {
    const [fields, setFields] = useState([])
    const [records, setRecords] = useState([])

    useEffect(() => {
        async function load() {
            // 1️⃣ load fields
            const fRes = await fetch(
                `/api/fields?recordTypeId=${recordTypeId}`
            )
            const fData = await fRes.json()
            setFields(fData)

            // 2️⃣ load records
            const rRes = await fetch(
                `/api/records?recordTypeId=${recordTypeId}`
            )
            const rData = await rRes.json()
            setRecords(rData)
        }

        load()
    }, [recordTypeId, refreshKey])

    return (
        <table border="1" cellPadding="8">
            <thead>
                <tr>
                    {fields.map((field) => (
                        <th key={field._id}>{field.label}</th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {records.map((record) => (
                    <tr
                        key={record._id}
                        onClick={() => onRowClick && onRowClick(record)}
                        style={{ cursor: "pointer" }}
                    >
                        {fields.map((field) => (
                            <td key={field._id}>
                                {renderValue(
                                    record.data?.[field.key],
                                    field.type
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function renderValue(value, type) {
    if (type === "boolean") return value ? "✅" : "❌"
    if (type === "number") return value ?? "-"
    return value || "-"
}