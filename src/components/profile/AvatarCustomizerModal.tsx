"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ZoomIn, ZoomOut, Check, Sparkles, RefreshCw, Image as ImageIcon } from "lucide-react";
import UserAvatar, { PALETTES } from "@/components/ui/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  currentPaletteIndex?: number | null;
  userName: string;
}

export default function AvatarCustomizerModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  currentPaletteIndex,
  userName,
}: AvatarCustomizerModalProps) {
  const { user, updateUserProfile } = useAuth();
  const { messages } = useLanguage();
  const t = messages.profile?.avatarModal || {};

  // Tab state: "identicon" | "upload"
  const [activeTab, setActiveTab] = useState<"identicon" | "upload">(
    currentAvatarUrl ? "upload" : "identicon"
  );

  // Identicon palette state
  const [selectedPalette, setSelectedPalette] = useState<number>(
    typeof currentPaletteIndex === "number" && currentPaletteIndex >= 0 && currentPaletteIndex < PALETTES.length
      ? currentPaletteIndex
      : 0
  );

  // Upload & Cropper state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);

  // Reset state & handle body scroll lock + Escape key when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(currentAvatarUrl ? "upload" : "identicon");
      if (typeof currentPaletteIndex === "number" && currentPaletteIndex >= 0) {
        setSelectedPalette(currentPaletteIndex);
      }
      setRawImageSrc(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setErrorMsg(null);
      setIsSaving(false);

      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, currentAvatarUrl, currentPaletteIndex, onClose]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5MB limit.");
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageSrc(event.target?.result as string);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Pan / Drag handlers for cropper
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Save selected geometric palette
  const handleSavePalette = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const { error } = await updateUserProfile({
        avatar_url: null, // Clear uploaded photo to use identicon
        avatar_palette: selectedPalette,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to update palette");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default identicon
  const handleResetToIdenticon = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const { error } = await updateUserProfile({
        avatar_url: null,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setActiveTab("identicon");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to reset avatar");
    } finally {
      setIsSaving(false);
    }
  };

  // Perform client-side crop to 256x256 WebP & upload to Supabase
  const handleCropAndSave = async () => {
    if (!imgRef.current || !cropAreaRef.current) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const img = imgRef.current;
      const cropArea = cropAreaRef.current;
      const cropRect = cropArea.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      // Output canvas 256x256
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to initialize canvas context");
      }

      // Calculate source image coordinates relative to the crop square
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;

      const sourceX = (cropRect.left - imgRect.left) * scaleX;
      const sourceY = (cropRect.top - imgRect.top) * scaleY;
      const sourceWidth = cropRect.width * scaleX;
      const sourceHeight = cropRect.height * scaleY;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        256,
        256
      );

      // Convert to blob and upload
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setErrorMsg("Failed to generate cropped image");
            setIsSaving(false);
            return;
          }

          let finalUrl: string | null = null;
          const supabase = createClient();

          if (supabase && user) {
            try {
              const fileName = `${user.id}/avatar-${Date.now()}.webp`;
              const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, blob, {
                  contentType: "image/webp",
                  upsert: true,
                });

              if (!uploadError) {
                const { data } = supabase.storage
                  .from("avatars")
                  .getPublicUrl(fileName);
                finalUrl = data?.publicUrl || null;
              } else {
                console.error("Storage upload error:", uploadError.message);
                setErrorMsg(t.uploadError || "Failed to upload avatar image. Please try again.");
                setIsSaving(false);
                return;
              }
            } catch (err) {
              const e = err as Error;
              console.error("Storage upload failed:", e);
              setErrorMsg(t.uploadError || "Failed to upload avatar image. Please try again.");
              setIsSaving(false);
              return;
            }
          }

          if (!finalUrl) {
            setErrorMsg(t.uploadError || "Failed to upload avatar image. Please try again.");
            setIsSaving(false);
            return;
          }

          const { error: updateError } = await updateUserProfile({
            avatar_url: finalUrl,
          });

          if (updateError) {
            setErrorMsg(updateError.message);
          } else {
            onClose();
          }
          setIsSaving(false);
        },
        "image/webp",
        0.9
      );
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to crop and save avatar");
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
            }}
            className="relative z-10 w-full max-w-xl my-auto rounded-3xl bg-[#0c0e18] border border-white/[0.14] shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.title || "Customize Profile Avatar"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {t.subtitle || "Personalize your cyber geometric identicon or upload your own photo."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Tabs with Animated Sliding Pill */}
        <div className="relative grid grid-cols-2 p-1 rounded-2xl bg-black/50 border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab("identicon")}
            className="relative py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {activeTab === "identicon" && (
              <motion.div
                layoutId="avatarTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-2 transition-colors ${
                activeTab === "identicon"
                  ? "text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.tabIdenticon || "Geometric Identicon"}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className="relative py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {activeTab === "upload" && (
              <motion.div
                layoutId="avatarTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-2 transition-colors ${
                activeTab === "upload"
                  ? "text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>{t.tabUpload || "Upload & Crop Photo"}</span>
            </span>
          </button>
        </div>

        {/* Tab Content Crossfade / Slide Transition */}
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "identicon" ? (
            <motion.div
              key="identicon-tab"
              initial={{ opacity: 0, x: -14, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -14, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              {/* Live Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-[#121422] border border-white/[0.08]">
                <UserAvatar
                  name={userName}
                  paletteIndex={selectedPalette}
                  size={88}
                  shape="circle"
                  className="border border-white/20 shadow-xl"
                />
                <div className="text-center sm:text-left">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    {t.currentPalette || "Current Palette"}
                  </span>
                  <span className="text-lg font-bold text-white block mt-0.5">
                    {PALETTES[selectedPalette]?.name}
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <div
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: PALETTES[selectedPalette]?.fg }}
                      title="Foreground Color"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: PALETTES[selectedPalette]?.bg }}
                      title="Background Color"
                    />
                    <span className="text-xs text-neutral-400 font-mono">
                      {PALETTES[selectedPalette]?.fg}
                    </span>
                  </div>
                </div>
              </div>

              {/* Palettes Grid */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-3">
                  {t.choosePalette || "Choose Cyber Color Palette"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {PALETTES.map((palette, idx) => {
                    const isSelected = selectedPalette === idx;
                    return (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() => setSelectedPalette(idx)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/15 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/50"
                            : "border-white/[0.08] bg-black/30 hover:border-white/20 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-4 h-4 rounded-md shrink-0 border border-white/20 shadow-inner"
                            style={{ backgroundColor: palette.fg }}
                          />
                          <span className="text-xs font-medium text-neutral-200 truncate">
                            {palette.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {t.close || "Close"}
                </button>
                <button
                  type="button"
                  onClick={handleSavePalette}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? (t.saving || "Saving...") : (t.savePaletteBtn || "Save Identicon")}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload-tab"
              initial={{ opacity: 0, x: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 14, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <AnimatePresence mode="wait" initial={false}>
                {!rawImageSrc ? (
                  /* Step 1: Dropzone */
                  <motion.div
                    key="dropzone-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col gap-4"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 sm:p-10 rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500/60 bg-black/30 hover:bg-blue-500/[0.03] transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {t.dropzoneText || "Click or drag an image here to upload"}
                        </p>
                        <p className="text-xs text-neutral-500 font-mono mt-1">
                          {t.dropzoneHint || "Supported formats: PNG, JPG, JPEG, WEBP (Max 5MB)"}
                        </p>
                      </div>
                    </div>

                    {/* If user already has an uploaded photo, provide reset button */}
                    {currentAvatarUrl && (
                      <div className="pt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={handleResetToIdenticon}
                          disabled={isSaving}
                          className="text-xs text-neutral-400 hover:text-white flex items-center gap-2 underline underline-offset-4 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
                          <span>{t.revertToIdenticon || "Reset to Geometric Identicon"}</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Step 2: Interactive Cropper */
                  <motion.div
                    key="cropper-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">
                        {t.cropTitle || "Adjust & Crop Photo"}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {t.cropHint || "Drag to position, use the slider to zoom"}
                      </span>
                    </div>

                    {/* Cropping Canvas Viewport */}
                    <div
                      ref={cropAreaRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-black/80 border border-white/20 select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
                    >
                      {/* Target image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={imgRef}
                        src={rawImageSrc}
                        alt="Upload Crop Target"
                        draggable={false}
                        className="max-w-none transition-transform pointer-events-none"
                        style={{
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transformOrigin: "center center",
                        }}
                      />

                      {/* Circular Crop Aperture Mask */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ring-2 ring-blue-500/40" />
                      </div>
                    </div>

                    {/* Zoom Controller */}
                    <div className="flex items-center gap-4 px-2 py-1">
                      <ZoomOut className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="range"
                        min="1"
                        max="3.5"
                        step="0.02"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <ZoomIn className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="text-xs font-mono text-neutral-400 w-12 text-right">
                        {zoom.toFixed(1)}x
                      </span>
                    </div>

                    {/* Cropper Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRawImageSrc(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {t.changeImageBtn || "Change Image"}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {t.close || "Close"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCropAndSave}
                          disabled={isSaving}
                          className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>
                            {isSaving
                              ? (t.uploading || "Uploading & Saving...")
                              : (t.cropAndSaveBtn || "Crop & Save Avatar")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
}
