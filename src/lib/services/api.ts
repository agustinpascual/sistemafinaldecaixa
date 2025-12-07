import { ApiResponse } from "@/hooks/use-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api${endpoint}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão",
      };
    }
  }

  // Dashboard
  async getDashboard(dataInicial?: string, dataFinal?: string) {
    const params = new URLSearchParams();
    if (dataInicial) params.append("dataInicial", dataInicial);
    if (dataFinal) params.append("dataFinal", dataFinal);
    
    return this.request(`/dashboard?${params.toString()}`);
  }

  // Entradas
  async getEntradas(dataInicial?: string, dataFinal?: string) {
    const params = new URLSearchParams();
    if (dataInicial) params.append("dataInicial", dataInicial);
    if (dataFinal) params.append("dataFinal", dataFinal);
    
    return this.request(`/entradas?${params.toString()}`);
  }

  async createEntrada(data: {
    descricao: string;
    valor: number;
    data: string;
    hora: string;
  }) {
    return this.request("/entradas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEntrada(id: string, data: {
    descricao: string;
    valor: number;
    data: string;
    hora: string;
  }) {
    return this.request(`/entradas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEntrada(id: string) {
    return this.request(`/entradas/${id}`, {
      method: "DELETE",
    });
  }

  // Saídas
  async getSaidas(dataInicial?: string, dataFinal?: string) {
    const params = new URLSearchParams();
    if (dataInicial) params.append("dataInicial", dataInicial);
    if (dataFinal) params.append("dataFinal", dataFinal);
    
    return this.request(`/saidas?${params.toString()}`);
  }

  async createSaida(data: {
    descricao: string;
    valor: number;
    data: string;
    hora: string;
  }) {
    return this.request("/saidas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSaida(id: string, data: {
    descricao: string;
    valor: number;
    data: string;
    hora: string;
  }) {
    return this.request(`/saidas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSaida(id: string) {
    return this.request(`/saidas/${id}`, {
      method: "DELETE",
    });
  }

  // Transações
  async getTransacoes() {
    return this.request("/transacoes");
  }

  async createTransacao(data: {
    totalTransacionado: number;
    totalTransacoesPagas: number;
    totalSaques: number;
    quantidadeTransacoes: number;
    custoAdquirente: number;
  }) {
    return this.request("/transacoes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Últimas Movimentações
  async getUltimasMovimentacoes(dataInicial?: string, dataFinal?: string, limit?: number) {
    const params = new URLSearchParams();
    if (dataInicial) params.append("dataInicial", dataInicial);
    if (dataFinal) params.append("dataFinal", dataFinal);
    if (limit) params.append("limit", limit.toString());
    
    return this.request(`/ultimas-movimentacoes?${params.toString()}`);
  }
}

export const apiService = new ApiService();