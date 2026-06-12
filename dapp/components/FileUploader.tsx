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
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const hash = ethers.keccak256(uint8Array);
    setComputedHash(hash);
    onHashComputed(hash);
  };

  return (
    <div
      style={{
        border: "2px dashed var(--color-hairline)",
        borderRadius: "var(--rounded-xxxl)",
        padding: "var(--spacing-xxl)",
        textAlign: "center",
        cursor: "pointer",
        transition: "border-color 0.15s ease",
      }}
      onClick={() => fileRef.current?.click()}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-primary)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-hairline)")
      }
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
          color: "var(--color-stone)",
        }}
      />

      <p
        style={{
          fontSize: "16px",
          fontWeight: 400,
          color: "var(--color-charcoal)",
          marginBottom: "var(--spacing-xs)",
        }}
      >
        {fileName ? "Click to select another file" : "Click to select a file"}
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
