"use client";

import { useState, useRef } from "react";
import { ethers } from "ethers";
import { Upload, FileCheck } from "lucide-react";

interface FileUploaderProps {
  onHashComputed: (hash: string) => void;
}

export default function FileUploader({ onHashComputed }: FileUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const hash = ethers.keccak256(uint8Array);
    setComputedHash(hash);
    onHashComputed(hash);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div
      style={{
        border: `2px dashed ${isDragOver ? "var(--color-primary)" : "var(--color-hairline)"}`,
        borderRadius: "var(--rounded-xxxl)",
        padding: "var(--spacing-xxl)",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: isDragOver ? "rgba(0, 100, 224, 0.05)" : "transparent",
      }}
      onClick={() => fileRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="file-upload"
      />

      <Upload
        style={{
          width: "48px",
          height: "48px",
          margin: "0 auto var(--spacing-md)",
          color: isDragOver ? "var(--color-primary)" : "var(--color-stone)",
          transition: "color 0.2s ease",
        }}
      />

      <p
        style={{
          fontSize: "16px",
          fontWeight: isDragOver ? 700 : 400,
          color: isDragOver ? "var(--color-primary)" : "var(--color-charcoal)",
          marginBottom: "var(--spacing-xs)",
          transition: "color 0.2s ease",
        }}
      >
        {isDragOver
          ? "Drop file here"
          : fileName
            ? "Drop another file or click to select"
            : "Drop a file here or click to select"}
      </p>
      <p style={{ fontSize: "14px", color: "var(--color-stone)" }}>
        Any file type supported
      </p>

      {fileName && computedHash && (
        <div
          style={{
            marginTop: "var(--spacing-xl)",
            padding: "var(--spacing-lg)",
            backgroundColor: "var(--color-surface-soft)",
            borderRadius: "var(--rounded-xl)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-xs)",
              marginBottom: "var(--spacing-xs)",
            }}
          >
            <FileCheck style={{ width: "20px", height: "20px", color: "var(--color-success)" }} />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-ink-deep)" }}>
              {fileName}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--color-steel)", wordBreak: "break-all" }}>
            <span style={{ fontWeight: 700 }}>Hash:</span> {computedHash}
          </p>
        </div>
      )}
    </div>
  );
}
