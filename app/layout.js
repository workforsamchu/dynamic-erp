import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="flex">
                    <Sidebar />

                    <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
