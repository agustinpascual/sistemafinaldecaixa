"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingDown,
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiService } from "@/lib/services/api";
import { toast } from "sonner";

interface Saida {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  hora: string;
}

interface ResumoSaidas {
  valorTotal: number;
  quantidade: number;
}

export function Saidas() {
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [resumo, setResumo] = useState<ResumoSaidas>({
    valorTotal: 0,
    quantidade: 0,
  });
  const [dataInicial, setDataInicial] = useState(
    format(new Date(new Date().setDate(1)), "yyyy-MM-dd")
  );
  const [dataFinal, setDataFinal] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Saida | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data: format(new Date(), "yyyy-MM-dd"),
    hora: format(new Date(), "HH:mm"),
  });

  const buscarSaidas = async () => {
    try {
      const response = await apiService.getSaidas(dataInicial, dataFinal);
      
      if (response.success && response.data) {
        // A API retorna os dados diretamente em response.data
        setSaidas(response.data || []);
        setResumo(response.resumo || {
          valorTotal: 0,
          quantidade: 0,
        });
      } else {
        console.error("Erro ao buscar saídas:", response.error);
        toast.error("Erro ao buscar saídas");
      }
    } catch (error) {
      console.error("Erro ao buscar saídas:", error);
      toast.error("Erro ao buscar saídas");
    }
  };

  useEffect(() => {
    buscarSaidas();
  }, [dataInicial, dataFinal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.data || !formData.hora) {
      toast.error("Por favor, preencha todos os campos!");
      return;
    }
    
    try {
      const dadosSaida = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data: formData.data,
        hora: formData.hora,
      };

      let response;
      if (editando) {
        response = await apiService.updateSaida(editando.id, dadosSaida);
      } else {
        response = await apiService.createSaida(dadosSaida);
      }

      if (response.success) {
        toast.success(editando ? "Saída atualizada com sucesso" : "Saída criada com sucesso");
        await buscarSaidas();
        
        // Resetar formulário
        setFormData({
          descricao: "",
          valor: "",
          data: format(new Date(), "yyyy-MM-dd"),
          hora: format(new Date(), "HH:mm"),
        });
        setEditando(null);
        setDialogOpen(false);
      } else {
        toast.error(response.error || "Erro ao salvar saída");
      }
    } catch (error) {
      console.error("Erro ao salvar saída:", error);
      toast.error("Erro ao salvar saída");
    }
  };

  const handleEdit = (saida: Saida) => {
    setEditando(saida);
    setFormData({
      descricao: saida.descricao,
      valor: saida.valor.toString(),
      data: saida.data,
      hora: saida.hora,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiService.deleteSaida(id);
      
      if (response.success) {
        toast.success("Saída excluída com sucesso");
        await buscarSaidas();
      } else {
        toast.error(response.error || "Erro ao excluir saída");
      }
    } catch (error) {
      console.error("Erro ao excluir saída:", error);
      toast.error("Erro ao excluir saída");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtro por Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Valor Total */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(resumo.valorTotal)}
            </div>
          </CardContent>
        </Card>

        {/* Quantidade */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Quantidade
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {resumo.quantidade}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              lançamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Saídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saídas</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditando(null);
                setFormData({
                  descricao: "",
                  valor: "",
                  data: format(new Date(), "yyyy-MM-dd"),
                  hora: format(new Date(), "HH:mm"),
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Saída
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editando ? "Editar Saída" : "Nova Saída"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Aluguel do escritório"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editando ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {saidas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma saída encontrada</p>
              <p className="text-sm">Adicione sua primeira saída usando o botão acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {saidas.map((saida) => (
                <Card key={saida.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{saida.descricao}</h3>
                        <span className="text-red-600 font-bold text-lg">
                          {formatCurrency(saida.valor)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(saida.data), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {saida.hora}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(saida)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta saída? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(saida.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}