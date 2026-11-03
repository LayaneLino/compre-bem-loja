import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_PRODUTOS = `${HOST}/api/v1/produtos`;

// Mesmo formato do ProdutoResponseDTO da API
export type Produto = {
  produtoId: string;
  nome: string;
  preco: number;
  descricao?: string | null;
  categoria?: string | null;
  imagem?: string | null;
  quantidade?: number | null;
};

// Formato da página devolvida pelo Spring com serialization-mode=via_dto
export type Page<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export async function buscarProdutos(pagina = 0, filtro = '', tamanho = 10): Promise<Page<Produto>> {
  const params = new URLSearchParams({
    page: String(pagina),
    size: String(tamanho),
    sort: 'nome,asc',
  });
  if (filtro.trim() !== '') params.append('filtro', filtro.trim());

  const resposta = await fetch(`${API_PRODUTOS}/filtro?${params.toString()}`);
  if (!resposta.ok) {
    throw new Error(`A API respondeu com status ${resposta.status}`);
  }
  return resposta.json();
}

export async function buscarProdutoPorId(produtoId: string): Promise<Produto> {
  const resposta = await fetch(`${API_PRODUTOS}/${produtoId}`);
  if (!resposta.ok) {
    throw new Error(`A API respondeu com status ${resposta.status}`);
  }
  return resposta.json();
}

export type NovoProduto = {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
  categoria?: string;
};

export async function cadastrarProduto(novo: NovoProduto): Promise<Produto> {
  const resposta = await fetch(API_PRODUTOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novo),
  });
  if (!resposta.ok) {
    throw new Error(`A API respondeu com status ${resposta.status}`);
  }
  return resposta.json();
}

export function formatarPreco(valor: number): string {
  const [inteiro, centavos] = Number(valor).toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
}
