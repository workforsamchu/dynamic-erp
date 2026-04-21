"use client"

import { useState, useEffect } from "react"
import DynamicForm from "@/components/DynamicForm"
import RecordsTable from "@/components/RecordsTable"
import Link from "next/link"



export default function Page() {
    let recordTypeId = "69e3650ea24960288a672039"

    const [recordTypes, setRecordTypes] = useState([])
    const [refreshKey, setRefreshKey] = useState(0)
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [selectedType, setSelectedType] = useState("")

    useEffect(() => {
        async function loadRecordTypes() {
            const res = await fetch("/api/record-types");
            const data = await res.json();
            console.log('data', data);
            setRecordTypes(data);
        }

        loadRecordTypes();
    }, []);

    function handleSuccess() {
        setRefreshKey((prev) => prev + 1)
        setSelectedRecord(null)
    }

    return (
        <div className="p-5">
            <div className="flex gap-2">
                <h1 className="underline">
                    Record System</h1>
                <h1 className="underline">

                    <Link href="/fields/new">
                        Create Fields
                    </Link>
                </h1>
                <h1 className="underline">
                    <Link href="/record-types/new">
                        Create Record Type
                    </Link>
                </h1>
            </div>

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

            <DynamicForm
                recordTypeId={selectedType ? selectedType : recordTypeId}
                onSuccess={handleSuccess}
                selectedRecord={selectedRecord}
            />

            <hr />

            <RecordsTable
                recordTypeId={selectedType ? selectedType : recordTypeId}
                refreshKey={refreshKey}
                onRowClick={setSelectedRecord}
            />
        </div>
    )
}