import { NextResponse } from "next/server";

const DATA_URL =
  "https://script.google.com/macros/s/AKfycbwiBQ1o0WZd0Wtvd_GJShsW1d7V7R31VLY3964KBQIV9f5tYT5JHZ3hk1SiMWTqk7pp/exec";

export async function GET() {
  try {
    const res = await fetch(DATA_URL, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FanFunds/1.0)" },
      next: { revalidate: 300 },
    });

    const text = await res.text();

    // If the response is JSON, convert it to CSV
    let csv: string;
    const trimmed = text.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      const records = JSON.parse(trimmed);
      const rows = Array.isArray(records) ? records : [records];
      if (rows.length === 0) return new NextResponse("No data", { status: 502 });
      const headers = Object.keys(rows[0]);
      const header = headers.join(",");
      const body = rows.map((r: Record<string, unknown>) =>
        headers.map((h) => {
          const val = String(r[h] ?? "").replace(/"/g, '""');
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val}"`
            : val;
        }).join(",")
      ).join("\n");
      csv = `${header}\n${body}`;
    } else if (trimmed.startsWith("id,") || trimmed.startsWith('"id"')) {
      csv = text;
    } else {
      console.error("[/api/athletes] Unexpected response:", text.slice(0, 300));
      return new NextResponse("Upstream data unavailable", { status: 502 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[/api/athletes] Fetch error:", err);
    return new NextResponse("Failed to fetch data", { status: 500 });
  }
}
