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
      <div className="text-center py-8 text-gray-400">
        Upload a file first to sign it
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-1">Document Hash</p>
        <p className="text-xs break-all text-gray-600">{hash}</p>
      </div>

      {!signature ? (
        <button
          onClick={handleSign}
          disabled={!isConnected || loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PenLine className="w-5 h-5" />
          Sign Document
        </button>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Signed</span>
            </div>
            <p className="text-xs break-all text-gray-600">{signature.slice(0, 50)}...</p>
          </div>

          {!txHash ? (
            <button
              onClick={handleStore}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PenLine className="w-5 h-5" />
              )}
              Store on Blockchain
            </button>
          ) : (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Transaction Confirmed</p>
              <p className="text-xs break-all text-gray-600">{txHash}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
