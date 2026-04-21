"use client"

import { useState } from "react"
import DynamicForm from "@/components/DynamicForm"
import RecordsTable from "@/components/RecordsTable"

export default function Page() {
    const recordTypeId = "69e3650ea24960288a672039"

    const [refreshKey, setRefreshKey] = useState(0)
    const [selectedRecord, setSelectedRecord] = useState(null)

    function handleSuccess() {
        setRefreshKey((prev) => prev + 1)
        setSelectedRecord(null) // 🔥 清 edit mode
    }

    return (
        <div>
            <h1>Record System</h1>

            <DynamicForm
                recordTypeId={recordTypeId}
                onSuccess={handleSuccess}
                selectedRecord={selectedRecord} // 🔥 新增
            />

            <hr />

            <RecordsTable
                recordTypeId={recordTypeId}
                refreshKey={refreshKey}
                onRowClick={setSelectedRecord} // 🔥 點 row
            />
        </div>
    )
}