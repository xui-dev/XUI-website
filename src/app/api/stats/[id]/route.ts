import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    if (!supabase) {
      // Fallback default
      return NextResponse.json({ id, views: 0, shares: 0 });
    }

    const { data, error } = await supabase
      .from("components_stats")
      .select("views, shares")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ id, views: 0, shares: 0 });
    }

    return NextResponse.json({
      id,
      views: data.views,
      shares: data.shares ?? 0,
    });
  } catch {
    return NextResponse.json({ id, views: 0, shares: 0 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action"); // "view" | "share"

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable" },
        { status: 503 }
      );
    }

    if (action === "view") {
      const { data, error } = await supabase.rpc("increment_component_views", {
        component_id: id,
      });
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, views: data });
    }

    if (action === "share") {
      const { data, error } = await supabase.rpc("increment_component_shares", {
        component_id: id,
      });
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, shares: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
