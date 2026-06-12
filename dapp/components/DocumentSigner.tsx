"use client";

import { useState } from "react";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { useContract } from "@/hooks/useContract";
import { PenLine, Check, Loader2 } from "lucide-react";

interface DocumentSignerProps {
  hash: string | null;
}

export default function DocumentSigner({ hash }: DocumentSignerProps) {
  const { signMessage, isConnected, connectedWallet } = useMetaMask();
  const { storeDocumentHash, loading } = useContract();
  const [signature, setSignature] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSign = async () => {
    if (!hash) return;

    const confirmSign = window.confirm(
      `Are you sure you want to sign this document?\n\nHash:\n${hash}`
    );
    if (!confirmSign) return;

    try {
      const sig = await signMessage(hash);
      setSignature(sig);
      alert(`Document signed successfully!\n\nSignature:\n${sig.slice(0, 30)}...`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signing failed";
      alert(`Error signing document: ${message}`);
    }
  };

  const handleStore = async () => {
    if (!hash || !signature || !connectedWallet) return;

    const confirmStore = window.confirm(
      `Store this document on the blockchain?\n\nHash:\n${hash}\n\nWallet:\n${connectedWallet.address}`
    );
    if (!confirmStore) return;

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const txResult = await storeDocumentHash(hash, timestamp, signature);
      setTxHash(txResult);
      alert(`Document stored on blockchain!\n\nTx Hash:\n${txResult}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Storage failed";
      alert(`Error storing document: ${message}`);
    }
  };

  if (!hash) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--spacing-xxxl) 0",
          color: "var(--color-stone)",
          fontSize: "16px",
        }}
      >
        Upload a file first to sign it
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div
        style={{
          padding: "var(--spacing-lg)",
          backgroundColor: "var(--color-surface-soft)",
          borderRadius: "var(--rounded-xl)",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--color-ink)",
            marginBottom: "var(--spacing-xxs)",
          }}
        >
          Document Hash
        </p>
        <p style={{ fontSize: "12px", wordBreak: "break-all", color: "var(--color-charcoal)" }}>
          {hash}
        </p>
      </div>

      {!signature ? (
        <button
          onClick={handleSign}
          disabled={!isConnected || loading}
          className="btn-primary"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--spacing-xs)",
          }}
        >
          <PenLine style={{ width: "20px", height: "20px" }} />
          Sign Document
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
          <div
            style={{
              padding: "var(--spacing-md)",
              backgroundColor: "rgba(49, 162, 76, 0.1)",
              borderRadius: "var(--rounded-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-xs)",
                marginBottom: "var(--spacing-xxs)",
              }}
            >
              <Check style={{ width: "16px", height: "16px", color: "var(--color-success)" }} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-success)" }}>
                Signed
              </span>
            </div>
            <p style={{ fontSize: "12px", wordBreak: "break-all", color: "var(--color-charcoal)" }}>
              {signature.slice(0, 50)}...
            </p>
          </div>

          {!txHash ? (
            <button
              onClick={handleStore}
              disabled={loading}
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
                <PenLine style={{ width: "20px", height: "20px" }} />
              )}
              Store on Blockchain
            </button>
          ) : (
            <div
              style={{
                padding: "var(--spacing-md)",
                backgroundColor: "rgba(0, 100, 224, 0.1)",
                borderRadius: "var(--rounded-lg)",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-primary)", marginBottom: "var(--spacing-xxs)" }}>
                Transaction Confirmed
              </p>
              <p style={{ fontSize: "12px", wordBreak: "break-all", color: "var(--color-charcoal)" }}>
                {txHash}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
