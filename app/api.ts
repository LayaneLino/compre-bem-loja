import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_PRODUTOS = `${HOST}/api/v1/produtos`;

export type Produto = {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
  categoria?: string;
  imagem?: string;
  quantidade?: number;
};

type ProdutoApi = {
  produtoId: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  imagem: string | null;
  quantidade?: number | null;
};

type RespostaPaginada<T> = {
  content: T[];
  last?: boolean;
  number?: number;
  totalPages?: number;
  page?: { number: number; totalPages: number };
};

export type PaginaProdutos = {
  produtos: Produto[];
  pagina: number;
  temMais: boolean;
};

function paraProduto(p: ProdutoApi): Produto {
  return {
    id: p.produtoId,
    nome: p.nome,
    preco: Number(p.preco),
    descricao: p.descricao ?? undefined,
    categoria: p.categoria ?? undefined,
    imagem: p.imagem ?? undefined,
    quantidade: p.quantidade ?? undefined,
  };
}

export async function buscarProdutos(pagina = 0, busca = '', tamanho = 10): Promise<PaginaProdutos> {
  const params = new URLSearchParams({
    page: String(pagina),
    size: String(tamanho),
    sort: 'nome,asc',
  });
  if (busca.trim() !== '') params.append('busca', busca.trim());

  const resposta = await fetch(`${API_PRODUTOS}?${params.toString()}`);
  if (!resposta.ok) {
    throw new Error(`A API respondeu com status ${resposta.status}`);
  }

  const dados: RespostaPaginada<ProdutoApi> = await resposta.json();
  const paginaAtual = dados.page?.number ?? dados.number ?? pagina;
  const totalPaginas = dados.page?.totalPages ?? dados.totalPages ?? 1;

  return {
    produtos: (dados.content ?? []).map(paraProduto),
    pagina: paginaAtual,
    temMais: typeof dados.last === 'boolean' ? !dados.last : paginaAtual + 1 < totalPaginas,
  };
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
  return paraProduto(await resposta.json());
}

export function formatarPreco(valor: number): string {
  const [inteiro, centavos] = valor.toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
}
