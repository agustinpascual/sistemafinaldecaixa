"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Plus,
  Trash2,
  Edit2,
  Building2,
  Save,
  Calendar,
  Clock
} from "lucide-react";
import { apiService } from "@/lib/services/api";
import { toast } from "sonner";

interface Adquirente {
  id: string;
  nome: string;
  quantidadeTransacoes: number;
  custoTotal: number;
  custoPorTransacao: number;
}

interface DadosTransacao {
  totalTransicionado: number;
  totalTransacoesPagas: number;
  totalSaques: number;
}

interface ResultadosCalculo {
  valorA: number; // Total transicionado * 0,0499 (4,99%)
  valorB: number; // (total de transações pagas) * R$2,50
  valorC: number; // (total de saques) * R$10
  valorD: number; // A + B + C
  lucroReal: number; // D - custo total dos adquirentes
}

export function LucroTransacoes() {
  const [dados, setDados] = useState<DadosTransacao>({
    totalTransicionado: 0,
    totalTransacoesPagas: 0,
    totalSaques: 0,
  });

  const [adquirentes, setAdquirentes] = useState<Adquirente[]>([
    {
      id: "1",
      nome: "Adquirente Principal",
      quantidadeTransacoes: 0,
      custoTotal: 0,
      custoPorTransacao: 0,
    },
  ]);

  const [novoAdquirenteDialog, setNovoAdquirenteDialog] = useState(false);
  const [salvarTransacaoDialog, setSalvarTransacaoDialog] = useState(false);
  const [dataHoraSalvamento, setDataHoraSalvamento] = useState({
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
  });
  const [novoAdquirente, setNovoAdquirente] = useState({
    nome: "",
    quantidadeTransacoes: 0,
    custoTotal: 0,
    custoPorTransacao: 0,
  });

  const [resultados, setResultados] = useState<ResultadosCalculo>({
    valorA: 0,
    valorB: 0,
    valorC: 0,
    valorD: 0,
    lucroReal: 0,
  });

  const [transacoesSalvas, setTransacoesSalvas] = useState<any[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const calcularResultados = () => {
    // A = Total transicionado * 0,0499 (4,99%)
    const valorA = dados.totalTransicionado * 0.0499;
    
    // B = (total de transações pagas) * R$2,50
    const valorB = dados.totalTransacoesPagas * 2.50;
    
    // C = (total de saques) * R$10
    const valorC = dados.totalSaques * 10;
    
    // D = A + B + C
    const valorD = valorA + valorB + valorC;
    
    // Calcular custo total dos adquirentes
    const custoTotalAdquirentes = adquirentes.reduce((sum, adq) => sum + adq.custoTotal, 0);
    
    // Lucro Real = D - custo total dos adquirentes
    const lucroReal = valorD - custoTotalAdquirentes;

    setResultados({
      valorA,
      valorB,
      valorC,
      valorD,
      lucroReal,
    });
  };

  useEffect(() => {
    calcularResultados();
  }, [dados, adquirentes]);

  useEffect(() => {
    buscarTransacoesSalvas();
  }, [paginaAtual]);

  const buscarTransacoesSalvas = async () => {
    try {
      const response = await apiService.getTransacoes();
      
      if (response.success && response.data) {
        const todasTransacoes = response.data.transacoes || [];
        const totalItens = todasTransacoes.length;
        const totalPaginasCalculado = Math.ceil(totalItens / itensPorPagina);
        
        setTotalPaginas(totalPaginasCalculado);
        
        const indiceInicial = (paginaAtual - 1) * itensPorPagina;
        const indiceFinal = indiceInicial + itensPorPagina;
        const transacoesPagina = todasTransacoes.slice(indiceInicial, indiceFinal);
        
        setTransacoesSalvas(transacoesPagina);
      }
    } catch (error) {
      console.error("Erro ao buscar transações salvas:", error);
    }
  };

  const handleInputChange = (campo: keyof DadosTransacao, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDados(prev => ({
      ...prev,
      [campo]: numValue
    }));
  };

  const handleAdicionarAdquirente = () => {
    if (novoAdquirente.nome.trim()) {
      const quantidade = parseFloat(novoAdquirente.quantidadeTransacoes.toString()) || 0;
      const custoPorTransacao = parseFloat(novoAdquirente.custoPorTransacao.toString()) || 0;
      const custoTotal = quantidade * custoPorTransacao;
      
      const novo: Adquirente = {
        id: Date.now().toString(),
        nome: novoAdquirente.nome,
        quantidadeTransacoes: quantidade,
        custoTotal: custoTotal,
        custoPorTransacao: custoPorTransacao,
      };
      
      setAdquirentes([...adquirentes, novo]);
      setNovoAdquirente({
        nome: "",
        quantidadeTransacoes: 0,
        custoTotal: 0,
        custoPorTransacao: 0,
      });
      setNovoAdquirenteDialog(false);
      toast.success("Adquirente adicionado com sucesso");
    }
  };

  const handleRemoverAdquirente = (id: string) => {
    if (adquirentes.length > 1) {
      setAdquirentes(adquirentes.filter(adq => adq.id !== id));
      toast.success("Adquirente removido com sucesso");
    } else {
      toast.error("É necessário manter pelo menos um adquirente");
    }
  };

  const handleEditarAdquirente = (id: string, campo: keyof Adquirente, value: string | number) => {
    setAdquirentes(adquirentes.map(adq => {
      if (adq.id === id) {
        const novoValor = campo === "quantidadeTransacoes" || campo === "custoPorTransacao" 
          ? parseFloat(value.toString()) || 0 
          : value;
        
        if (campo === "quantidadeTransacoes" || campo === "custoPorTransacao") {
          const quantidadeAtual = campo === "quantidadeTransacoes" ? novoValor : adq.quantidadeTransacoes;
          const custoPorTransacaoAtual = campo === "custoPorTransacao" ? novoValor : adq.custoPorTransacao;
          const custoTotal = quantidadeAtual * custoPorTransacaoAtual;
          
          return { 
            ...adq, 
            [campo]: novoValor,
            custoTotal: custoTotal
          };
        }
        
        return { ...adq, [campo]: novoValor };
      }
      return adq;
    }));
  };

  const getCustoTotalTransacoes = () => {
    return adquirentes.reduce((sum, adq) => sum + adq.custoTotal, 0);
  };

  const getCustoTotalCalculado = () => {
    return adquirentes.reduce((sum, adq) => sum + (adq.quantidadeTransacoes * adq.custoPorTransacao), 0);
  };

  const getTotalQuantidadeTransacoes = () => {
    return adquirentes.reduce((sum, adq) => sum + adq.quantidadeTransacoes, 0);
  };

  const getCustoTotalAdquirentes = () => {
    return adquirentes.reduce((sum, adq) => sum + adq.custoTotal, 0);
  };

  const handleSalvarTransacao = () => {
    setSalvarTransacaoDialog(true);
  };

  const confirmarSalvarTransacao = async () => {
    try {
      const dadosTransacao = {
        totalTransacionado: dados.totalTransicionado,
        totalTransacoesPagas: dados.totalTransacoesPagas,
        totalSaques: dados.totalSaques,
        quantidadeTransacoes: getTotalQuantidadeTransacoes(),
        custoAdquirente: getCustoTotalAdquirentes(),
        dataCalculo: new Date(`${dataHoraSalvamento.data}T${dataHoraSalvamento.hora}`),
      };

      const response = await apiService.createTransacao(dadosTransacao);
      
      if (response.success) {
        toast.success("Transação salva com sucesso");
        setSalvarTransacaoDialog(false);
        // Recarregar transações salvas
        await buscarTransacoesSalvas();
      } else {
        toast.error(response.error || "Erro ao salvar transação");
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      toast.error("Erro ao salvar transação");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Dados de Entrada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados das Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalTransicionado">Total Transicionado (R$)</Label>
              <Input
                id="totalTransicionado"
                type="number"
                step="0.01"
                value={dados.totalTransicionado || ""}
                onChange={(e) => handleInputChange("totalTransicionado", e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalTransacoesPagas">Total de Transações Pagas</Label>
              <Input
                id="totalTransacoesPagas"
                type="number"
                step="0.01"
                value={dados.totalTransacoesPagas || ""}
                onChange={(e) => handleInputChange("totalTransacoesPagas", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSaques">Total de Saques</Label>
              <Input
                id="totalSaques"
                type="number"
                step="0.01"
                value={dados.totalSaques || ""}
                onChange={(e) => handleInputChange("totalSaques", e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Dados dos Adquirentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de Adquirentes */}
            <div className="space-y-3">
              {adquirentes.map((adquirente) => (
                <Card key={adquirente.id} className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <Input
                        value={adquirente.nome}
                        onChange={(e) => handleEditarAdquirente(adquirente.id, "nome", e.target.value)}
                        className="font-medium border-none shadow-none p-0 h-auto"
                        placeholder="Nome do adquirente"
                      />
                    </div>
                    {adquirentes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverAdquirente(adquirente.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Qtd. Transações</Label>
                      <Input
                        type="number"
                        value={adquirente.quantidadeTransacoes || ""}
                        onChange={(e) => handleEditarAdquirente(adquirente.id, "quantidadeTransacoes", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Custo por Transação (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={adquirente.custoPorTransacao || ""}
                        onChange={(e) => handleEditarAdquirente(adquirente.id, "custoPorTransacao", e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label className="text-xs text-gray-600">Custo Total (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={adquirente.custoTotal || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Botão para adicionar novo adquirente */}
            <Dialog open={novoAdquirenteDialog} onOpenChange={setNovoAdquirenteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Adquirente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Adquirente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeAdquirente">Nome</Label>
                    <Input
                      id="nomeAdquirente"
                      value={novoAdquirente.nome}
                      onChange={(e) => setNovoAdquirente({...novoAdquirente, nome: e.target.value})}
                      placeholder="Ex: Adquirente Secundário"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qtdTransacoes">Qtd. Transações</Label>
                      <Input
                        id="qtdTransacoes"
                        type="number"
                        value={novoAdquirente.quantidadeTransacoes || ""}
                        onChange={(e) => setNovoAdquirente({...novoAdquirente, quantidadeTransacoes: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custoPorTransacao">Custo por Transação (R$)</Label>
                      <Input
                        id="custoPorTransacao"
                        type="number"
                        step="0.01"
                        value={novoAdquirente.custoPorTransacao || ""}
                        onChange={(e) => setNovoAdquirente({...novoAdquirente, custoPorTransacao: parseFloat(e.target.value) || 0})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Custo total:</strong> {novoAdquirente.quantidadeTransacoes > 0 && novoAdquirente.custoPorTransacao > 0 
                        ? formatCurrency(novoAdquirente.quantidadeTransacoes * novoAdquirente.custoPorTransacao)
                        : "R$0,00"
                      }
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setNovoAdquirenteDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAdicionarAdquirente}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Resumo dos Adquirentes */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo dos Adquirentes:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total de Transações:</span>
                  <p className="font-bold text-lg">{formatNumber(getTotalQuantidadeTransacoes())}</p>
                </div>
                <div>
                  <span className="text-gray-600">Custo Total:</span>
                  <p className="font-bold text-lg text-red-600">{formatCurrency(getCustoTotalAdquirentes())}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm">
                  <span className="text-gray-600">Custo Total Calculado: </span>
                  <span className="font-bold text-lg text-orange-600">
                    {formatCurrency(getCustoTotalCalculado())}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Quantidade × Custo por Transação)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Fórmulas de Cálculo:</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <p><strong>A:</strong> Total transicionado × 4,99% (Lucro na % de transação)</p>
                <p><strong>B:</strong> (total transações pagas) × R$2,50</p>
                <p><strong>C:</strong> (total saques) × R$10</p>
                <p><strong>D:</strong> A + B + C</p>
                <p><strong>Lucro Real:</strong> D - custo total dos adquirentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cálculos Detalhados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Cálculos Detalhados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  A
                </div>
                <span className="text-sm font-medium text-blue-800">Lucro na % de Transação</span>
              </div>
              <p className="text-xs text-blue-600 mb-1">{formatCurrency(dados.totalTransicionado)} × 4,99%</p>
              <p className="text-lg font-bold text-blue-900">
                {formatCurrency(resultados.valorA)}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  B
                </div>
                <span className="text-sm font-medium text-green-800">Lucro por Transação Paga</span>
              </div>
              <p className="text-xs text-green-600 mb-1">{formatNumber(dados.totalTransacoesPagas)} × R$2,50</p>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(resultados.valorB)}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  C
                </div>
                <span className="text-sm font-medium text-orange-800">Lucro por Saque</span>
              </div>
              <p className="text-xs text-orange-600 mb-1">{formatNumber(dados.totalSaques)} × R$10</p>
              <p className="text-lg font-bold text-orange-900">
                {formatCurrency(resultados.valorC)}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  D
                </div>
                <span className="text-sm font-medium text-purple-800">Lucro Total</span>
              </div>
              <p className="text-xs text-purple-600 mb-1">A + B + C</p>
              <p className="text-lg font-bold text-purple-900">
                {formatCurrency(resultados.valorD)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado Final */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultado Parcial (Lucro Total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {formatCurrency(resultados.valorD)}
            </div>
            <p className="text-sm text-gray-600">
              Soma dos lucros A + B + C
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-600">A</p>
                <p className="font-semibold">{formatCurrency(resultados.valorA)}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-600">B</p>
                <p className="font-semibold">{formatCurrency(resultados.valorB)}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-600">C</p>
                <p className="font-semibold">{formatCurrency(resultados.valorC)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${resultados.lucroReal >= 0 ? "from-green-50 to-emerald-50 border-green-200" : "from-red-50 to-pink-50 border-red-200"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resultados.lucroReal >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              Lucro Real Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${resultados.lucroReal >= 0 ? "text-green-900" : "text-red-900"}`}>
              {formatCurrency(resultados.lucroReal)}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Valor D - Custo do Adquirente
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-600">Resultado (D)</p>
                <p className="font-semibold">{formatCurrency(resultados.valorD)}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-600">Custo Adquirente</p>
                <p className="font-semibold text-red-600">-{formatCurrency(getCustoTotalAdquirentes())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Completo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Completo do Cálculo
          </CardTitle>
          <Button onClick={handleSalvarTransacao} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Cálculo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Dados de Entrada:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Transicionado:</span>
                    <span className="font-medium">{formatCurrency(dados.totalTransicionado)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transações Pagas:</span>
                    <span className="font-medium">{formatNumber(dados.totalTransacoesPagas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Saques:</span>
                    <span className="font-medium">{formatNumber(dados.totalSaques)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Adquirentes ({adquirentes.length}):</h4>
                <div className="space-y-2 text-sm">
                  {adquirentes.map((adquirente, index) => (
                    <div key={adquirente.id} className="border-l-2 border-blue-200 pl-3">
                      <div className="font-medium text-blue-800">{adquirente.nome}</div>
                      <div className="flex justify-between">
                        <span>Qtd. Transações:</span>
                        <span className="font-medium">{formatNumber(adquirente.quantidadeTransacoes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custo Total:</span>
                        <span className="font-medium text-red-600">{formatCurrency(adquirente.custoTotal)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Custo Total Adquirentes:</span>
                      <span className="text-red-600">{formatCurrency(getCustoTotalAdquirentes())}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Cálculos Intermediários:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lucro na % de transação (A):</span>
                    <span className="font-medium">{formatCurrency(resultados.valorA)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor B (Taxa R$2,50):</span>
                    <span className="font-medium">{formatCurrency(resultados.valorB)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor C (Taxa R$10):</span>
                    <span className="font-medium">{formatCurrency(resultados.valorC)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lucro Total (A + B + C):</span>
                    <span className="font-medium">{formatCurrency(resultados.valorD)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span className={resultados.lucroReal >= 0 ? "text-green-600" : "text-red-600"}>
                      Lucro Real:
                    </span>
                    <span className={resultados.lucroReal >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(resultados.lucroReal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para Salvar Transação */}
      <Dialog open={salvarTransacaoDialog} onOpenChange={setSalvarTransacaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Cálculo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataSalvamento">Data do Cálculo</Label>
                <Input
                  id="dataSalvamento"
                  type="date"
                  value={dataHoraSalvamento.data}
                  onChange={(e) => setDataHoraSalvamento({...dataHoraSalvamento, data: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaSalvamento">Hora do Cálculo</Label>
                <Input
                  id="horaSalvamento"
                  type="time"
                  value={dataHoraSalvamento.hora}
                  onChange={(e) => setDataHoraSalvamento({...dataHoraSalvamento, hora: e.target.value})}
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Resumo do cálculo:</strong>
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Lucro Real:</span>
                  <span className="font-bold">{formatCurrency(resultados.lucroReal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data/Hora:</span>
                  <span className="font-bold">
                    {new Date(`${dataHoraSalvamento.data}T${dataHoraSalvamento.hora}`).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSalvarTransacaoDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={confirmarSalvarTransacao}>
                Salvar Cálculo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transações Salvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Transações Salvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transacoesSalvas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação salva</p>
              <p className="text-sm">Faça um cálculo e salve-o usando o botão acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transacoesSalvas.map((transacao) => (
                <Card key={transacao.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">Transação</h3>
                        <span className={`font-bold text-lg ${transacao.lucroReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(transacao.lucroReal)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(transacao.dataCalculo).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(transacao.dataCalculo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}