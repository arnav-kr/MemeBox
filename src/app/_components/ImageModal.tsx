"use client";

import { useEffect, useRef, memo } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

function ImageModal({ isOpen, onClose, imageUrl, title }: ImageModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        onClose();
      }
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClickOutside);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const handleOpenExternal = () => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[99999] m-0 h-screen max-h-screen w-screen max-w-screen border-0 bg-black/80 p-0 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleOpenExternal}
            className="cursor-pointer rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            title="Open in new tab"
          >
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-screen w-screen">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
            onClick={(e) => e.stopPropagation()}
            sizes="100vw"
          />
        </div>
      </div>
    </dialog>
  );
}

export default memo(ImageModal);
