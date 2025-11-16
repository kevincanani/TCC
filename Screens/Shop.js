import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../controller';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';

export default function Shop() {
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [itensComprados, setItensComprados] = useState([]);
  const [pontosGastos, setPontosGastos] = useState(0);

  const [shopItems] = useState([
    {
      id: 1,
      name: 'Óculos de Festa',
      categoria: 'Acessórios',
      price: 15,
      icon: '🕶️',
      color: '#8B5CF6',
      acessorio: 'oculos'
    },
    {
      id: 2,
      name: 'Chapéu de Aniversário',
      categoria: 'Acessórios',
      price: 20,
      icon: '🎉',
      color: '#06B6D4',
      acessorio: 'chapeu'
    },
    {
      id: 3,
      name: 'Cachecol de Inverno',
      categoria: 'Acessórios',
      price: 25,
      icon: '🧣',
      color: '#F97316',
      acessorio: 'gravata'
    },
  ]);

  const calcularPontosDisponiveis = async (objetivos, gastosAtuais) => {
    try {
      const pontosGanhos = objetivos
        .filter(obj => obj.finalizado)
        .reduce((total, obj) => total + (obj.pontos || 5), 0);
      
      const pontosDisponiveis = pontosGanhos - gastosAtuais;
      console.log('Shop - 💰 Pontos: Ganhos =', pontosGanhos, '| Gastos =', gastosAtuais, '| Disponíveis =', pontosDisponiveis);
      setPontosUsuario(Math.max(0, pontosDisponiveis));
    } catch (error) {
      console.log('Shop - Erro ao calcular pontos:', error);
    }
  };

  const carregarDados = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log('Shop - ❌ UserId não disponível');
        return;
      }

      console.log('Shop - 🔄 Carregando dados do Firestore...');
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        const objetivos = data.objetivos || [];
        const gastos = data.pontosGastos || 0;
        const itens = data.itensComprados || [];
        
        console.log('Shop - ✅ Dados carregados:');
        console.log('Shop -    Objetivos:', objetivos.length);
        console.log('Shop -    Gastos:', gastos);
        console.log('Shop -    Itens comprados:', itens);
        
        setPontosGastos(gastos);
        setItensComprados(itens);
        await calcularPontosDisponiveis(objetivos, gastos);
      }
    } catch (error) {
      console.log('Shop - ❌ Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Shop - 👀 Tela recebeu foco, configurando listener...');
      const userId = auth.currentUser?.uid;
      
      if (!userId) return;

      const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const objetivos = data.objetivos || [];
          const gastos = data.pontosGastos || 0;
          const itens = data.itensComprados || [];
          
          console.log('Shop - 🔔 Firestore atualizado:');
          console.log('Shop -    Gastos:', gastos);
          console.log('Shop -    Itens:', itens);
          
          setPontosGastos(gastos);
          setItensComprados(itens);
          calcularPontosDisponiveis(objetivos, gastos);
        }
      });

      return () => {
        console.log('Shop - 🔇 Removendo listener');
        unsubscribe();
      };
    }, [])
  );

  const purchaseItem = async (item) => {
    console.log('Shop - 🛍️ Iniciando compra:', item.name);
    console.log('Shop - 🔍 Verificando condições...');
    console.log('Shop -    Item ID:', item.id);
    console.log('Shop -    Itens comprados:', itensComprados);
    console.log('Shop -    Já comprado?', itensComprados.includes(item.id));
    console.log('Shop -    Pontos usuário:', pontosUsuario);
    console.log('Shop -    Preço item:', item.price);
    console.log('Shop -    Pode comprar?', pontosUsuario >= item.price);
    
    if (itensComprados.includes(item.id)) {
      console.log('Shop - ❌ Item já comprado!');
      Alert.alert('Já comprado!', 'Você já possui este item! 😊');
      return;
    }
  
    if (pontosUsuario < item.price) {
      console.log('Shop - ❌ Pontos insuficientes!');
      Alert.alert(
        'Pontos insuficientes! ⚡', 
        `Você precisa de ${item.price} pontos, mas tem apenas ${pontosUsuario} pontos.\n\nComplete mais tarefas para ganhar pontos!`
      );
      return;
    }
    
    console.log('Shop - ✅ Verificações passaram, mostrando Alert...');
  
    Alert.alert(
      'Confirmar compra?',
      `Deseja comprar ${item.name} por ${item.price} pontos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              if (!userId) {
                Alert.alert('Erro', 'Usuário não autenticado!');
                return;
              }

              console.log('Shop - 💳 Processando compra...');
              console.log('Shop -    Item:', item.name);
              console.log('Shop -    Acessório:', item.acessorio);
              console.log('Shop -    Preço:', item.price);
              
              // 1. Calcula novos valores
              const novosPontosGastos = pontosGastos + item.price;
              const novosPontosDisponiveis = pontosUsuario - item.price;
              const novosItensComprados = [...itensComprados, item.id];
              
              console.log('Shop - 💰 Novos valores:');
              console.log('Shop -    Gastos:', pontosGastos, '→', novosPontosGastos);
              console.log('Shop -    Disponíveis:', pontosUsuario, '→', novosPontosDisponiveis);
              console.log('Shop -    Itens:', itensComprados, '→', novosItensComprados);
              
              // 2. Salva TUDO de uma vez no Firestore
              const userDocRef = doc(db, "users", userId);
              await updateDoc(userDocRef, {
                pontosGastos: novosPontosGastos,
                itensComprados: novosItensComprados,
                acessorioMascote: item.acessorio,
                ultimaAtualizacao: new Date().toISOString()
              });
              
              console.log('Shop - ✅ Dados salvos no Firestore!');
              
              // 3. Salva também no AsyncStorage (backup)
              await AsyncStorage.setItem('pontosGastos', novosPontosGastos.toString());
              await AsyncStorage.setItem('itensComprados', JSON.stringify(novosItensComprados));
              await AsyncStorage.setItem('acessorioMascote', item.acessorio);
              
              console.log('Shop - ✅ Dados salvos no AsyncStorage!');
              
              // 4. Atualiza estados locais
              setPontosGastos(novosPontosGastos);
              setPontosUsuario(novosPontosDisponiveis);
              setItensComprados(novosItensComprados);
              
              console.log('Shop - ✅ Estados locais atualizados!');
              
              // Mensagem de sucesso
              Alert.alert(
                'Compra realizada! 🎉',
                `Você comprou ${item.name}!\n\n💰 Gastou: ${item.price} pontos\n⚡ Restantes: ${novosPontosDisponiveis} pontos\n\n🎨 Volte para a Home para ver o novo visual!`,
                [{ text: 'OK' }]
              );
              
              console.log('Shop - ✅ Compra concluída com sucesso!');
              
            } catch (error) {
              console.log('Shop - ❌ Erro na compra:', error);
              Alert.alert('Erro', 'Não foi possível completar a compra. Tente novamente!');
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