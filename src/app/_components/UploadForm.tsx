"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = api.meme.upload.useMutation({
    onSuccess: (data) => {
      console.log("Upload successful:", data);
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error("failed to read file"));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !title.trim()) {
      alert("Please provide both a title and an image");
      return;
    }

    try {
      const base64Data = await convertToBase64(selectedFile);

      await uploadMutation.mutateAsync({
        title: title.trim(),
        imageData: base64Data,
      });
    } catch (error) {
      console.error("Error converting file:", error);
      alert("Failed to process the image");
    }
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-white"
          >
            Meme Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a catchy title for your meme..."
            maxLength={100}
            className="block w-full rounded-lg bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 transition-colors focus:bg-neutral-800 focus:outline-none"
            required
          />
          <p className="mt-2 text-xs text-neutral-400">
            {title.length}/100 characters
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Meme Image
          </label>

          {!selectedFile ? (
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? "border-neutral-500 bg-neutral-800/50"
                  : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800/30"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-700">
                  <PhotoIcon className="h-8 w-8 text-neutral-300" />
                </div>
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex cursor-pointer items-center rounded-lg bg-neutral-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-600 focus:outline-none"
                  >
                    <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
                    Choose Image
                  </button>
                </div>
                <p className="mb-2 text-sm text-neutral-300">
                  or drag and drop an image here
                </p>
                <p className="text-xs text-neutral-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-64 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-3 right-3 cursor-pointer rounded-full bg-neutral-800/90 p-2 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-300"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-neutral-300">
                {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-neutral-800 pt-4">
          <button
            type="submit"
            disabled={
              !selectedFile || !title.trim() || uploadMutation.isPending
            }
            className="inline-flex cursor-pointer items-center rounded-lg bg-neutral-700 px-6 py-3 text-sm font-semibold text-white transition-colors focus:outline-none enabled:hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                Upload Meme
              </>
            )}
          </button>
        </div>

        {uploadMutation.error && (
          <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-4">
            <div className="text-sm text-red-400">
              {uploadMutation.error.message}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
