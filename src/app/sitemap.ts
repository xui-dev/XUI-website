import { MetadataRoute } from "next";
import { getRegistryCatalog } from "@/lib/registry";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://xui.dev";

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/components`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/saved`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic component pages from registry
  let componentRoutes: MetadataRoute.Sitemap = [];
  try {
    const catalog = await getRegistryCatalog();
    if (catalog?.items) {
      componentRoutes = catalog.items.map((item) => ({
        url: `${baseUrl}/components/${item.name}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.85,
      }));
    }
  } catch (error) {
    console.error("Error generating component sitemap items:", error);
  }

  return [...staticRoutes, ...componentRoutes];
}
