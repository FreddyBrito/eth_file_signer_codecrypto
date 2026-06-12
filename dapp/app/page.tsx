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
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-canvas)" }}>
      <div className="max-w-4xl mx-auto" style={{ padding: "var(--spacing-xxl)" }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: "var(--spacing-xxxl)" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 500,
              lineHeight: 1.17,
              color: "var(--color-ink-deep)",
              marginBottom: "var(--spacing-sm)",
            }}
          >
            Document Registry
          </h1>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: 1.44,
              color: "var(--color-steel)",
            }}
          >
            Store and verify document authenticity on Ethereum
          </p>
        </div>

        {/* Wallet Connection Card */}
        <div
          className="card-product-feature"
          style={{ marginBottom: "var(--spacing-xl)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
              <Wallet
                style={{ width: "24px", height: "24px", color: "var(--color-primary)" }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--color-ink-deep)",
                }}
              >
                {isConnected ? "Connected" : "Not Connected"}
              </span>
            </div>

            {isConnected ? (
              <div className="flex items-center" style={{ gap: "var(--spacing-xl)" }}>
                <div style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
                  <span style={{ fontFamily: "monospace" }}>
                    {connectedWallet?.address.slice(0, 6)}...
                    {connectedWallet?.address.slice(-4)}
                  </span>
                  <span style={{ marginLeft: "var(--spacing-xs)", color: "var(--color-stone)" }}>
                    (Wallet {walletIndex})
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  style={{
                    fontSize: "14px",
                    color: "var(--color-critical)",
                    fontWeight: 700,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}
                >
                  Connect Wallet
                  <ChevronDown style={{ width: "16px", height: "16px" }} />
                </button>

                {showWalletDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      marginTop: "var(--spacing-xs)",
                      width: "256px",
                      backgroundColor: "var(--color-canvas)",
                      border: "1px solid var(--color-hairline-soft)",
                      borderRadius: "var(--rounded-xl)",
                      boxShadow: "rgba(20, 22, 26, 0.3) 0px 1px 4px 0px",
                      zIndex: 10,
                    }}
                  >
                    {wallets.map((wallet, index) => (
                      <button
                        key={index}
                        onClick={() => handleConnect(index)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "var(--spacing-md) var(--spacing-base)",
                          borderBottom:
                            index < wallets.length - 1
                              ? "1px solid var(--color-hairline-soft)"
                              : "none",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "var(--color-ink-deep)",
                          }}
                        >
                          Wallet {index}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--color-stone)",
                            fontFamily: "monospace",
                          }}
                        >
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

        {/* Main Content Card */}
        <div className="card-product-feature">
          {/* Tabs */}
          <div
            className="flex"
            style={{
              borderBottom: "1px solid var(--color-hairline-soft)",
              marginBottom: "var(--spacing-xxl)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? "tab-pill tab-pill-active" : "tab-pill"}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--spacing-xs)",
                  borderRadius: 0,
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid var(--color-ink-deep)"
                      : "2px solid transparent",
                  paddingBottom: "var(--spacing-md)",
                  marginBottom: "-1px",
                }}
              >
                <tab.icon style={{ width: "20px", height: "20px" }} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "upload" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xxl)" }}>
                <FileUploader onHashComputed={setDocumentHash} />
                <DocumentSigner hash={documentHash} />
              </div>
            )}

            {activeTab === "verify" && <DocumentVerifier />}

            {activeTab === "history" && <DocumentHistory />}
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center"
          style={{
            marginTop: "var(--spacing-xxl)",
            fontSize: "14px",
            color: "var(--color-stone)",
          }}
        >
          <p>
            Chain ID: {process.env.NEXT_PUBLIC_CHAIN_ID || "31337"} | Contract:{" "}
            <span style={{ fontFamily: "monospace" }}>
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
