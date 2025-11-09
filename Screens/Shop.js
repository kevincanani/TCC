import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Shop() {
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [itensComprados, setItensComprados] = useState([]);
  const [pontosGastos, setPontosGastos] = useState(0);

  const [shopItems] = useState([
    {
      id: 1,
      name: 'Chapéu Pirata',
      categoria: 'Acessórios',
      price: 25,
      icon: '🏴‍☠️',
      color: '#8B5CF6',
      imagemMascote: 'bicho_chapeu'
    },
    {
      id: 2,
      name: 'Óculos de Sol',
      categoria: 'Acessórios',
      price: 15,
      icon: '🕶️',
      color: '#06B6D4',
      imagemMascote: 'bicho_oculos'
    },
    {
      id: 3,
      name: 'Gravata Borboleta',
      categoria: 'Acessórios',
      price: 20,
      icon: '🎀',
      color: '#F97316',
      imagemMascote: 'bicho_gravata'
    },
  ]);

  useEffect(() => {
    carregarDados();
    
    // Atualiza dados periodicamente
    const interval = setInterval(carregarDados, 1000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Carrega pontos totais das tasks
      const tasksData = await AsyncStorage.getItem('objetivos');
      let pontosTotal = 0;
      if (tasksData) {
        const tasks = JSON.parse(tasksData);
        pontosTotal = tasks.filter(t => t.finalizado).reduce((sum, t) => sum + (t.pontos || 5), 0);
      }

      // Carrega pontos gastos
      const gastosData = await AsyncStorage.getItem('pontosGastos');
      const gastos = gastosData ? parseInt(gastosData) : 0;
      setPontosGastos(gastos);

      // Calcula pontos disponíveis
      const pontosDisponiveis = pontosTotal - gastos;
      setPontosUsuario(pontosDisponiveis);

      // Carrega itens comprados
      const itensData = await AsyncStorage.getItem('itensComprados');
      if (itensData) {
        setItensComprados(JSON.parse(itensData));
      }
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    }
  };

  const salvarItensComprados = async (novosItens) => {
    try {
      await AsyncStorage.setItem('itensComprados', JSON.stringify(novosItens));
    } catch (error) {
      console.log('Erro ao salvar itens:', error);
    }
  };

  const salvarPontosGastos = async (novoTotal) => {
    try {
      await AsyncStorage.setItem('pontosGastos', novoTotal.toString());
      setPontosGastos(novoTotal);
    } catch (error) {
      console.log('Erro ao salvar pontos gastos:', error);
    }
  };

  const salvarImagemMascote = async (imagemId) => {
    try {
      await AsyncStorage.setItem('imagemMascoteAtual', imagemId);
      console.log('Imagem do mascote salva:', imagemId);
    } catch (error) {
      console.log('Erro ao salvar imagem do mascote:', error);
    }
  };

  const purchaseItem = async (item) => {
    // Verifica se já foi comprado
    if (itensComprados.includes(item.id)) {
      Alert.alert('Já comprado!', 'Você já possui este item! 😊');
      return;
    }

    // Verifica se tem pontos suficientes
    if (pontosUsuario < item.price) {
      Alert.alert(
        'Pontos insuficientes! ⚡', 
        `Você precisa de ${item.price} pontos, mas tem apenas ${pontosUsuario} pontos.\n\nComplete mais tarefas para ganhar pontos!`
      );
      return;
    }

    // Confirma a compra
    Alert.alert(
      'Confirmar compra?',
      `Deseja comprar ${item.name} por ${item.price} pontos?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Comprar',
          onPress: async () => {
            try {
              // Adiciona item aos comprados
              const novosItensComprados = [...itensComprados, item.id];
              setItensComprados(novosItensComprados);
              await salvarItensComprados(novosItensComprados);

              // Desconta os pontos
              const novosPontosGastos = pontosGastos + item.price;
              await salvarPontosGastos(novosPontosGastos);
              
              // Atualiza pontos localmente
              const novoPontoDisponivel = pontosUsuario - item.price;
              setPontosUsuario(novoPontoDisponivel);

              // Salva a imagem do mascote (se o item tiver)
              if (item.imagemMascote) {
                await salvarImagemMascote(item.imagemMascote);
              }

              // Mostra mensagem de sucesso
              Alert.alert(
                'Compra realizada! 🎉',
                `Você comprou ${item.name}!\n\nPontos restantes: ${novoPontoDisponivel} ⚡\n\n${item.imagemMascote ? 'Volte para a tela inicial para ver seu mascote com o novo acessório!' : ''}`
              );

              // Recarrega dados para garantir sincronização
              setTimeout(() => carregarDados(), 500);
            } catch (error) {
              console.log('Erro ao comprar item:', error);
              Alert.alert('Erro', 'Não foi possível comprar o item. Tente novamente!');
            }
          }
        }
      ]
    );
  };

  const renderShopItem = (item) => {
    const foiComprado = itensComprados.includes(item.id);
    const podeComprar = pontosUsuario >= item.price;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.shopItem,
          foiComprado && styles.purchasedItem
        ]}
        onPress={() => purchaseItem(item)}
        activeOpacity={0.8}
        disabled={foiComprado}
      >
        <View style={styles.itemContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, foiComprado && styles.itemNameComprado]}>
              {item.name}
            </Text>
            <Text style={styles.itemcategoria}>{item.categoria}</Text>
            {foiComprado && (
              <Text style={styles.itemCompradoLabel}>✓ Comprado</Text>
            )}
          </View>

          <View style={styles.itemRight}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{item.price}</Text>
              <Text style={styles.pontosIcone}>⚡</Text>
            </View>
            
            <View style={[
              styles.purchaseButton,
              foiComprado ? styles.ownedButton : 
              podeComprar ? styles.buyButton : styles.cantAffordButton
            ]}>
              {foiComprado ? (
                <Text style={styles.ownedText}>✓ Seu</Text>
              ) : podeComprar ? (
                <Text style={styles.buyText}>Comprar</Text>
              ) : (
                <Text style={styles.cantAffordText}>Bloqueado</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#9C27B0" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🛍️ Loja</Text>
          <View style={styles.pontosDisplay}>
            <Text style={styles.pontosTexto}>{pontosUsuario}</Text>
            <Text style={styles.pontosIcone}>⚡</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Complete tarefas para ganhar pontos!
        </Text>
      </View>

      <ScrollView 
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoText}>
            Compre acessórios para personalizar seu mascote!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Todos os itens</Text>
        
        {shopItems.map(renderShopItem)}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddffbc',
  },
  header: {
    backgroundColor: '#ddffbc',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pontosDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pontosTexto: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  pontosIcone: {
    fontSize: 18,
  },
  itemsList: {
    flex: 1,
    backgroundColor: '#ddffbc',
  },
  itemsContainer: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9A825',
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#7C6A2B',
    fontWeight: '600',
  },
  sectionTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  shopItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  purchasedItem: {
    opacity: 1,
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemNameComprado: {
    color: '#2E7D32',
  },
  itemcategoria: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  itemCompradoLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  itemRight: {
    alignItems: 'center',
    gap: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    marginRight: 2,
  },
  purchaseButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ownedButton: {
    backgroundColor: '#4CAF50',
  },
  cantAffordButton: {
    backgroundColor: '#E5E7EB',
  },
  buyText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  ownedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cantAffordText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomSpace: {
    height: 100,
  },
});