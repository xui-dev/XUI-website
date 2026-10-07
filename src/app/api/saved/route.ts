import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-store",
};

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { authenticated: false, savedIds: [] },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { authenticated: false, savedIds: [] },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const { data, error } = await supabase
      .from("saved_components")
      .select("component_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch saved components:", error);
      return NextResponse.json(
        { authenticated: true, savedIds: [] },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const savedIds = data.map((item) => item.component_id);
    return NextResponse.json(
      { authenticated: true, savedIds },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("Error in GET /api/saved:", err);
    return NextResponse.json(
      { authenticated: false, savedIds: [] },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503, headers: NO_CACHE_HEADERS }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { authenticated: false, error: "Unauthorized" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { action, componentId, componentIds } = body;

    // 1. Bulk Sync action (migrates guest localStorage items into cloud)
    if (action === "sync" && Array.isArray(componentIds)) {
      const validIds = componentIds.filter((id) => typeof id === "string" && id.trim().length > 0);
      if (validIds.length > 0) {
        const rows = validIds.map((id) => ({
          user_id: user.id,
          component_id: id,
        }));

        await supabase
          .from("saved_components")
          .upsert(rows, { onConflict: "user_id,component_id", ignoreDuplicates: true });
      }

      // Return refreshed list of saved IDs
      const { data } = await supabase
        .from("saved_components")
        .select("component_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      return NextResponse.json(
        {
          success: true,
          savedIds: data ? data.map((d) => d.component_id) : [],
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Single item save / unsave
    if (!componentId || typeof componentId !== "string") {
      return NextResponse.json(
        { error: "Missing componentId" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "save") {
      const { error } = await supabase.from("saved_components").upsert(
        { user_id: user.id, component_id: componentId },
        { onConflict: "user_id,component_id" }
      );

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500, headers: NO_CACHE_HEADERS }
        );
      }
      return NextResponse.json(
        { success: true, saved: true, componentId },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "unsave") {
      const { error } = await supabase
        .from("saved_components")
        .delete()
        .eq("user_id", user.id)
        .eq("component_id", componentId);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500, headers: NO_CACHE_HEADERS }
        );
      }
      return NextResponse.json(
        { success: true, saved: false, componentId },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("Error in POST /api/saved:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
