import { useState } from 'react';
import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './App';
import { formatarPreco, type Produto } from './api';

function imagemReserva(produto: Produto): ImageSourcePropType {
  const nome = produto.nome.toLowerCase();
  if (nome.includes('cadeira')) return require('./assets/produto-cadeira.png');
  if (nome.includes('mesa')) return require('./assets/produto-mesa.png');
  if (nome.includes('lumin')) return require('./assets/produto-luminaria.png');
  return require('./assets/produto-suporte.png');
}

function DetalheProduto({ produto }: { produto: Produto }) {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const fonteImagem =
    produto.imagem && !imagemFalhou ? { uri: produto.imagem } : imagemReserva(produto);

  return (
    <View style={styles.container}>
      <Image source={fonteImagem} style={styles.imagem} onError={() => setImagemFalhou(true)} />
      {produto.categoria && <Text style={styles.categoria}>{produto.categoria}</Text>}
      <Text style={styles.nome}>{produto.nome}</Text>
      <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>
      {produto.descricao && <Text style={styles.descricao}>{produto.descricao}</Text>}
    </View>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'DetalheProduto'>;

function TelaDetalheProduto({ route }: Props) {
  const { produto } = route.params;

  return <DetalheProduto produto={produto} />;
}

export default TelaDetalheProduto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  imagem: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  categoria: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
  preco: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 4,
  },
  descricao: {
    fontSize: 15,
    color: '#4A4A4A',
    marginTop: 12,
    lineHeight: 22,
  },
});
