import { NextResponse } from "next/server";
import { getRegistryComponent } from "@/lib/registry";

function toPascalCase(str: string) {
  return str
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const component = await getRegistryComponent(id);

    if (!component || !component.reactCode) {
      return NextResponse.json(
        { error: `Component '${id}' not found in registry.` },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const componentPascal = toPascalCase(component.id);

    const payload = {
      name: component.id,
      title: component.title,
      description: component.description,
      category: component.category,
      categoryLabel: component.categoryLabel,
      author: component.author,
      authorHandle: component.authorHandle,
      authorAvatar: component.authorAvatar,
      views: component.views,
      dependencies: component.dependencies,
      files: [
        {
          name: `${componentPascal}.tsx`,
          content: component.typescriptCode || component.reactCode,
          target: `components/xui/${componentPascal}.tsx`,
        },
        {
          name: `${componentPascal}.jsx`,
          content: component.javascriptCode || component.reactCode,
          target: `components/xui/${componentPascal}.jsx`,
        },
      ],
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error fetching component" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
