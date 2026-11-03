import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './App';
import { buscarProdutos, cadastrarProduto, formatarPreco, type Produto } from './api';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaProdutos'>;

const CHAVE_FAVORITOS = '@compre_bem:favoritos';
const CHAVE_BUSCA = '@compre_bem:ultima_busca';

function TelaListaProdutos({ navigation }: Props) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [buscaRestaurada, setBuscaRestaurada] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_FAVORITOS).then((salvo) => {
      if (salvo) {
        try {
          const arrayParseado = JSON.parse(salvo);
          if (Array.isArray(arrayParseado)) {
            setFavoritos(arrayParseado.filter((id) => typeof id === 'string'));
          }
        } catch (e) {
          console.error('Erro ao ler favoritos do AsyncStorage', e);
        }
      }
    });

    AsyncStorage.getItem(CHAVE_BUSCA)
      .then((salvo) => {
        if (salvo !== null) setBusca(salvo);
      })
      .finally(() => setBuscaRestaurada(true));
  }, []);

  function alternarFavorito(id: string) {
    setFavoritos((atual) => {
      const novo = atual.includes(id) ? atual.filter((favId) => favId !== id) : [...atual, id];
      AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(novo));
      return novo;
    });
  }

  function atualizarBusca(texto: string) {
    setBusca(texto);
    AsyncStorage.setItem(CHAVE_BUSCA, texto);
  }

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [erroApi, setErroApi] = useState('');

  const ultimaRequisicao = useRef(0);

  const carregarPagina = useCallback(async (numero: number, termo: string, substituir: boolean) => {
    const requisicao = ++ultimaRequisicao.current;
    setCarregando(true);
    setErroApi('');

    try {
      const resultado = await buscarProdutos(numero, termo);
      if (requisicao !== ultimaRequisicao.current) return;

      setProdutos((atual) => (substituir ? resultado.produtos : [...atual, ...resultado.produtos]));
      setPagina(resultado.pagina);
      setTemMais(resultado.temMais);
    } catch (e) {
      if (requisicao !== ultimaRequisicao.current) return;
      console.error('Erro ao buscar produtos na API', e);
      setErroApi('Não foi possível carregar os produtos. Confira se a API está rodando e o endereço em api.ts.');
    } finally {
      if (requisicao === ultimaRequisicao.current) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!buscaRestaurada) return;
    const timer = setTimeout(() => carregarPagina(0, busca, true), 400);
    return () => clearTimeout(timer);
  }, [busca, buscaRestaurada, carregarPagina]);

  function carregarMais() {
    if (carregando || !temMais || erroApi !== '' || produtos.length === 0) return;
    carregarPagina(pagina + 1, busca, false);
  }

  function atualizarLista() {
    setAtualizando(true);
    carregarPagina(0, busca, true);
  }

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const inputPrecoRef = useRef<TextInput>(null);
  const [quantidade, setQuantidade] = useState('');
  const inputQuantidadeRef = useRef<TextInput>(null);
  const [descricao, setDescricao] = useState('');
  const inputDescricaoRef = useRef<TextInput>(null);

  async function validarESalvar() {
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

    setSalvando(true);
    try {
      await cadastrarProduto({
        nome: nome.trim(),
        preco: precoNumerico,
        descricao: descricao.trim() !== '' ? descricao.trim() : 'Sem descrição.',
        quantidade: quantidadeNumerica,
      });

      setNome('');
      setPreco('');
      setQuantidade('');
      setDescricao('');
      setErro('');
      Keyboard.dismiss();
      carregarPagina(0, busca, true);
    } catch (e) {
      console.error('Erro ao cadastrar produto na API', e);
      setErro('A API não aceitou o cadastro. Confira se ela está rodando.');
    } finally {
      setSalvando(false);
    }
  }

  function renderizarVazio() {
    if (carregando) {
      return <ActivityIndicator style={styles.espaco} size="large" color="#007AFF" />;
    }
    if (erroApi !== '') {
      return (
        <View style={styles.espaco}>
          <Text style={styles.erro}>{erroApi}</Text>
          <TouchableOpacity style={styles.botaoTentar} onPress={() => carregarPagina(0, busca, true)}>
            <Text style={styles.textoBotaoTentar}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <Text style={[styles.aviso, styles.espaco]}>
        {busca.trim() !== '' ? `Nenhum produto encontrado para "${busca.trim()}".` : 'Nenhum produto cadastrado.'}
      </Text>
    );
  }

  function renderizarRodape() {
    if (produtos.length === 0) return null;
    if (carregando && !atualizando) {
      return <ActivityIndicator style={styles.espaco} color="#007AFF" />;
    }
    if (erroApi !== '') {
      return (
        <TouchableOpacity style={[styles.botaoTentar, styles.espaco]} onPress={carregarMais}>
          <Text style={styles.textoBotaoTentar}>Erro ao carregar mais. Tentar de novo</Text>
        </TouchableOpacity>
      );
    }
    if (!temMais) {
      return <Text style={[styles.aviso, styles.espaco]}>Fim da lista.</Text>;
    }
    return null;
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
        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && { opacity: 0.6 }]}
          onPress={validarESalvar}
          disabled={salvando}
        >
          <Text style={styles.textoBotaoSalvar}>{salvando ? 'Salvando...' : 'Cadastrar produto'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizarLista} />}
        ListEmptyComponent={renderizarVazio}
        ListFooterComponent={renderizarRodape}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.itemConteudo}
              onPress={() => navigation.navigate('DetalheProduto', { produto: item })}
            >
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.preco}>{formatarPreco(item.preco)}</Text>
              {item.categoria && <Text style={styles.detalhe}>{item.categoria}</Text>}
              {item.quantidade !== undefined && (
                <Text style={styles.detalhe}>Estoque: {item.quantidade} unidades</Text>
              )}
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
  detalhe: {
    fontSize: 12,
    color: '#666'
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
  espaco: {
    margin: 24,
  },
  aviso: {
    textAlign: 'center',
    color: '#666',
  },
  botaoTentar: {
    marginTop: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  textoBotaoTentar: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default TelaListaProdutos;
