import { promises as fs } from "fs";
import path from "path";
import type { ComponentItem, ComponentCategory } from "@/data/componentsData";
import { createClient } from "@/lib/supabase/public";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/xui-dev/XUI-components-/main";

export interface RegistryItemMeta {
  name: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  category?: string;
  categoryLabel?: string;
  categoryLabelAr?: string;
  author?: string;
  authorHandle?: string;
  authorAvatar?: string;
  dependencies?: string[];
  files?: Array<{
    name: string;
    path: string;
    target?: string;
    content?: string;
  }>;
}

export interface RegistryCatalog {
  $schema?: string;
  name?: string;
  homepage?: string;
  repository?: string;
  version?: string;
  items: RegistryItemMeta[];
}

/**
 * Fetch the master registry catalog from local files or GitHub Raw.
 */
export async function getRegistryCatalog(): Promise<RegistryCatalog> {
  const localRegistryPath = path.join(process.cwd(), "registry", "registry.json");

  // 1. Try local mirror first
  try {
    const data = await fs.readFile(localRegistryPath, "utf-8");
    return JSON.parse(data) as RegistryCatalog;
  } catch {
    // 2. Fallback to GitHub Raw
    try {
      const res = await fetch(`${GITHUB_RAW_BASE}/registry.json`, {
        cache: "force-cache",
        next: { tags: ["components-registry"] },
      });
      if (res.ok) {
        return (await res.json()) as RegistryCatalog;
      }
    } catch (err) {
      console.error("Failed to fetch remote registry catalog:", err);
    }
  }

  return { items: [] };
}

export function stripTypeScript(code: string): string {
  if (!code) return "";
  return code
    // Remove interface and type declarations
    .replace(/(?:export\s+)?(?:interface|type)\s+[A-Za-z0-9_]+(?:\s*<[^>]+>)?(?:\s*=\s*|\s*)\{[\s\S]*?\}\s*;?/g, "")
    // Remove useState<Type>(...) generics
    .replace(/(use[A-Za-z0-9_]+)\s*<[^>]+>\s*\(/g, "$1(")
    // Remove type annotations in return or parameters
    .replace(/\)\s*:\s*[A-Za-z0-9_<>[\]|&\s]+(?=\s*\{|\s*=>)/g, ")")
    .replace(/(\(\s*(?:props|\{[^}]*\})\s*)\s*:\s*[A-Za-z0-9_<>[\]|&\s]+(?=\s*\))/g, "$1")
    // Remove type casts: e.g. as string, as const
    .replace(/\s+as\s+[A-Za-z0-9_<>[\]|&]+/g, "")
    // Clean up empty lines
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Resolve a single component by its ID/slug.
 * Reads React code from index.tsx and index.jsx, and metadata from meta.json,
 * then merges dynamic views from Supabase if available.
 */
export async function getRegistryComponent(id: string): Promise<ComponentItem | null> {
  if (!id) return null;
  const cleanId = id.trim().toLowerCase();

  let meta: RegistryItemMeta | null = null;
  let code = "";
  let jsCode = "";

  const localDir = path.join(process.cwd(), "registry", "components", cleanId);
  const localMetaPath = path.join(localDir, "meta.json");
  const localIndexPath = path.join(localDir, "index.tsx");
  const localJsxPath = path.join(localDir, "index.jsx");

  // 1. Try reading from local files
  try {
    const metaData = await fs.readFile(localMetaPath, "utf-8");
    meta = JSON.parse(metaData);
    code = await fs.readFile(localIndexPath, "utf-8");
    try {
      jsCode = await fs.readFile(localJsxPath, "utf-8");
    } catch {
      jsCode = stripTypeScript(code);
    }
  } catch {
    // 2. Fallback to GitHub Raw if not found locally (Cached permanently until revalidated on publish)
    try {
      const metaRes = await fetch(
        `${GITHUB_RAW_BASE}/components/${cleanId}/meta.json`,
        {
          cache: "force-cache",
          next: { tags: ["components-registry", `component-${cleanId}`] },
        }
      );
      if (metaRes.ok) {
        meta = await metaRes.json();
      }

      const codeRes = await fetch(
        `${GITHUB_RAW_BASE}/components/${cleanId}/index.tsx`,
        {
          cache: "force-cache",
          next: { tags: ["components-registry", `component-${cleanId}`] },
        }
      );
      if (codeRes.ok) {
        code = await codeRes.text();
      }

      const jsxRes = await fetch(
        `${GITHUB_RAW_BASE}/components/${cleanId}/index.jsx`,
        {
          cache: "force-cache",
          next: { tags: ["components-registry", `component-${cleanId}`] },
        }
      );
      if (jsxRes.ok) {
        jsCode = await jsxRes.text();
      } else {
        jsCode = stripTypeScript(code);
      }
    } catch (err) {
      console.error(`Failed to fetch component '${cleanId}' from GitHub Raw:`, err);
    }
  }

  // 3. Fallback to catalog entry if meta.json didn't exist directly
  if (!meta) {
    const catalog = await getRegistryCatalog();
    meta = catalog.items.find((item) => item.name === cleanId) || null;
  }

  if (!meta && !code && !jsCode) {
    return null;
  }

  if (!jsCode && code) {
    jsCode = stripTypeScript(code);
  }

  // Fetch dynamic stats from Supabase if available
  let views = "0";

  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: stats } = await supabase
        .from("components_stats")
        .select("views")
        .eq("id", cleanId)
        .single();

      if (stats) {
        views = stats.views >= 1000 ? `${(stats.views / 1000).toFixed(1)}k` : `${stats.views}`;
      }
    }
  } catch {
    // Non-blocking fallback
  }

  let rawCategory = (meta?.category || "patterns") as ComponentCategory;
  if ((rawCategory as string) === "footer") {
    rawCategory = "button";
  }
  const category = rawCategory;

  let rawCategoryLabel = meta?.categoryLabel || "Patterns";
  if (rawCategoryLabel.toLowerCase() === "footer") {
    rawCategoryLabel = "Button";
  }
  const categoryLabel = rawCategoryLabel;

  return {
    id: cleanId,
    slug: cleanId,
    title: meta?.title || cleanId,
    description:
      meta?.description ||
      "Kinetic interactive UI component crafted with React & TypeScript.",
    category,
    categoryLabel,
    author: meta?.author || "XUI",
    authorHandle: meta?.authorHandle || "@xui_dev",
    authorAvatar: meta?.authorAvatar || "/XUI.png",
    views,
    dependencies: meta?.dependencies || ["lucide-react"],
    reactCode: code || jsCode || "",
    typescriptCode: code || "",
    javascriptCode: jsCode || "",
    htmlCode: "",
    cssCode: "",
    jsCode: "",
    vueCode: "",
    svelteCode: "",
  };
}

/**
 * Fetch all registered components with their full codes and metadata.
 */
export async function getAllComponents(): Promise<ComponentItem[]> {
  const catalog = await getRegistryCatalog();
  const items = catalog.items || [];

  const promises = items.map((item) => getRegistryComponent(item.name));
  const resolved = await Promise.all(promises);

  return resolved.filter((comp): comp is ComponentItem => comp !== null);
}
