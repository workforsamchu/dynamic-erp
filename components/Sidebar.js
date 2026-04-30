"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Record Types", href: "/record-types" },
    { name: "Fields", href: "/fields" },
    { name: "Records", href: "/records" },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 h-screen bg-gray-900 text-white p-4">
            <h1 className="text-xl font-bold mb-6">Dynamic Field System</h1>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const active = pathname === item.href

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block px-4 py-2 rounded 
                ${active ? "bg-gray-700" : "hover:bg-gray-800"}
              `}
                        >
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}