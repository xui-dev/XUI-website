export type ComponentCategory =
  | "all"
  | "checkboxes"
  | "toggle-switches"
  | "cards"
  | "loaders"
  | "inputs"
  | "forms"
  | "patterns"
  | "button"
  | "buttons"
  | "navbar"
  | "background"
  | "3d-web-templates";

export interface ComponentItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ComponentCategory;
  categoryLabel: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  views: string;
  dependencies: string[];
  reactCode: string;
  typescriptCode?: string;
  javascriptCode?: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  vueCode?: string;
  svelteCode?: string;
}

export const CATEGORIES = [
  { id: "all", label: "Overview" },
  { id: "3d-web-templates", label: "3D web templates" },
  { id: "checkboxes", label: "Checkboxes" },
  { id: "toggle-switches", label: "Toggle switches" },
  { id: "cards", label: "Cards" },
  { id: "loaders", label: "Loaders" },
  { id: "inputs", label: "Inputs" },
  { id: "forms", label: "Forms" },
  { id: "patterns", label: "Patterns" },
  { id: "button", label: "Button" },
  { id: "navbar", label: "Navbar" },
  { id: "background", label: "Backgrounds" },
] as const;

/**
 * Note: Component items are now loaded dynamically from the Cloud Component Registry
 * (@/lib/registry) rather than hardcoded in the source code.
 */
export const COMPONENTS_DATA: ComponentItem[] = [];
