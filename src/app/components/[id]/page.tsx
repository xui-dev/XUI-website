import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllComponents, getRegistryComponent } from "@/lib/registry";
import ComponentDetailClient from "@/components/components-page/ComponentDetailClient";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const component = await getRegistryComponent(id);

  if (!component) {
    return {
      title: "Component Not Found — XUI",
      description: "The requested component could not be found.",
    };
  }

  const title = `${component.title} — XUI`;
  const description =
    component.description ||
    "Kinetic interactive UI component crafted with React & TypeScript.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://xui.dev/components/${component.id}`,
      siteName: "XUI",
      type: "article",
      images: [
        {
          url: "/XUI.png",
          width: 1080,
          height: 1080,
          alt: component.title,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/XUI.png"],
    },
  };
}

export async function generateStaticParams() {
  const components = await getAllComponents();
  return components.map((comp) => ({
    id: comp.id,
  }));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const component = await getRegistryComponent(id);

  if (!component) {
    notFound();
  }

  return <ComponentDetailClient component={component} />;
}
