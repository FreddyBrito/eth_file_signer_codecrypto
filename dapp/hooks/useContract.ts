"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import CONTRACT_ABI from "@/contracts/DocumentRegistry.json";

export interface DocumentInfo {
  hash: string;
  timestamp: bigint;
  signer: string;
  signature: string;
}

export function useContract() {
  const { provider, signer, isConnected } = useMetaMask();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

  const getContract = useCallback(
    (useSigner = false) => {
      if (!provider) throw new Error("Provider not connected");
      const target = useSigner && signer ? signer : provider;
      return new ethers.Contract(contractAddress, CONTRACT_ABI, target);
    },
    [provider, signer, contractAddress]
  );

  const storeDocumentHash = async (
    hash: string,
    timestamp: number,
    signature: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const contract = getContract(true);
      const tx = await contract.storeDocumentHash(hash, timestamp, signature, signer!.address);
      await tx.wait();
      return tx.hash;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentInfo = async (hash: string): Promise<DocumentInfo> => {
    const contract = getContract();
    const doc = await contract.getDocumentInfo(hash);
    return {
      hash: doc.hash,
      timestamp: doc.timestamp,
      signer: doc.signer,
      signature: doc.signature,
    };
  };

  const isDocumentStored = async (hash: string): Promise<boolean> => {
    const contract = getContract();
    return await contract.isDocumentStored(hash);
  };

  const getDocumentCount = async (): Promise<number> => {
    const contract = getContract();
    const count = await contract.getDocumentCount();
    return Number(count);
  };

  const getDocumentHashByIndex = async (index: number): Promise<string> => {
    const contract = getContract();
    return await contract.getDocumentHashByIndex(index);
  };

  const verifyDocument = async (
    hash: string,
    signerAddress: string,
    signature: string
  ): Promise<boolean> => {
    const contract = getContract();
    return await contract.verifyDocument(hash, signerAddress, signature);
  };

  return {
    storeDocumentHash,
    getDocumentInfo,
    isDocumentStored,
    getDocumentCount,
    getDocumentHashByIndex,
    verifyDocument,
    loading,
    error,
    contractAddress,
    isConnected,
  };
}
