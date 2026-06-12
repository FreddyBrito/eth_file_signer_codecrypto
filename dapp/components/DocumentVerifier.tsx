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
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
        <input
          ref={fileRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="verify-file-upload"
        />
        <label htmlFor="verify-file-upload" className="cursor-pointer">
          <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          {fileName ? (
            <div className="flex items-center justify-center gap-2">
              <FileCheck className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">{fileName}</span>
            </div>
          ) : (
            <p className="text-gray-600">Click to upload file for verification</p>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Hash
        </label>
        <input
          type="text"
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          placeholder="0x... or upload a file above"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Signer Address
        </label>
        <input
          type="text"
          value={signerAddress}
          onChange={(e) => setSignerAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={!fileHash || !signerAddress || loading}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShieldCheck className="w-5 h-5" />
        )}
        Verify Document
      </button>

      {error && (
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.isValid ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {result.isValid ? (
              <ShieldCheck className="w-6 h-6 text-green-600" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-600" />
            )}
            <span
              className={`font-bold text-lg ${
                result.isValid ? "text-green-800" : "text-red-800"
              }`}
            >
              {result.isValid ? "VALID" : "INVALID"}
            </span>
          </div>

          {result.documentInfo && (
            <div className="text-sm space-y-1">
              <p className="text-gray-600">
                <span className="font-medium">Stored Signer:</span>{" "}
                {result.documentInfo.signer}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Timestamp:</span>{" "}
                {new Date(Number(result.documentInfo.timestamp) * 1000).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
