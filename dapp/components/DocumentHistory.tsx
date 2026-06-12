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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">
            {count} document{count !== 1 ? "s" : ""} stored
          </span>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No documents stored yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Hash</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Signer</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="font-mono text-xs" title={doc.hash}>
                      {truncateHash(doc.hash)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-mono text-xs" title={doc.signer}>
                      {truncateAddress(doc.signer)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">
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
