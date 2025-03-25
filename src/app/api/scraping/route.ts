import { scraping } from "@/lib/scraping";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const res = await scraping(url);

    return new Response(JSON.stringify({ result: "success", data: res }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/scrape error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid JSON or request failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
