import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../controller';
import { doc, onSnapshot, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

import { AlertCustom, AlertProvider } from '../AlertCustom';

export default function Shop() {
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [itensComprados, setItensComprados] = useState([]);
  const [pontosGastos, setPontosGastos] = useState(0);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acessoriosEquipados, setAcessoriosEquipados] = useState([]);

  // Carrega os itens da coleção "items" do Firestore
  const carregarItensLoja = async () => {
    try {
      console.log('Shop - 📄 Carregando itens da loja do Firestore...');
      const itemsCollection = collection(db, "items");
      const itemsSnapshot = await getDocs(itemsCollection);
      
      const itensArray = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Shop - ✅ Itens carregados:', itensArray.length);
      setShopItems(itensArray);
      setLoading(false);
    } catch (error) {
      console.log('Shop - ❌ Erro ao carregar itens:', error);
      AlertCustom.alert('Erro', 'Não foi possível carregar os itens da loja.');
      setLoading(false);
    }
  };

  const calcularPontosDisponiveis = async (objetivos, gastosAtuais) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      let pontosGanhos = 0;
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // MESMA LÓGICA DO HOME E PROFILE
        pontosGanhos = (data.pontosTotaisAcumulados || 0) + 
                      objetivos.filter(obj => obj.finalizado).reduce((total, obj) => total + (obj.pontos || 5), 0);
      }
      
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
            const acessorios = Array.isArray(data.acessoriosMascote) 
                ? data.acessoriosMascote 
                : [];
            
            console.log('Shop - ✅ Dados carregados do Firestore:');
            console.log('Shop -    Objetivos:', objetivos.length);
            console.log('Shop -    Gastos:', gastos);
            console.log('Shop -    Itens comprados:', itens);
            console.log('Shop -    Acessórios equipados:', acessorios);
            
            setPontosGastos(gastos);
            setItensComprados(itens);
            setAcessoriosEquipados(acessorios);
            
            await calcularPontosDisponiveis(objetivos, gastos);
        } else {
            console.log('Shop - ⚠️ Documento do usuário não existe');
            setAcessoriosEquipados([]);
        }
    } catch (error) {
        console.log('Shop - ❌ Erro ao carregar dados:', error);
    }
};

  useEffect(() => {
    carregarItensLoja();
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
          const acessorios = Array.isArray(data.acessoriosMascote) 
              ? data.acessoriosMascote 
              : [];

          console.log('Shop -    Acessórios:', acessorios);

          setAcessoriosEquipados(acessorios);
          
          console.log('Shop - 🔔 Firestore atualizado:');
          console.log('Shop -    Gastos:', gastos);
          console.log('Shop -    Itens:', itens);
          //console.log('Shop -    Acessório:', acessorio);
          
          setPontosGastos(gastos);
          setItensComprados(itens);
          //setAcessorioEquipado(acessorio);
          calcularPontosDisponiveis(objetivos, gastos);
        }
      });

      return () => {
        console.log('Shop - 🔇 Removendo listener');
        unsubscribe();
      };
    }, [])
  );

  const equiparAcessorio = async (item) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            AlertCustom.alert('Erro', 'Usuário não autenticado!');
            return;
        }

        console.log('Shop - 🎨 Equipando/Desequipando acessório...');
        console.log('Shop -    Acessórios atuais:', acessoriosEquipados);
        console.log('Shop -    Acessório do item:', item.acessorio);

        const jaEquipado = acessoriosEquipados.includes(item.acessorio);
        
        let novosAcessorios;
        if (jaEquipado) {
            novosAcessorios = acessoriosEquipados.filter(a => a !== item.acessorio);
        } else {
            novosAcessorios = [...acessoriosEquipados, item.acessorio];
        }
        
        console.log('Shop -    Novos acessórios:', novosAcessorios);

        // Salva no Firestore
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
            acessoriosMascote: novosAcessorios,
            ultimaAtualizacao: new Date().toISOString()
        });
        console.log('Shop - ✅ Acessórios salvos no Firestore:', novosAcessorios);

        // Atualiza estado local
        setAcessoriosEquipados(novosAcessorios);

        // Mensagens de feedback (sem mudanças)
        if (jaEquipado) {
            AlertCustom.alert(
                'Acessório removido! 👕',
                `${item.name} foi desequipado.\n\n✨ Volte para a Home para ver a mudança!`
            );
        } else {
            AlertCustom.alert(
                'Acessório equipado! 🎉',
                `${item.name} foi equipado com sucesso!\n\n✨ Volte para a Home para ver o novo visual!`
            );
        }
    } catch (error) {
        console.log('Shop - ❌ Erro ao equipar/desequipar acessório:', error);
        AlertCustom.alert('Erro', 'Não foi possível equipar o acessório. Tente novamente!');
    }
};

  const purchaseItem = async (item) => {
    console.log('Shop - 🛒 Iniciando compra:', item.name);
    console.log('Shop - 🔍 Verificando condições...');
    console.log('Shop -    Item ID:', item.id);
    console.log('Shop -    Itens comprados:', itensComprados);
    console.log('Shop -    Já comprado?', itensComprados.includes(item.id));
    console.log('Shop -    Pontos usuário:', pontosUsuario);
    console.log('Shop -    Preço item:', item.price);
    console.log('Shop -    Pode comprar?', pontosUsuario >= item.price);
    
    if (itensComprados.includes(item.id)) {
      console.log('Shop - ❌ Item já comprado!');
      AlertCustom.alert('Já comprado!', 'Você já possui este item! 😊');
      return;
    }
  
    if (pontosUsuario < item.price) {
      console.log('Shop - ❌ Pontos insuficientes!');
      AlertCustom.alert(
        'Pontos insuficientes! ⚡', 
        `Você precisa de ${item.price} pontos, mas tem apenas ${pontosUsuario} pontos.\n\nComplete mais tarefas para ganhar pontos!`
      );
      return;
    }
    
    console.log('Shop - ✅ Verificações passaram, mostrando Alert...');
  
    AlertCustom.alert(
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
                AlertCustom.alert('Erro', 'Usuário não autenticado!');
                return;
              }

              console.log('Shop - 💳 Processando compra...');
              console.log('Shop -    Item:', item.name);
              console.log('Shop -    Acessório:', item.acessorio);
              console.log('Shop -    Preço:', item.price);
              
              // VERIFICAÇÃO: O acessório está definido?
              if (!item.acessorio) {
                AlertCustom.alert('Erro', 'Este item não possui um acessório definido. Entre em contato com o suporte.');
                return;
              }
              
              // 1. Calcula novos valores
              const novosPontosGastos = pontosGastos + item.price;
              const novosPontosDisponiveis = pontosUsuario - item.price;
              const novosItensComprados = [...itensComprados, item.id];
              
              console.log('Shop - 💰 Novos valores:');
              console.log('Shop -    Gastos:', pontosGastos, '→', novosPontosGastos);
              console.log('Shop -    Disponíveis:', pontosUsuario, '→', novosPontosDisponiveis);
              console.log('Shop -    Itens:', itensComprados, '→', novosItensComprados);
              
              // 2. Salva no Firestore (sem equipar automaticamente)
              const userDocRef = doc(db, "users", userId);
              await updateDoc(userDocRef, {
                pontosGastos: novosPontosGastos,
                itensComprados: novosItensComprados,
                ultimaAtualizacao: new Date().toISOString()
              });
              
              console.log('Shop - ✅ Dados salvos no Firestore!');
              
              // 3. Salva também no AsyncStorage (backup)
              await AsyncStorage.setItem('pontosGastos', novosPontosGastos.toString());
              await AsyncStorage.setItem('itensComprados', JSON.stringify(novosItensComprados));
              
              console.log('Shop - ✅ Dados salvos no AsyncStorage!');
              
              // 4. Atualiza estados locais
              setPontosGastos(novosPontosGastos);
              setPontosUsuario(novosPontosDisponiveis);
              setItensComprados(novosItensComprados);
              
              console.log('Shop - ✅ Estados locais atualizados!');
              
              // Mensagem de sucesso
              AlertCustom.alert(
                'Compra realizada! 🎉',
                `Você comprou ${item.name}!\n\n💰 Gastou: ${item.price} pontos\n⚡ Restantes: ${novosPontosDisponiveis} pontos\n\n👕 Toque em "Equipar" para usar o acessório!`,
                [{ text: 'OK' }]
              );
              
              console.log('Shop - ✅ Compra concluída com sucesso!');
              
            } catch (error) {
              console.log('Shop - ❌ Erro na compra:', error);
              AlertCustom.alert('Erro', 'Não foi possível completar a compra. Tente novamente!');
            }
          }
        }
      ]
    );
  };

  const renderShopItem = (item) => {
    const foiComprado = itensComprados.includes(item.id);
    const podeComprar = pontosUsuario >= item.price;
    const estaEquipado = acessoriosEquipados.includes(item.acessorio);  // Mudança aqui

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.shopItem,
          foiComprado && styles.purchasedItem,
          estaEquipado && styles.equippedItem
        ]}
        onPress={() => {
          if (foiComprado) {
            equiparAcessorio(item);
          } else {
            purchaseItem(item);
          }
        }}
        activeOpacity={0.8}
      >
        <View style={styles.itemContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={[
              styles.itemName, 
              foiComprado && styles.itemNameComprado,
              estaEquipado && styles.itemNameEquipado
            ]}>
              {item.name}
            </Text>
            <Text style={styles.itemcategoria}>{item.categoria}</Text>
            {estaEquipado && (
              <Text style={styles.itemEquipadoLabel}>⭐ Equipado</Text>
            )}
            {foiComprado && !estaEquipado && (
              <Text style={styles.itemCompradoLabel}>✓ Comprado</Text>
            )}
          </View>

          <View style={styles.itemRight}>
            {!foiComprado && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{item.price}</Text>
                <Text style={styles.pontosIcone}>⚡</Text>
              </View>
            )}
            
            <View style={[
              styles.purchaseButton,
              estaEquipado ? styles.equippedButton :
              foiComprado ? styles.ownedButton : 
              podeComprar ? styles.buyButton : styles.cantAffordButton
            ]}>
              {estaEquipado ? (
                <Text style={styles.equippedText}>Remover</Text>
              ) : foiComprado ? (
                <Text style={styles.equipText}>Equipar</Text>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#9C27B0" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>Carregando loja...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#9C27B0" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🛒 Loja</Text>
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
            Compre e equipe acessórios para personalizar seu mascote!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Todos os itens</Text>
        
        {shopItems.length > 0 ? (
          shopItems.map(renderShopItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum item disponível no momento</Text>
          </View>
        )}
        
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddffbc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
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
  equippedItem: {
    backgroundColor: '#FFF9C4',
    borderColor: '#F9A825',
    borderWidth: 3,
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
  itemNameEquipado: {
    color: '#F57F17',
    fontWeight: 'bold',
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
  itemEquipadoLabel: {
    fontSize: 12,
    color: '#F9A825',
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
  equippedButton: {
    backgroundColor: '#F57C00',
  },
  cantAffordButton: {
    backgroundColor: '#E5E7EB',
  },
  buyText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  equipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  equippedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cantAffordText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomSpace: {
    height: 100,
  },
});