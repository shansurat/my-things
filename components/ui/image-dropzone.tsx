import React, { useCallback, useRef, useState, useEffect } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

interface ImageDropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  existingImageUrl?: string;
  onRemoveExisting?: () => void;
  className?: string;
}

export function ImageDropzone({ value, onChange, existingImageUrl, onRemoveExisting, className }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0 && files[0].type.startsWith("image/")) {
        onChange(files[0]);
      }
    },
    [onChange]
  );

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (onRemoveExisting) {
      onRemoveExisting();
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const currentImage = preview || existingImageUrl;

  return (
    <div
      className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border/60 bg-secondary/10 hover:bg-secondary/30 hover:border-border"
      } ${className || ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {currentImage ? (
        <div className="relative w-full aspect-video bg-black/5 flex items-center justify-center">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center text-white gap-2 transition-opacity">
              <span className="text-xs font-bold drop-shadow-md">Click to replace</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-destructive text-white rounded-md transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-3">
          <div className="p-3 bg-secondary rounded-full">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Click or drag image to upload</p>
            <p className="text-xs text-muted-foreground/80">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
