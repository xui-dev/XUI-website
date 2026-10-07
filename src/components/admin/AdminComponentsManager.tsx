"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CATEGORIES } from "@/data/componentsData";
import ComponentLivePreview from "@/components/components-page/ComponentLivePreview";
import {
  Plus,
  Trash2,
  Terminal,
  Check,
  Search,
  AlertTriangle,
  Loader2,
  Sparkles,
  X,
  ArrowUpRight,
  ArrowLeft,
  Upload,
  ExternalLink,
  FileCode2,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegistryItem {
  name: string;
  title: string;
  description?: string;
  category?: string;
  categoryLabel?: string;
  dependencies?: string[];
}

interface ParsedFile {
  id: string;
  name: string;
  code: string;
  // editable metadata
  title: string;
  slug: string;
  description: string;
  category: string;
  dependencies: string; // comma-separated
  // status
  status: "pending" | "publishing" | "done" | "error";
  errorMsg?: string;
}

interface AdminComponentsManagerProps {
  items: RegistryItem[];
  loading: boolean;
  fetchRegistryItems: () => Promise<void>;
  onBackToOverview: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractDeps = (sourceCode: string): string[] => {
  const importRegex =
    /(?:import\s+(?:[\w\s{},*]+from\s+)?['"]|export\s+(?:[\w\s{},*]+from\s+)?['"])([^'"]+)['"]/g;
  const deps = new Set<string>();
  let m;
  while ((m = importRegex.exec(sourceCode)) !== null) {
    const spec = m[1].trim();
    if (
      !spec.startsWith(".") &&
      !spec.startsWith("/") &&
      !spec.startsWith("@/") &&
      !spec.startsWith("http:") &&
      !spec.startsWith("https:") &&
      spec !== "react" &&
      !spec.startsWith("react/") &&
      spec !== "react-dom" &&
      !spec.startsWith("react-dom/")
    ) {
      const pkg = spec.startsWith("@")
        ? spec.split("/").slice(0, 2).join("/")
        : spec.split("/")[0];
      if (pkg) deps.add(pkg);
    }
  }
  return Array.from(deps);
};

const fileNameToTitle = (name: string) =>
  name
    .replace(/\.(tsx|jsx|ts|js)$/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminComponentsManager({
  items,
  loading,
  fetchRegistryItems,
  onBackToOverview,
}: AdminComponentsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // ── Choice Modal ──
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload Queue Modal ──
  const [uploadQueue, setUploadQueue] = useState<ParsedFile[]>([]);
  const [uploadIndex, setUploadIndex] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // ── Delete Modal ──
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── CLI copy feedback ──
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── File upload: read files & build queue ──
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const parsed: ParsedFile[] = await Promise.all(
      files.map(
        (file) =>
          new Promise<ParsedFile>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const code = (ev.target?.result as string) ?? "";
              const title = fileNameToTitle(file.name);
              const deps = extractDeps(code);
              resolve({
                id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: file.name,
                code,
                title,
                slug: toSlug(title),
                description: "",
                category: "cards",
                dependencies: deps.join(", "),
                status: "pending",
              });
            };
            reader.readAsText(file);
          })
      )
    );

    setUploadQueue(parsed);
    setUploadIndex(0);
    setIsChoiceModalOpen(false);
    setIsUploadModalOpen(true);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Upload: update a field in the current queue item ──
  const updateCurrentFile = (field: keyof ParsedFile, value: string) => {
    setUploadQueue((prev) =>
      prev.map((f, i) => (i === uploadIndex ? { ...f, [field]: value } : f))
    );
  };

  // ── Upload: update title & auto-slug ──
  const handleUploadTitleChange = (val: string) => {
    setUploadQueue((prev) =>
      prev.map((f, i) =>
        i === uploadIndex ? { ...f, title: val, slug: toSlug(val) } : f
      )
    );
  };

  // ── Upload: publish current file ──
  const handlePublishCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = uploadQueue[uploadIndex];
    if (!current) return;

    // Mark as publishing
    setUploadQueue((prev) =>
      prev.map((f, i) => (i === uploadIndex ? { ...f, status: "publishing" } : f))
    );

    try {
      const selectedCat = CATEGORIES.find((c) => c.id === current.category);
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: current.slug,
          title: current.title,
          description: current.description,
          category: current.category,
          categoryLabel: selectedCat?.label || current.category,
          dependencies: current.dependencies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          code: current.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish.");

      // Mark as done
      setUploadQueue((prev) =>
        prev.map((f, i) => (i === uploadIndex ? { ...f, status: "done" } : f))
      );
      await fetchRegistryItems();

      // Advance to next or close
      setTimeout(() => {
        const nextIndex = uploadIndex + 1;
        if (nextIndex < uploadQueue.length) {
          setUploadIndex(nextIndex);
        } else {
          setIsUploadModalOpen(false);
          setUploadQueue([]);
          setUploadIndex(0);
        }
      }, 900);
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((f, i) =>
          i === uploadIndex
            ? { ...f, status: "error", errorMsg: err.message || "Failed to publish" }
            : f
        )
      );
    }
  };

  // ── Open Code Editor in new tab ──
  const handleOpenEditor = () => {
    setIsChoiceModalOpen(false);
    window.open("/admin/editor", "_blank");
  };

  // ── Delete ──
  const handleDelete = async (componentId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: componentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete component.");

      if (data.partial || !data.githubSynced || data.success === false) {
        alert(
          `Warning: ${
            data.message ||
            data.githubStatus ||
            "Component deleted locally, but remote GitHub removal failed."
          }`
        );
      }
      await fetchRegistryItems();
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Could not delete component.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Copy CLI ──
  const handleCopyCli = (componentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`npx xui add ${componentId}`);
    setCopiedId(componentId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Filter ──
  const selectedCategory = CATEGORIES[activeCategoryIndex] || CATEGORIES[0];
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory.id === "all" || item.category === selectedCategory.id;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const currentFile = uploadQueue[uploadIndex];
  const isLastFile = uploadIndex === uploadQueue.length - 1;
  const isPublishing = currentFile?.status === "publishing";
  const isDone = currentFile?.status === "done";

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".tsx,.jsx,.ts,.js"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex flex-col items-start gap-2.5">
          <button
            type="button"
            onClick={onBackToOverview}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white border border-white/[0.08] transition-all cursor-pointer group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Overview</span>
          </button>

          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Registry Active
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/[0.08] text-neutral-300">
              {items.length} Components
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Component Registry Manager
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl">
            Inspect, add, and delete components directly in your local registry and synced GitHub cloud repository.
          </p>
        </div>

        {/* Add Component → opens choice modal */}
        <button
          type="button"
          onClick={() => setIsChoiceModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-[0_0_24px_rgba(37,99,235,0.45)] cursor-pointer active:scale-95 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Component</span>
        </button>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registry..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#0e101c]/80 backdrop-blur-xl border border-white/[0.12] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap lg:flex-col gap-1.5">
            {CATEGORIES.map((cat, idx) => {
              const isSelected = activeCategoryIndex === idx;
              const count =
                cat.id === "all"
                  ? items.length
                  : items.filter((c) => c.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md border border-blue-400/40"
                      : "bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-white/25 text-white font-bold"
                        : "bg-white/[0.06] text-neutral-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Registry Grid */}
        <section className="flex-1 w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{selectedCategory.label}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/[0.08] text-neutral-300">
                {filteredItems.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredItems.map((comp) => (
                <div
                  key={comp.name}
                  className="group relative flex flex-col rounded-3xl bg-[#0d0f1a]/85 backdrop-blur-2xl border border-white/[0.12] overflow-hidden transition-all duration-300 hover:border-blue-500/50 shadow-xl"
                >
                  <div className="relative h-64 sm:h-72 lg:h-80 w-full flex items-center justify-center bg-black/40 overflow-hidden border-b border-white/[0.08]">
                    <ComponentLivePreview id={comp.name} interactive={false} />
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                          {comp.categoryLabel || comp.category || "Component"}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">{comp.name}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                        {comp.title}
                      </h3>
                      {comp.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{comp.description}</p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleCopyCli(comp.name, e)}
                        title="Copy CLI install command"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        {copiedId === comp.name ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span className="text-[10px]">
                          {copiedId === comp.name ? "Copied" : "xui add"}
                        </span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/components/${comp.name}`}
                          target="_blank"
                          title="View component detail page"
                          className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition-all"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingId(comp.name)}
                          title="Delete component"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl bg-[#0c0e1a]/40 border border-white/[0.08] text-center">
              <p className="text-neutral-400 text-sm font-medium mb-2">
                No components found in registry.
              </p>
              <button
                type="button"
                onClick={() => setIsChoiceModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer"
              >
                Create First Component
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ── MODAL 1: Choice Modal ──
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isChoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsChoiceModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative z-10 w-full max-w-lg my-auto rounded-3xl bg-[#0d0f1a] border border-white/[0.14] p-6 shadow-2xl flex flex-col gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Add New Component</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Choose how you'd like to add a component.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChoiceModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Two Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Card 1: Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl bg-[#0a0c16] hover:bg-[#0e1020] border border-white/[0.1] hover:border-blue-500/40 transition-all duration-200 cursor-pointer text-left overflow-hidden"
                >
                  <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform relative z-10">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      Upload File
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      Upload .tsx / .jsx files and fill in metadata.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-blue-400 relative z-10">
                    <span>Browse files</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>

                {/* Card 2: Code Editor */}
                <button
                  type="button"
                  onClick={handleOpenEditor}
                  className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl bg-[#0a0c16] hover:bg-[#0e1020] border border-white/[0.1] hover:border-indigo-500/40 transition-all duration-200 cursor-pointer text-left overflow-hidden"
                >
                  <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all duration-500" />
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform relative z-10">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Open Code Editor
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      Write code in a full-screen 3-panel editor.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 relative z-10">
                    <span>Opens new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          ── MODAL 2: Upload Metadata Modal ──
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isUploadModalOpen && currentFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isPublishing && !isDone && setIsUploadModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative z-10 w-full max-w-xl my-auto rounded-3xl bg-[#0d0f1a] border border-white/[0.14] p-6 sm:p-7 shadow-2xl flex flex-col gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Upload Component</h2>
                    <p className="text-[11px] text-neutral-400">
                      <span className="font-mono text-blue-400">{currentFile.name}</span>
                      {uploadQueue.length > 1 && (
                        <span className="ml-2 text-neutral-500">
                          {uploadIndex + 1} / {uploadQueue.length}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!isPublishing && !isDone && (
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress bar for multiple files */}
              {uploadQueue.length > 1 && (
                <div className="flex gap-1.5">
                  {uploadQueue.map((f, i) => (
                    <div
                      key={f.id}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        f.status === "done"
                          ? "bg-emerald-500"
                          : i === uploadIndex
                          ? "bg-blue-500"
                          : "bg-white/[0.08]"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Success State */}
              {isDone ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    "{currentFile.title}" published!
                  </p>
                  {!isLastFile && (
                    <p className="text-xs text-neutral-400">Loading next file...</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Error */}
                  {currentFile.status === "error" && currentFile.errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{currentFile.errorMsg}</span>
                    </div>
                  )}

                  {/* Metadata Form */}
                  <form onSubmit={handlePublishCurrent} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Title *</label>
                        <input
                          required
                          type="text"
                          value={currentFile.title}
                          onChange={(e) => handleUploadTitleChange(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-300">ID / Slug *</label>
                        <input
                          required
                          type="text"
                          value={currentFile.slug}
                          onChange={(e) => updateCurrentFile("slug", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Category *</label>
                        <select
                          value={currentFile.category}
                          onChange={(e) => updateCurrentFile("category", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-[#0e101c]">
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-300">Dependencies</label>
                        <input
                          type="text"
                          value={currentFile.dependencies}
                          onChange={(e) => updateCurrentFile("dependencies", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                          placeholder="lucide-react, motion"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Description</label>
                      <input
                        type="text"
                        value={currentFile.description}
                        onChange={(e) => updateCurrentFile("description", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                        placeholder="Short component description..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1">
                      {!isPublishing && (
                        <button
                          type="button"
                          onClick={() => setIsUploadModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isPublishing}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-xs transition-all shadow-lg cursor-pointer active:scale-95"
                      >
                        {isPublishing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              {isLastFile ? "Publish" : `Publish & Next (${uploadQueue.length - uploadIndex - 1} more)`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          ── MODAL 3: Delete Confirmation ──
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDeletingId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative z-10 w-full max-w-md my-auto rounded-3xl bg-[#0d0f1a] border border-red-500/30 p-6 shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Component?</h3>
                  <p className="text-xs text-neutral-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <code className="text-red-400 font-mono font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                  {deletingId}
                </code>{" "}
                from the registry and GitHub repository?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deletingId)}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
