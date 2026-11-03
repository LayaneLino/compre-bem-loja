import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaListaProdutos, { type Produto, produtosIniciais } from './TelaListaProdutos';
import TelaDetalheProduto from './TelaDetalheProduto';

export type RootStackParamList = {
  ListaProdutos: undefined;
  DetalheProduto: { produto: Produto };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais);

  function adicionarProduto(produto: Produto) {
      setProdutos((atual) => [...atual, produto]);
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaProdutos">
        <Stack.Screen name="ListaProdutos">
          {(props) => (
            <TelaListaProdutos
              {...props}
              produtos={produtos}
              onAdicionarProduto={adicionarProduto}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="DetalheProduto">
          {(props) => (
            <TelaDetalheProduto
              {...props}
              produtos={produtos}
            />
          )}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}