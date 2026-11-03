import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, TextInput, TouchableOpacity, Text, View, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './App';

export type Produto = {
  id: number;
  nome: string;
  preco: string;
  descricao?: string;
  imagem?: number;
  quantidade?: number;
};

export const produtosIniciais: Produto[] = [
  {
    id: 1,
    nome: 'Cadeira Confort Plus',
    preco: 'R$ 349,90',
    descricao: 'Cadeira ergonômica estofada, ideal para home office. Estrutura reforçada e altura regulável.',
    imagem: require('./assets/produto-cadeira.png'),
    quantidade: 12,
  },
  {
    id: 2,
    nome: 'Mesa Escritório Slim',
    preco: 'R$ 459,00',
    descricao: 'Mesa compacta com acabamento em MDF, ideal para espaços pequenos.',
    imagem: require('./assets/produto-mesa.png'),
    quantidade: 10,
  },
  {
    id: 3,
    nome: 'Luminária de Mesa LED',
    preco: 'R$ 89,90',
    descricao: 'Luminária com 3 níveis de intensidade e braço flexível.',
    imagem: require('./assets/produto-luminaria.png'),
    quantidade: 8,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'ListaProdutos'> & {
  produtos: Produto[];
  onAdicionarProduto: (produto: Produto) => void;
};

const CHAVE_FAVORITOS = '@compre_bem:favoritos';
const CHAVE_BUSCA = '@compre_bem:ultima_busca';

function TelaListaProdutos({ navigation, produtos, onAdicionarProduto }: Props) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_FAVORITOS).then((salvo) => {
      if (salvo) {
        try {
          const arrayParseado = JSON.parse(salvo);
          if (Array.isArray(arrayParseado)) {
            setFavoritos(arrayParseado);
          }
        } catch (e) {
          console.error("Erro ao ler favoritos do AsyncStorage", e);
        }
      }
    });

    AsyncStorage.getItem(CHAVE_BUSCA).then((salvo) => {
      if (salvo !== null) setBusca(salvo);
    });
  }, []);

  function alternarFavorito(id: number) {
    setFavoritos((atual) => {
      const listaAtual = Array.isArray(atual) ? atual : [];
      const novo = listaAtual.includes(id)
        ? listaAtual.filter((favId) => favId !== id)
        : [...listaAtual, id];

      AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(novo));
      return novo;
    });
  }

  function atualizarBusca(texto: string) {
    setBusca(texto);
    AsyncStorage.setItem(CHAVE_BUSCA, texto);
  }

  const produtosFiltrados = useMemo(() => {
    const listaSegura = produtos || [];
    const termoBusca = busca || '';

    return listaSegura.filter((item) =>
      item.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [produtos, busca]);

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [erro, setErro] = useState('');
  const inputPrecoRef = useRef<TextInput>(null);
  const [quantidade, setQuantidade] = useState('');
  const inputQuantidadeRef = useRef<TextInput>(null);
  const [descricao, setDescricao] = useState('');
  const inputDescricaoRef = useRef<TextInput>(null);

  function validarESalvar() {
    if (nome.trim() === '') {
      setErro('O nome não pode ficar vazio!');
      return;
    }

    const precoNumerico = Number(preco.trim().replace(',', '.'));

    if (preco.trim() === '' || isNaN(precoNumerico) || precoNumerico <= 0) {
      setErro('O preço precisa ser um número maior que zero!');
      return;
    }

    const quantidadeNumerica = Number(quantidade.trim());
    if (
      quantidade.trim() === '' ||
      isNaN(quantidadeNumerica) ||
      quantidadeNumerica < 0 ||
      !Number.isInteger(quantidadeNumerica)
    ) {
      setErro('A quantidade em estoque deve ser um número inteiro!');
      return;
    }

    onAdicionarProduto({
      id: Date.now(),
      nome,
      preco: `R$ ${precoNumerico.toFixed(2).replace('.', ',')}`,
      descricao: descricao.trim() !== '' ? descricao : 'Sem descrição.',
      imagem: require('./assets/produto-suporte.png'),
      quantidade: quantidadeNumerica,
    });

    setNome('');
    setPreco('');
    setQuantidade('');
    setDescricao('');
    setErro('');
    Keyboard.dismiss();
  }

  return (
    <View style={styles.container}>
      <View style={styles.cadastro}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar produto..."
          value={busca}
          onChangeText={atualizarBusca}
        />

        <TextInput
          style={styles.input}
          placeholder="Nome do novo produto"
          value={nome}
          onChangeText={setNome}
          returnKeyType="next"
          onSubmitEditing={() => inputPrecoRef.current?.focus()}
        />

        <View style={styles.linhaFormulario}>
          <TextInput
            ref={inputPrecoRef}
            style={[styles.input, styles.inputMetade]}
            placeholder="Preço"
            value={preco}
            onChangeText={setPreco}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onSubmitEditing={() => inputQuantidadeRef.current?.focus()}
          />

          <TextInput
            ref={inputQuantidadeRef}
            style={[styles.input, styles.inputMetade]}
            placeholder="Qtd."
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => inputDescricaoRef.current?.focus()}
          />
        </View>

        <TextInput
          ref={inputDescricaoRef}
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          placeholder="Descrição do produto (opcional)"
          value={descricao}
          onChangeText={setDescricao}
          multiline={true}
        />

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}
        <TouchableOpacity style={styles.botaoSalvar} onPress={validarESalvar}>
          <Text style={styles.textoBotaoSalvar}>Cadastrar produto</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.itemConteudo}
              onPress={() => navigation.navigate('DetalheProduto', { produto: item })}
            >
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.preco}>{item.preco}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Estoque: {item.quantidade} unidades</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoFavorito} onPress={() => alternarFavorito(item.id)}>
              <Text style={styles.favoritoTexto}>{favoritos.includes(item.id) ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  inputBusca: {
    margin: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    fontSize: 16,
  },
  cadastro: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    minHeight: 44
  },
  linhaFormulario: {
    flexDirection: 'row',
    gap: 8,
  },
  inputMetade: {
    flex: 1,
  },
  erro: {
    color: '#C62828',
    fontWeight: '500'
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  itemConteudo: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600'
  },
  preco: {
    fontSize: 14,
    color: '#2E7D32'
  },
  botaoSalvar: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoSalvar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botaoFavorito: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  favoritoTexto: {
    fontSize: 22,
    color: '#C62828'
  },
});

export default TelaListaProdutos;