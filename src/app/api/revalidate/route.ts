import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const componentId = searchParams.get("id");

    const expectedSecret = process.env.ADMIN_SECRET_KEY;

    // Validate secret token (fail-closed if secret is unset or mismatched)
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid or missing revalidation secret" }, { status: 401 });
    }

    // Invalidate master registry immediately
    revalidateTag("components-registry", { expire: 0 });
    revalidatePath("/components");
    revalidatePath("/api/registry");

    // Invalidate specific component if provided immediately
    if (componentId) {
      const cleanId = componentId.trim().toLowerCase();
      revalidateTag(`component-${cleanId}`, { expire: 0 });
      revalidatePath(`/components/${cleanId}`);
      revalidatePath(`/api/registry/${cleanId}`);
    }

    return NextResponse.json({
      revalidated: true,
      componentId: componentId || "all",
      now: Date.now(),
      message: "Cache invalidated successfully on demand.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to revalidate cache" },
      { status: 500 }
    );
  }
}
