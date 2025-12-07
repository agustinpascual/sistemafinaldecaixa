import { DashboardNovo } from "./dashboard-novo";

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  return <DashboardNovo onTabChange={onTabChange} />;
}