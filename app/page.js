"use client"

import { useState } from "react"
import DynamicForm from "@/components/DynamicForm"
import RecordsTable from "@/components/RecordsTable"
import Link from "next/link"


export default function Page() {
    const recordTypeId = "69e3650ea24960288a672039"

    const [refreshKey, setRefreshKey] = useState(0)
    const [selectedRecord, setSelectedRecord] = useState(null)

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

            <DynamicForm
                recordTypeId={recordTypeId}
                onSuccess={handleSuccess}
                selectedRecord={selectedRecord}
            />

            <hr />

            <RecordsTable
                recordTypeId={recordTypeId}
                refreshKey={refreshKey}
                onRowClick={setSelectedRecord}
            />
        </div>
    )
}