"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

interface WalletInfo {
  address: string;
  privateKey: string;
}

interface MetaMaskContextType {
  provider: ethers.JsonRpcProvider | null;
  signer: ethers.Wallet | null;
  connectedWallet: WalletInfo | null;
  walletIndex: number;
  wallets: WalletInfo[];
  connect: (index: number) => void;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  isConnected: boolean;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(null);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545";
    const mnemonic = process.env.NEXT_PUBLIC_MNEMONIC || "";
    const newProvider = new ethers.JsonRpcProvider(rpcUrl);
    setProvider(newProvider);

    const derivedWallets: WalletInfo[] = Array.from({ length: 10 }, (_, i) => {
      const path = `m/44'/60'/0'/0/${i}`;
      const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path);
      return { address: wallet.address, privateKey: wallet.privateKey };
    });
    setWallets(derivedWallets);
  }, []);

  const connect = useCallback(
    (index: number) => {
      if (index < 0 || index >= wallets.length) return;
      const walletInfo = wallets[index];
      const walletSigner = new ethers.Wallet(walletInfo.privateKey, provider!);
      setSigner(walletSigner);
      setConnectedWallet(walletInfo);
      setWalletIndex(index);
    },
    [wallets, provider]
  );

  const disconnect = useCallback(() => {
    setSigner(null);
    setConnectedWallet(null);
    setWalletIndex(0);
  }, []);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!signer) throw new Error("Wallet not connected");
      return await signer.signMessage(message);
    },
    [signer]
  );

  return (
    <MetaMaskContext.Provider
      value={{
        provider,
        signer,
        connectedWallet,
        walletIndex,
        wallets,
        connect,
        disconnect,
        signMessage,
        isConnected: signer !== null,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error("useMetaMask must be used within a MetaMaskProvider");
  }
  return context;
}
