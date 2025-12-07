"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === "dashboard" && "Caixa Atual"}
              {activeTab === "entradas" && "Entradas"}
              {activeTab === "saidas" && "Saídas"}
              {activeTab === "lucro" && "Lucro de Transações"}
            </h1>
            <p className="text-gray-600 mt-2">
              {activeTab === "dashboard" && "Visão geral do seu caixa"}
              {activeTab === "entradas" && "Gerencie suas entradas financeiras"}
              {activeTab === "saidas" && "Gerencie suas saídas financeiras"}
              {activeTab === "lucro" && "Calcule o lucro das transações"}
            </p>
          </div>

          {/* Content */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}