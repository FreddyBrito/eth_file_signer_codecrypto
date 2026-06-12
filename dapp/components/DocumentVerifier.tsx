"use client";

import { useState, useRef } from "react";
import { ethers } from "ethers";
import { useContract, DocumentInfo } from "@/hooks/useContract";
import { ShieldCheck, ShieldAlert, Loader2, Upload, FileCheck } from "lucide-react";

interface VerificationResult {
  isValid: boolean;
  documentInfo: DocumentInfo | null;
}

export default function DocumentVerifier() {
  const { getDocumentInfo, isDocumentStored, verifyDocument } = useContract();
  const [fileHash, setFileHash] = useState<string>("");
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const hash = ethers.keccak256(uint8Array);
    setFileHash(hash);
  };

  const handleVerify = async () => {
    if (!fileHash || !signerAddress) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!ethers.isAddress(signerAddress)) {
        throw new Error("Invalid signer address");
      }

      const exists = await isDocumentStored(fileHash);
      if (!exists) {
        setError("Document not found in blockchain");
        return;
      }

      const docInfo = await getDocumentInfo(fileHash);
      const isCorrectSigner = docInfo.signer.toLowerCase() === signerAddress.toLowerCase();

      setResult({
        isValid: isCorrectSigner,
        documentInfo: docInfo,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      {/* File Upload */}
      <div
        style={{
          border: "2px dashed var(--color-hairline)",
          borderRadius: "var(--rounded-xxxl)",
          padding: "var(--spacing-xl)",
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
          id="verify-file-upload"
        />
        <Upload
          style={{
            width: "40px",
            height: "40px",
            margin: "0 auto var(--spacing-sm)",
            color: "var(--color-stone)",
          }}
        />
        {fileName ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-xs)",
            }}
          >
            <FileCheck style={{ width: "20px", height: "20px", color: "var(--color-success)" }} />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-success)" }}>
              {fileName}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: "16px", color: "var(--color-charcoal)" }}>
            Click to upload file for verification
          </p>
        )}
      </div>

      {/* Hash Input */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--color-ink)",
            marginBottom: "var(--spacing-xs)",
          }}
        >
          Document Hash
        </label>
        <input
          type="text"
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          placeholder="0x... or upload a file above"
          className="text-input"
        />
      </div>

      {/* Signer Address Input */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--color-ink)",
            marginBottom: "var(--spacing-xs)",
          }}
        >
          Signer Address
        </label>
        <input
          type="text"
          value={signerAddress}
          onChange={(e) => setSignerAddress(e.target.value)}
          placeholder="0x..."
          className="text-input"
        />
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!fileHash || !signerAddress || loading}
        className="btn-buy-cta"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--spacing-xs)",
        }}
      >
        {loading ? (
          <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
        ) : (
          <ShieldCheck style={{ width: "20px", height: "20px" }} />
        )}
        Verify Document
      </button>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "var(--spacing-lg)",
            backgroundColor: "rgba(228, 30, 63, 0.1)",
            borderRadius: "var(--rounded-xl)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)",
            }}
          >
            <ShieldAlert style={{ width: "20px", height: "20px", color: "var(--color-critical)" }} />
            <span style={{ fontWeight: 700, color: "var(--color-critical)" }}>Error</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--color-critical-strong)", marginTop: "var(--spacing-xs)" }}>
            {error}
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          style={{
            padding: "var(--spacing-lg)",
            backgroundColor: result.isValid
              ? "rgba(49, 162, 76, 0.1)"
              : "rgba(228, 30, 63, 0.1)",
            borderRadius: "var(--rounded-xl)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)",
              marginBottom: "var(--spacing-sm)",
            }}
          >
            {result.isValid ? (
              <ShieldCheck style={{ width: "24px", height: "24px", color: "var(--color-success)" }} />
            ) : (
              <ShieldAlert style={{ width: "24px", height: "24px", color: "var(--color-critical)" }} />
            )}
            <span
              style={{
                fontWeight: 700,
                fontSize: "18px",
                color: result.isValid ? "var(--color-success)" : "var(--color-critical)",
              }}
            >
              {result.isValid ? "VALID" : "INVALID"}
            </span>
          </div>

          {result.documentInfo && (
            <div style={{ fontSize: "14px" }}>
              <p style={{ color: "var(--color-charcoal)", marginBottom: "var(--spacing-xxs)" }}>
                <span style={{ fontWeight: 700 }}>Stored Signer:</span>{" "}
                {result.documentInfo.signer}
              </p>
              <p style={{ color: "var(--color-charcoal)" }}>
                <span style={{ fontWeight: 700 }}>Timestamp:</span>{" "}
                {new Date(Number(result.documentInfo.timestamp) * 1000).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
