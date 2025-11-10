import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../controller';
import { doc, onSnapshot, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function Shop() {
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [itensComprados, setItensComprados] = useState([]);
  const [pontosGastos, setPontosGastos] = useState(0);

  // CORREÇÃO: Agora salvamos apenas o acessório, não a imagem completa
  const [shopItems] = useState([
    {
      id: 1,
      name: 'Óculos de Festa',
      categoria: 'Acessórios',
      price: 15,
      icon: '🕶️',
      color: '#8B5CF6',
      acessorio: 'oculos' // Salva apenas o acessório
    },
    {
      id: 2,
      name: 'Chapéu de Aniversário',
      categoria: 'Acessórios',
      price: 20,
      icon: '🎉',
      color: '#06B6D4',
      acessorio: 'chapeu' // Salva apenas o acessório
    },
    {
      id: 3,
      name: 'Cachecol de Inverno',
      categoria: 'Acessórios',
      price: 25,
      icon: '🧣',
      color: '#F97316',
      acessorio: 'gravata' // Salva apenas o acessório
    },
  ]);

  const calcularPontosDisponiveis = async (objetivos) => {
    try {
      // Pontos ganhos das tasks do Firestore
      const pontosGanhos = objetivos
        .filter(obj => obj.finalizado)
        .reduce((total, obj) => total + (obj.pontos || 5), 0);
      
      console.log('Shop - Pontos ganhos calculados:', pontosGanhos);
      console.log('Shop - Pontos gastos atual:', pontosGastos);
      
      // Pontos disponíveis = ganhos - gastos
      const pontosDisponiveis = pontosGanhos - pontosGastos;
      console.log('Shop - Pontos disponíveis:', pontosDisponiveis, '(', pontosGanhos, '-', pontosGastos, ')');
      setPontosUsuario(Math.max(0, pontosDisponiveis)); // Garante que não seja negativo
    } catch (error) {
      console.log('Shop - Erro ao calcular pontos disponíveis:', error);
    }
  };

  const carregarPontosGastos = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        // Tenta carregar do Firestore primeiro
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.pontosGastos !== undefined) {
            const gastos = data.pontosGastos || 0;
            setPontosGastos(gastos);
            console.log('Shop - Pontos gastos carregados do Firestore:', gastos);
            // Sincroniza com AsyncStorage
            await AsyncStorage.setItem('pontosGastos', gastos.toString());
            return;
          }
        }
      }
      
      // Fallback: carrega do AsyncStorage
      const gastosData = await AsyncStorage.getItem('pontosGastos');
      const gastos = gastosData ? parseInt(gastosData) : 0;
      setPontosGastos(gastos);
      console.log('Shop - Pontos gastos carregados do AsyncStorage:', gastos);
    } catch (error) {
      console.log('Shop - Erro ao carregar pontos gastos:', error);
    }
  };

  const carregarItensComprados = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        // Tenta carregar do Firestore primeiro
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.itensComprados && Array.isArray(data.itensComprados)) {
            setItensComprados(data.itensComprados);
            console.log('Shop - Itens comprados carregados do Firestore:', data.itensComprados);
            // Sincroniza com AsyncStorage
            await AsyncStorage.setItem('itensComprados', JSON.stringify(data.itensComprados));
            return;
          }
        }
      }
      
      // Fallback: carrega do AsyncStorage
      const itensData = await AsyncStorage.getItem('itensComprados');
      if (itensData) {
        const itens = JSON.parse(itensData);
        setItensComprados(itens);
        console.log('Shop - Itens comprados carregados do AsyncStorage:', itens);
      }
    } catch (error) {
      console.log('Shop - Erro ao carregar itens comprados:', error);
    }
  };

  useEffect(() => {
    carregarItensComprados();
    
    // Carrega dados iniciais do Firestore
    const carregarDadosIniciais = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const docRef = doc(db, "users", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const objetivos = data.objetivos || [];
            console.log('Shop - Dados iniciais carregados:', objetivos.length, 'objetivos');
            calcularPontosDisponiveis(objetivos);
            
            // Carrega itens comprados
            if (data.itensComprados && Array.isArray(data.itensComprados)) {
              setItensComprados(data.itensComprados);
              console.log('Shop - Itens comprados carregados:', data.itensComprados);
            }
            
            // Carrega pontos gastos
            if (data.pontosGastos !== undefined) {
              setPontosGastos(data.pontosGastos || 0);
              console.log('Shop - Pontos gastos carregados:', data.pontosGastos);
            }
          }
        } catch (error) {
          console.log('Shop - Erro ao carregar dados iniciais:', error);
        }
      }
    };
    
    carregarDadosIniciais();
    
    // Atualiza pontos gastos periodicamente
    const interval = setInterval(() => {
      carregarPontosGastos();
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Listener do Firestore - recria quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.log('Shop - userId não disponível');
        return;
      }

      console.log('Shop - Configurando listener do Firestore para userId:', userId);

      // Listener em tempo real para os objetivos do Firestore
      const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
        console.log('Shop - Firestore atualizado:', docSnap.exists());
        if (docSnap.exists()) {
          const data = docSnap.data();
          const objetivos = data.objetivos || [];
          console.log('Shop - Objetivos recebidos:', objetivos.length, 'objetivos');
          console.log('Shop - Objetivos finalizados:', objetivos.filter(obj => obj.finalizado).length);
          
          // Atualiza pontos gastos ANTES de calcular disponíveis
          if (data.pontosGastos !== undefined) {
            const gastosAtualizados = data.pontosGastos || 0;
            console.log('Shop - Pontos gastos atualizados do Firestore:', gastosAtualizados);
            setPontosGastos(gastosAtualizados);
          }
          
          // Agora calcula pontos disponíveis com os gastos atualizados
          calcularPontosDisponiveis(objetivos);
          
          // Atualiza itens comprados do Firestore
          if (data.itensComprados && Array.isArray(data.itensComprados)) {
            setItensComprados(data.itensComprados);
            console.log('Shop - Itens comprados atualizados do Firestore:', data.itensComprados);
          }
        } else {
          console.log('Shop - Documento não existe no Firestore');
        }
      }, (error) => {
        console.log('Shop - Erro ao carregar dados do Firestore:', error);
      });

      return () => {
        console.log('Shop - Removendo listener do Firestore');
        unsubscribe();
      };
    }, [pontosGastos])
  );


  const salvarItensComprados = async (novosItens) => {
    try {
      // Salva no AsyncStorage (para compatibilidade)
      await AsyncStorage.setItem('itensComprados', JSON.stringify(novosItens));
      
      // Salva no Firestore
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          await updateDoc(userDocRef, {
            itensComprados: novosItens,
            ultimaAtualizacao: new Date().toISOString()
          });
          console.log('Shop - ✅ Itens comprados salvos no Firestore:', novosItens);
        } else {
          await setDoc(userDocRef, {
            itensComprados: novosItens,
            ultimaAtualizacao: new Date().toISOString()
          }, { merge: true });
          console.log('Shop - ✅ Documento criado com itens comprados');
        }
      }
    } catch (error) {
      console.log('Shop - ❌ Erro ao salvar itens:', error);
    }
  };

  const salvarPontosGastos = async (novoTotal) => {
    try {
      console.log('Shop - 💰 Salvando pontos gastos:', novoTotal);
      
      // Salva no AsyncStorage (para compatibilidade)
      await AsyncStorage.setItem('pontosGastos', novoTotal.toString());
      console.log('Shop - ✅ Pontos gastos salvos no AsyncStorage');
      
      // Salva no Firestore
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          await updateDoc(userDocRef, {
            pontosGastos: novoTotal,
            ultimaAtualizacao: new Date().toISOString()
          });
          console.log('Shop - ✅ Pontos gastos salvos no Firestore:', novoTotal);
        } else {
          await setDoc(userDocRef, {
            pontosGastos: novoTotal,
            ultimaAtualizacao: new Date().toISOString()
          }, { merge: true });
          console.log('Shop - ✅ Documento criado com pontos gastos');
        }
        
        // Verifica se salvou corretamente
        const verificacao = await getDoc(userDocRef);
        if (verificacao.exists()) {
          const dadosVerificacao = verificacao.data();
          console.log('Shop - ✅ Verificação: pontosGastos salvo como:', dadosVerificacao.pontosGastos);
        }
      }
    } catch (error) {
      console.log('Shop - ❌ Erro ao salvar pontos gastos:', error);
      console.log('Shop - Detalhes do erro:', error.message);
    }
  };

  const salvarImagemMascote = async (imagemId) => {
    try {
      const imagemIdLimpo = imagemId.trim();
      console.log('Shop - 🎨 Tentando salvar imagem do mascote:', imagemIdLimpo);
      
      // Salva no AsyncStorage (para compatibilidade)
      await AsyncStorage.setItem('imagemMascoteAtual', imagemIdLimpo);
      console.log('Shop - ✅ Imagem do mascote salva no AsyncStorage:', imagemIdLimpo);
      
      // Salva no Firestore
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          await updateDoc(userDocRef, {
            imagemMascote: imagemIdLimpo,
            ultimaAtualizacao: new Date().toISOString()
          });
          console.log('Shop - ✅ Imagem do mascote salva no Firestore:', imagemIdLimpo);
          
          // Verifica se salvou corretamente
          const verificacao = await getDoc(userDocRef);
          if (verificacao.exists()) {
            const dadosVerificacao = verificacao.data();
            console.log('Shop - ✅ Verificação: imagemMascote salva como:', dadosVerificacao.imagemMascote);
          }
        } else {
          await setDoc(userDocRef, {
            imagemMascote: imagemIdLimpo,
            ultimaAtualizacao: new Date().toISOString()
          }, { merge: true });
          console.log('Shop - ✅ Documento criado com imagem do mascote');
        }
      }
    } catch (error) {
      console.log('Shop - ❌ Erro ao salvar imagem do mascote:', error);
      console.log('Shop - Detalhes do erro:', error.message);
    }
  };

  const recarregarPontos = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const objetivos = data.objetivos || [];
          calcularPontosDisponiveis(objetivos);
        }
      } catch (error) {
        console.log('Shop - Erro ao recarregar pontos:', error);
      }
    }
  };

  const purchaseItem = async (item) => {
    console.log('Shop - 🛒 Tentando comprar item:', item.name, 'por', item.price, 'pontos');
    console.log('Shop - Pontos disponíveis:', pontosUsuario);
    console.log('Shop - Imagem do mascote do item:', item.imagemMascote);
    
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
              console.log('Shop - 🎯 Processando compra...');
              console.log('Shop - Pontos antes da compra:', pontosUsuario);
              console.log('Shop - Pontos gastos antes da compra:', pontosGastos);
              
              // 1. Salva a imagem do mascote PRIMEIRO (mais importante)
              if (item.imagemMascote) {
                console.log('Shop - 🎨 Salvando imagem do mascote:', item.imagemMascote);
                await salvarImagemMascote(item.imagemMascote);
                console.log('Shop - ✅ Imagem do mascote salva com sucesso!');
              } else {
                console.log('Shop - ⚠️ ATENÇÃO: Item não tem imagemMascote definida!');
              }
              
              // 2. Adiciona item aos comprados
              const novosItensComprados = [...itensComprados, item.id];
              setItensComprados(novosItensComprados);
              await salvarItensComprados(novosItensComprados);
              console.log('Shop - ✅ Item adicionado aos comprados');

              // 3. Desconta os pontos IMEDIATAMENTE
              const novosPontosGastos = pontosGastos + item.price;
              const novoPontoDisponivel = pontosUsuario - item.price;
              
              console.log('Shop - 💰 Calculando novos valores:');
              console.log('Shop -    Pontos gastos (antes):', pontosGastos);
              console.log('Shop -    Preço do item:', item.price);
              console.log('Shop -    Pontos gastos (depois):', novosPontosGastos);
              console.log('Shop -    Pontos disponíveis (depois):', novoPontoDisponivel);
              
              // Atualiza estado local primeiro (para feedback instantâneo)
              setPontosUsuario(novoPontoDisponivel);
              setPontosGastos(novosPontosGastos);
              console.log('Shop - ✅ Estados locais atualizados');
              
              // Depois salva no banco
              await salvarPontosGastos(novosPontosGastos);
              console.log('Shop - ✅ Pontos salvos no Firestore');

              // Mostra mensagem de sucesso com pontos atualizados
              Alert.alert(
                'Compra realizada! 🎉',
                `Você comprou ${item.name}!\n\n💰 Você gastou: ${item.price} pontos\n⚡ Pontos restantes: ${novoPontoDisponivel}\n\n${item.imagemMascote ? '🎨 Volte para a tela inicial para ver seu mascote com o novo acessório!' : ''}`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('Shop - ✅ Compra finalizada com sucesso!');
                    }
                  }
                ]
              );

              // Recarrega pontos do Firestore para garantir sincronização
              setTimeout(async () => {
                await recarregarPontos();
                await carregarPontosGastos();
                console.log('Shop - ✅ Dados recarregados após compra');
              }, 500);
            } catch (error) {
              console.log('Shop - ❌ Erro ao comprar item:', error);
              console.log('Shop - Detalhes do erro:', error.message);
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