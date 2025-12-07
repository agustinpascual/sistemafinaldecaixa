"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Entradas } from "@/components/entradas/entradas";
import { Saidas } from "@/components/saidas/saidas";
import { LucroTransacoes } from "@/components/lucro/lucro-transacoes";

export function CaixaSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onTabChange={setActiveTab} />;
      case "entradas":
        return <Entradas />;
      case "saidas":
        return <Saidas />;
      case "lucro":
        return <LucroTransacoes />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
}