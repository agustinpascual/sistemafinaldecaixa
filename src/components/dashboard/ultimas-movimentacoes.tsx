"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UltimaEntrada {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  hora: string;
}

interface UltimaSaida {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  hora: string;
}

interface UltimasMovimentacoesProps {
  entradas: UltimaEntrada[];
  saidas: UltimaSaida[];
}

export function UltimasMovimentacoes({ entradas, saidas }: UltimasMovimentacoesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Últimas Entradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Últimas Entradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma entrada encontrada</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {entradas.slice(0, 5).map((entrada) => (
                <div key={entrada.id} className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-green-900">{entrada.descricao}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Entrada
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entrada.data), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {entrada.hora}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-green-600 font-bold text-lg">
                      {formatCurrency(entrada.valor)}
                    </span>
                  </div>
                </div>
              ))}
              {entradas.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    +{entradas.length - 5} outras entradas
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Últimas Saídas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Últimas Saídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {saidas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma saída encontrada</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {saidas.slice(0, 5).map((saida) => (
                <div key={saida.id} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-red-900">{saida.descricao}</h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Saída
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(saida.data), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {saida.hora}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-red-600 font-bold text-lg">
                      {formatCurrency(saida.valor)}
                    </span>
                  </div>
                </div>
              ))}
              {saidas.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    +{saidas.length - 5} outras saídas
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}