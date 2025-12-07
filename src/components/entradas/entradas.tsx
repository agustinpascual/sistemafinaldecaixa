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
  TrendingUp,
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiService } from "@/lib/services/api";
import { toast } from "sonner";

interface Entrada {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  hora: string;
}

interface ResumoEntradas {
  valorTotal: number;
  quantidade: number;
}

export function Entradas() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [resumo, setResumo] = useState<ResumoEntradas>({
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
  const [editando, setEditando] = useState<Entrada | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data: format(new Date(), "yyyy-MM-dd"),
    hora: format(new Date(), "HH:mm"),
  });

  const buscarEntradas = async () => {
    try {
      const response = await apiService.getEntradas(dataInicial, dataFinal);
      
      if (response.success && response.data) {
        // A API retorna os dados diretamente em response.data
        setEntradas(response.data || []);
        setResumo(response.resumo || {
          valorTotal: 0,
          quantidade: 0,
        });
      } else {
        console.error("Erro ao buscar entradas:", response.error);
        toast.error("Erro ao buscar entradas");
      }
    } catch (error) {
      console.error("Erro ao buscar entradas:", error);
      toast.error("Erro ao buscar entradas");
    }
  };

  useEffect(() => {
    buscarEntradas();
  }, [dataInicial, dataFinal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.data || !formData.hora) {
      toast.error("Por favor, preencha todos os campos!");
      return;
    }
    
    try {
      const dadosEntrada = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data: formData.data,
        hora: formData.hora,
      };

      let response;
      if (editando) {
        response = await apiService.updateEntrada(editando.id, dadosEntrada);
      } else {
        response = await apiService.createEntrada(dadosEntrada);
      }

      if (response.success) {
        toast.success(editando ? "Entrada atualizada com sucesso" : "Entrada criada com sucesso");
        await buscarEntradas();
        
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
        toast.error(response.error || "Erro ao salvar entrada");
      }
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      toast.error("Erro ao salvar entrada");
    }
  };

  const handleEdit = (entrada: Entrada) => {
    setEditando(entrada);
    setFormData({
      descricao: entrada.descricao,
      valor: entrada.valor.toString(),
      data: entrada.data,
      hora: entrada.hora,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiService.deleteEntrada(id);
      
      if (response.success) {
        toast.success("Entrada excluída com sucesso");
        await buscarEntradas();
      } else {
        toast.error(response.error || "Erro ao excluir entrada");
      }
    } catch (error) {
      console.error("Erro ao excluir entrada:", error);
      toast.error("Erro ao excluir entrada");
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
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
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
            <TrendingUp className="h-4 w-4 text-blue-600" />
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

      {/* Lista de Entradas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Entradas</CardTitle>
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
                Nova Entrada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editando ? "Editar Entrada" : "Nova Entrada"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Venda de produtos"
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
          {entradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma entrada encontrada</p>
              <p className="text-sm">Adicione sua primeira entrada usando o botão acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entradas.map((entrada) => (
                <Card key={entrada.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{entrada.descricao}</h3>
                        <span className="text-green-600 font-bold text-lg">
                          {formatCurrency(entrada.valor)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(entrada.data), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {entrada.hora}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(entrada)}
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
                              Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(entrada.id)}>
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