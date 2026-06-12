"use client";

import { useState } from "react";
import { MetaMaskProvider, useMetaMask } from "@/contexts/MetaMaskContext";
import FileUploader from "@/components/FileUploader";
import DocumentSigner from "@/components/DocumentSigner";
import DocumentVerifier from "@/components/DocumentVerifier";
import DocumentHistory from "@/components/DocumentHistory";
import { Wallet, FileCheck, Search, History, ChevronDown } from "lucide-react";

function AppContent() {
  const { isConnected, connectedWallet, wallets, connect, disconnect, walletIndex } =
    useMetaMask();
  const [activeTab, setActiveTab] = useState<"upload" | "verify" | "history">("upload");
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  const tabs = [
    { id: "upload" as const, label: "Upload & Sign", icon: FileCheck },
    { id: "verify" as const, label: "Verify", icon: Search },
    { id: "history" as const, label: "History", icon: History },
  ];

  const handleConnect = (index: number) => {
    connect(index);
    setShowWalletDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Registry
          </h1>
          <p className="text-gray-600">
            Store and verify document authenticity on Ethereum
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-gray-800">
                {isConnected ? "Connected" : "Not Connected"}
              </span>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-mono">
                    {connectedWallet?.address.slice(0, 6)}...
                    {connectedWallet?.address.slice(-4)}
                  </span>
                  <span className="ml-2 text-gray-400">(Wallet {walletIndex})</span>
                </div>
                <button
                  onClick={disconnect}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {wallets.map((wallet, index) => (
                      <button
                        key={index}
                        onClick={() => handleConnect(index)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-800">
                          Wallet {index}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "upload" && (
              <div className="space-y-6">
                <FileUploader onHashComputed={setDocumentHash} />
                <DocumentSigner hash={documentHash} />
              </div>
            )}

            {activeTab === "verify" && <DocumentVerifier />}

            {activeTab === "history" && <DocumentHistory />}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Chain ID: {process.env.NEXT_PUBLIC_CHAIN_ID || "31337"} | Contract:{" "}
            <span className="font-mono">
              {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 10)}...
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <MetaMaskProvider>
      <AppContent />
    </MetaMaskProvider>
  );
}
