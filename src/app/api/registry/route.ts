import { NextResponse } from "next/server";
import { getRegistryCatalog } from "@/lib/registry";

export async function GET() {
  try {
    const registry = await getRegistryCatalog();

    return NextResponse.json(registry, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load components registry" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
