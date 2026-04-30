export default async function fetcher(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
}