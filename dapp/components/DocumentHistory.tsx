"use client";

import { useState, useEffect } from "react";
import { useContract, DocumentInfo } from "@/hooks/useContract";
import { History, RefreshCw, Loader2 } from "lucide-react";

export default function DocumentHistory() {
  const { getDocumentCount, getDocumentHashByIndex, getDocumentInfo } = useContract();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const docCount = await getDocumentCount();
      setCount(docCount);

      const docs: DocumentInfo[] = [];
      for (let i = 0; i < docCount; i++) {
        const hash = await getDocumentHashByIndex(i);
        const doc = await getDocumentInfo(hash);
        docs.push(doc);
      }
      setDocuments(docs);
    } catch (err: unknown) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-xs)",
          }}
        >
          <History style={{ width: "20px", height: "20px", color: "var(--color-ink)" }} />
          <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-ink-deep)" }}>
            {count} document{count !== 1 ? "s" : ""} stored
          </span>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-xxs)",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--color-primary)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? (
            <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
          ) : (
            <RefreshCw style={{ width: "16px", height: "16px" }} />
          )}
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--spacing-xxxl) 0",
            color: "var(--color-stone)",
            fontSize: "16px",
          }}
        >
          No documents stored yet
        </div>
      ) : (
        /* Table */
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-hairline-soft)" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "var(--spacing-md) var(--spacing-sm)",
                    fontWeight: 700,
                    color: "var(--color-steel)",
                  }}
                >
                  Hash
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "var(--spacing-md) var(--spacing-sm)",
                    fontWeight: 700,
                    color: "var(--color-steel)",
                  }}
                >
                  Signer
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "var(--spacing-md) var(--spacing-sm)",
                    fontWeight: 700,
                    color: "var(--color-steel)",
                  }}
                >
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid var(--color-hairline-soft)",
                  }}
                >
                  <td
                    style={{
                      padding: "var(--spacing-md) var(--spacing-sm)",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                    title={doc.hash}
                  >
                    {truncateHash(doc.hash)}
                  </td>
                  <td
                    style={{
                      padding: "var(--spacing-md) var(--spacing-sm)",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                    title={doc.signer}
                  >
                    {truncateAddress(doc.signer)}
                  </td>
                  <td
                    style={{
                      padding: "var(--spacing-md) var(--spacing-sm)",
                      color: "var(--color-charcoal)",
                    }}
                  >
                    {new Date(Number(doc.timestamp) * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
