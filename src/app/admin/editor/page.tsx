"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ComponentLivePreview from "@/components/components-page/ComponentLivePreview";
import { CATEGORIES } from "@/data/componentsData";
import {
  Plus,
  X,
  Check,
  Loader2,
  Sparkles,
  FileCode2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────

const LS_KEY = "xui_admin_editor_files";

const DEFAULT_CODE = ``;

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditorFile {
  id: string;
  name: string;
  code: string;
  modified: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const genId = () =>
  `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const fileNameToTitle = (name: string) =>
  name
    .replace(/\.(tsx|jsx|ts|js)$/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();

const extractDeps = (code: string): string[] => {
  const importRegex =
    /(?:import\s+(?:[\w\s{},*]+from\s+)?['"]|export\s+(?:[\w\s{},*]+from\s+)?['"])([^'"]+)['"]/g;
  const deps = new Set<string>();
  let m;
  while ((m = importRegex.exec(code)) !== null) {
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

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AdminEditorPage() {
  // ── Localhost gate ──────────────────────────────────────────────────
  const [isLocalhost, setIsLocalhost] = useState<boolean | null>(null);

  // ── Files (localStorage) ─────────────────────────────────────────────
  const [files, setFiles] = useState<EditorFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // ── Live preview debounce ────────────────────────────────────────────
  const [previewCode, setPreviewCode] = useState<string>("");
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Rename ───────────────────────────────────────────────────────────
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Publish modal ─────────────────────────────────────────────────────
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubId, setPubId] = useState("");
  const [pubDescription, setPubDescription] = useState("");
  const [pubCategory, setPubCategory] = useState("cards");
  const [pubDependencies, setPubDependencies] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // ── Init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const h = window.location.hostname;
    setIsLocalhost(h === "localhost" || h === "127.0.0.1" || h === "[::1]");

    // Load from localStorage
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed: EditorFile[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setFiles(parsed);
          setActiveFileId(parsed[0].id);
          setPreviewCode(parsed[0].code);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default file
    const defaultFile: EditorFile = {
      id: genId(),
      name: "NewComponent.tsx",
      code: DEFAULT_CODE,
      modified: false,
    };
    setFiles([defaultFile]);
    setActiveFileId(defaultFile.id);
    setPreviewCode(DEFAULT_CODE);
  }, []);

  // ── Persist to localStorage ──────────────────────────────────────────
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(files));
    }
  }, [files]);

  // ── Derived ──────────────────────────────────────────────────────────
  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  // ── Code change ──────────────────────────────────────────────────────
  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (!activeFileId) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId ? { ...f, code: newCode, modified: true } : f
        )
      );
      if (previewTimer.current) clearTimeout(previewTimer.current);
      previewTimer.current = setTimeout(() => setPreviewCode(newCode), 350);
    },
    [activeFileId]
  );

  // ── Tab & Ctrl+S in textarea ─────────────────────────────────────────
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = ta.value.substring(0, start) + "  " + ta.value.substring(end);
      handleCodeChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      openPublishModal();
    }
  };

  // ── Add file ─────────────────────────────────────────────────────────
  const handleAddFile = () => {
    const newFile: EditorFile = {
      id: genId(),
      name: `NewComponent${files.length + 1}.tsx`,
      code: DEFAULT_CODE,
      modified: false,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setPreviewCode(newFile.code);
  };

  // ── Delete file ──────────────────────────────────────────────────────
  const handleDeleteFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const updated = prev.filter((f) => f.id !== id);
        if (updated.length === 0) {
          const newFile: EditorFile = {
            id: genId(),
            name: "NewComponent.tsx",
            code: DEFAULT_CODE,
            modified: false,
          };
          setActiveFileId(newFile.id);
          setPreviewCode(newFile.code);
          return [newFile];
        }
        if (activeFileId === id) {
          setActiveFileId(updated[0].id);
          setPreviewCode(updated[0].code);
        }
        return updated;
      });
    },
    [activeFileId]
  );

  // ── Select file ──────────────────────────────────────────────────────
  const selectFile = (file: EditorFile) => {
    setActiveFileId(file.id);
    setPreviewCode(file.code);
  };

  // ── Rename ───────────────────────────────────────────────────────────
  const startRename = (file: EditorFile) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const commitRename = () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    setFiles((prev) =>
      prev.map((f) =>
        f.id === renamingId ? { ...f, name: renameValue.trim() } : f
      )
    );
    setRenamingId(null);
  };

  // ── Open publish modal ────────────────────────────────────────────────
  const openPublishModal = () => {
    if (!activeFile) return;
    const title = fileNameToTitle(activeFile.name);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const deps = extractDeps(activeFile.code);

    setPubTitle(title);
    setPubId(slug);
    setPubDescription("");
    setPubCategory("cards");
    setPubDependencies(deps.join(", "));
    setPublishError(null);
    setPublishSuccess(null);
    setIsPublishModalOpen(true);
  };

  const handlePubTitleChange = (val: string) => {
    setPubTitle(val);
    setPubId(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  };

  // ── Publish ───────────────────────────────────────────────────────────
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile) return;

    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const selectedCat = CATEGORIES.find((c) => c.id === pubCategory);
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pubId,
          title: pubTitle,
          description: pubDescription,
          category: pubCategory,
          categoryLabel: selectedCat?.label || pubCategory,
          dependencies: pubDependencies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          code: activeFile.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish.");

      setPublishSuccess(`"${pubTitle}" published successfully!`);
      setTimeout(() => {
        handleDeleteFile(activeFile.id);
        setIsPublishModalOpen(false);
        setPublishSuccess(null);
      }, 1100);
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────
  if (isLocalhost === null) {
    return (
      <div className="min-h-screen bg-[#07080e] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isLocalhost) {
    return (
      <div className="min-h-screen bg-[#07080e] text-white flex items-center justify-center p-6">
        <div className="p-8 rounded-3xl bg-[#0e101c] border border-red-500/30 text-center max-w-md">
          <p className="text-red-400 font-semibold">Access Restricted</p>
          <p className="text-neutral-400 text-sm mt-2">
            The code editor is only accessible from localhost.
          </p>
          <Link
            href="/admin"
            className="mt-4 inline-block px-4 py-2 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.14] transition-all"
          >
            Return to Admin
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#07080e] text-white flex flex-col overflow-hidden select-none">
      {/* ══ Header Bar ══════════════════════════════════════════════════ */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-white/[0.08] shrink-0 bg-[#0a0b13]">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin?view=components"
            className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-xs font-medium transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Admin</span>
          </Link>
          <span className="text-neutral-700">/</span>
          <span className="text-xs font-semibold text-neutral-300">Code Editor</span>
          {activeFile && (
            <>
              <span className="text-neutral-700">/</span>
              <span className="text-xs font-mono text-blue-400 max-w-[160px] truncate">
                {activeFile.name}
              </span>
              {activeFile.modified && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  title="Unsaved changes"
                />
              )}
            </>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-neutral-600 hidden sm:block">
            Ctrl+S
          </span>
          <button
            type="button"
            onClick={openPublishModal}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-[0_0_14px_rgba(37,99,235,0.35)] cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* ══ 3-Panel Layout ═════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel 1: File List ─────────────────────────────────────── */}
        <div className="w-52 shrink-0 border-r border-white/[0.07] flex flex-col bg-[#090b12]">
          {/* Panel header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
              Files
            </span>
            <button
              type="button"
              onClick={handleAddFile}
              title="New file"
              className="w-5 h-5 flex items-center justify-center rounded text-neutral-600 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto py-1">
            {files.map((file) => {
              const isActive = activeFileId === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => selectFile(file)}
                  className={`group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-blue-600/20 border-l-2 border-blue-500"
                      : "border-l-2 border-transparent text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileCode2
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-400" : "text-neutral-600"}`}
                    />
                    {renamingId === file.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenamingId(null);
                          e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-mono bg-transparent border-b border-blue-400 text-white outline-none w-full"
                      />
                    ) : (
                      <span
                        className={`text-[11px] font-mono truncate ${isActive ? "text-blue-200" : ""}`}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startRename(file);
                        }}
                        title={`${file.name} — double-click to rename`}
                      >
                        {file.name}
                      </span>
                    )}
                    {file.modified && renamingId !== file.id && (
                      <span
                        className="w-1 h-1 rounded-full bg-amber-400 shrink-0"
                        title="Modified"
                      />
                    )}
                  </div>

                  {files.length > 1 && renamingId !== file.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-neutral-600 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Panel 2: Code Editor ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.07]">
          {/* Panel header */}
          <div className="flex items-center px-4 py-2 border-b border-white/[0.06] bg-[#090b12]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
              Editor
            </span>
            {activeFile && (
              <span className="ml-2 text-[10px] font-mono text-neutral-700">
                — {activeFile.name}
              </span>
            )}
          </div>

          {/* Textarea */}
          <textarea
            className="flex-1 w-full resize-none bg-[#07080e] p-5 font-mono text-[12.5px] text-blue-100/90 leading-[1.75] focus:outline-none placeholder-neutral-700 caret-blue-400"
            value={activeFile?.code ?? ""}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            spellCheck={false}
            placeholder="Write your component code here..."
          />
        </div>

        {/* ── Panel 3: Live Preview ──────────────────────────────────── */}
        <div className="w-[380px] shrink-0 flex flex-col overflow-hidden bg-[#090b12]">
          {/* Panel header */}
          <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
              Preview
            </span>
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/30">
            {previewCode ? (
              <ComponentLivePreview
                id="admin-editor-preview"
                code={previewCode}
                interactive={true}
              />
            ) : (
              <p className="text-xs text-neutral-700 font-mono">No preview</p>
            )}
          </div>
        </div>
      </div>

      {/* ══ Publish Modal ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => !publishing && setIsPublishModalOpen(false)}
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
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Publish Component</h2>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Publishing:{" "}
                    <span className="font-mono text-blue-400">{activeFile?.name}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  disabled={publishing}
                  className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Alerts */}
              {publishError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{publishError}</span>
                </div>
              )}
              {publishSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{publishSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePublish} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Title *</label>
                    <input
                      required
                      type="text"
                      value={pubTitle}
                      onChange={(e) => handlePubTitleChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                      placeholder="Kinetic Button"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-300">ID / Slug *</label>
                    <input
                      required
                      type="text"
                      value={pubId}
                      onChange={(e) => setPubId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                      placeholder="kinetic-button"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Category *</label>
                    <select
                      value={pubCategory}
                      onChange={(e) => setPubCategory(e.target.value)}
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
                      value={pubDependencies}
                      onChange={(e) => setPubDependencies(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                      placeholder="lucide-react, motion"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Description</label>
                  <input
                    type="text"
                    value={pubDescription}
                    onChange={(e) => setPubDescription(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090a12] border border-white/[0.12] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    placeholder="Short component description..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    disabled={publishing}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={publishing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg cursor-pointer active:scale-95"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Publish to Registry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
