"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { apiService } from "@/lib/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardData {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  lucroTransacoes: number;
}

interface UltimasMovimentacoes {
  entradas: Array<{
    id: string;
    descricao: string;
    valor: number;
    data: string;
    hora: string;
  }>;
  saidas: Array<{
    id: string;
    descricao: string;
    valor: number;
    data: string;
    hora: string;
  }>;
}

interface ChartData {
  date: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export function DashboardNovo({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [dataInicial, setDataInicial] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [dataFinal, setDataFinal] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
    lucroTransacoes: 0,
  });
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState<UltimasMovimentacoes>({
    entradas: [],
    saidas: [],
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarDadosDashboard = async () => {
    setLoading(true);
    try {
      const response = await apiService.getDashboard(dataInicial, dataFinal);
      
      if (response.success && response.data) {
        setDashboardData({
          totalEntradas: response.data.totalEntradas || 0,
          totalSaidas: response.data.totalSaidas || 0,
          saldo: response.data.saldo || 0,
          lucroTransacoes: response.data.lucroTransacoes || 0,
        });
      } else {
        console.error("Erro ao buscar dados do dashboard:", response.error);
        toast.error("Erro ao buscar dados do dashboard");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      toast.error("Erro ao buscar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const buscarUltimasMovimentacoes = async () => {
    try {
      const response = await apiService.getUltimasMovimentacoes(dataInicial, dataFinal, 5);
      
      if (response.success && response.data) {
        setUltimasMovimentacoes({
          entradas: response.data.entradas || [],
          saidas: response.data.saidas || [],
        });
      } else {
        console.error("Erro ao buscar últimas movimentações:", response.error);
      }
    } catch (error) {
      console.error("Erro ao buscar últimas movimentações:", error);
    }
  };

  const buscarDadosGrafico = async () => {
    try {
      // Buscar todas as entradas e saídas para o gráfico
      const [entradasResponse, saidasResponse] = await Promise.all([
        apiService.getEntradas(dataInicial, dataFinal),
        apiService.getSaidas(dataInicial, dataFinal),
      ]);

      if (entradasResponse.success && saidasResponse.success) {
        const entradas = entradasResponse.data?.entradas || [];
        const saidas = saidasResponse.data?.saidas || [];

        // Agrupar dados por dia
        const dadosAgrupados: { [key: string]: { entradas: number; saidas: number } } = {};
        
        entradas.forEach((entrada: any) => {
          const data = format(new Date(entrada.data), 'dd/MM', { locale: ptBR });
          if (!dadosAgrupados[data]) {
            dadosAgrupados[data] = { entradas: 0, saidas: 0 };
          }
          dadosAgrupados[data].entradas += entrada.valor;
        });

        saidas.forEach((saida: any) => {
          const data = format(new Date(saida.data), 'dd/MM', { locale: ptBR });
          if (!dadosAgrupados[data]) {
            dadosAgrupados[data] = { entradas: 0, saidas: 0 };
          }
          dadosAgrupados[data].saidas += saida.valor;
        });

        // Converter para formato do gráfico
        const dadosGrafico: ChartData[] = Object.entries(dadosAgrupados).map(([date, data]) => ({
          date,
          entradas: data.entradas,
          saidas: data.saidas,
          saldo: data.entradas - data.saidas,
        })).sort((a, b) => {
          // Ordenar por data
          const [diaA, mesA] = a.date.split('/').map(Number);
          const [diaB, mesB] = b.date.split('/').map(Number);
          if (mesA !== mesB) return mesA - mesB;
          return diaA - diaB;
        });

        setChartData(dadosGrafico);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
    }
  };

  useEffect(() => {
    buscarDadosDashboard();
    buscarUltimasMovimentacoes();
    buscarDadosGrafico();
  }, [dataInicial, dataFinal]);

  const aplicarFiltros = () => {
    buscarDadosDashboard();
    buscarUltimasMovimentacoes();
    buscarDadosGrafico();
  };

  const limparFiltros = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    setDataInicial(primeiroDia.toISOString().split('T')[0]);
    setDataFinal(hoje.toISOString().split('T')[0]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="dataInicial">Data Inicial</Label>
              <Input
                id="dataInicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFinal">Data Final</Label>
              <Input
                id="dataFinal"
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </div>
            <Button onClick={aplicarFiltros} disabled={loading}>
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Entradas */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Total de Entradas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(dashboardData.totalEntradas)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Receitas no período
            </p>
          </CardContent>
        </Card>

        {/* Total de Saídas */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Total de Saídas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(dashboardData.totalSaidas)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Despesas no período
            </p>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Saldo
            </CardTitle>
            {dashboardData.saldo >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-blue-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.saldo >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
              {formatCurrency(dashboardData.saldo)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Entradas - Saídas
            </p>
          </CardContent>
        </Card>

        {/* Lucro de Transações */}
        <Card className="bg-purple-50 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Lucro de Transações
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent onClick={() => onTabChange("lucro")}>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(dashboardData.lucroTransacoes)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Crescimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráfico de Crescimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado encontrado para o período selecionado</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `R$${value.toFixed(0)}`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Dia: ${label}`}
                  />
                  <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                  <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                  <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards de Navegação Rápida e Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cards de Navegação */}
        <div className="space-y-4">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onTabChange("entradas")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Gerenciar Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Adicione, edite ou remova entradas de caixa
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onTabChange("saidas")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Gerenciar Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Adicione, edite ou remova saídas/despesas
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onTabChange("lucro")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Calcular Lucro de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Calcule o lucro com múltiplos adquirentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Últimas Entradas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Últimas Entradas
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTabChange("entradas")}
            >
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent>
            {ultimasMovimentacoes.entradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma entrada encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ultimasMovimentacoes.entradas.map((entrada) => (
                  <div key={entrada.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-green-900 text-sm">{entrada.descricao}</p>
                      <div className="flex items-center gap-2 text-xs text-green-700 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entrada.data)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {entrada.hora}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-green-900 text-sm">
                      {formatCurrency(entrada.valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimas Saídas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Últimas Saídas
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTabChange("saidas")}
            >
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent>
            {ultimasMovimentacoes.saidas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma saída encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ultimasMovimentacoes.saidas.map((saida) => (
                  <div key={saida.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-red-900 text-sm">{saida.descricao}</p>
                      <div className="flex items-center gap-2 text-xs text-red-700 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(saida.data)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {saida.hora}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-red-900 text-sm">
                      {formatCurrency(saida.valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}