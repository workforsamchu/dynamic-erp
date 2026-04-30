"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import Link from "next/link"

export default function CreateRecordType() {
    const router = useRouter()
    const { mutate } = useSWRConfig()

    const [key, setKey] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/record-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, name, description }),
            })

            if (!res.ok) throw new Error("Failed to create record type")

            // 1. Tell SWR to refresh the dashboard data in the background
            mutate("/api/dashboard")

            // 2. Redirect back to dashboard
            router.push("/")
            // Force a refresh if the router push doesn't trigger the dashboard's useEffect
            router.refresh()

        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="mb-6">
                <Link href="/" className="text-blue-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">Create Record Type</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow border">
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
                        {error}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type Key
                    </label>
                    <input
                        type="text"
                        required
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g., financeReport"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g., Financial Report"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded text-white font-bold transition-colors ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Creating..." : "Create Record Type"}
                </button>
            </form>
        </div>
    )
}