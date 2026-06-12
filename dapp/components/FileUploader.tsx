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
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
      <input
        ref={fileRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          {fileName ? "Click to select another file" : "Click to select a file"}
        </p>
        <p className="text-sm text-gray-400">Any file type supported</p>
      </label>

      {fileName && computedHash && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">{fileName}</span>
          </div>
          <p className="text-xs text-gray-500 break-all">
            <span className="font-medium">Hash:</span> {computedHash}
          </p>
        </div>
      )}
    </div>
  );
}
