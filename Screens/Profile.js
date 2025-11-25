import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Modal, Image, Animated, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../controller';
import { doc, onSnapshot, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { AlertCustom } from '../AlertCustom';

import Entypo from '@expo/vector-icons/Entypo';

export default function Profile({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [nomePinguim, setNomePinguim] = useState('Pinguim');
  const [avatarSelecionado, setAvatarSelecionado] = useState('🐧');
  const [corMascote, setCorMascote] = useState('azul');
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [novoNomeUsuario, setNovoNomeUsuario] = useState('');
  const [novoNomePinguim, setNovoNomePinguim] = useState('');
  const [novoAvatar, setNovoAvatar] = useState('🐧');
  const [novaCorMascote, setNovaCorMascote] = useState('azul');
  
  // Animações
  const pinguimScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Estados das tasks sincronizadas
  const [totalObjetivos, setTotalObjetivos] = useState(0);
  const [objetivosFinalizados, setObjetivosFinalizados] = useState(0);
  const [pontosGanhos, setPontosGanhos] = useState(0);
  const [pontosDisponiveis, setPontosDisponiveis] = useState(0);

  const avatarsDisponiveis = ['🐧', '🦈', '🦊', '🐨', '🐼', '🦁', '🐯', '🐸', '🦄', '🐱', '🐶', '🐻'];

  // Imagens dos pinguins
  const imagensPinguim = {
    azul: require('../assets/azul.png'),
    verde: require('../assets/verde.png'),
    vermelho: require('../assets/vermelho.png'),
  };

  const cores = [
    { id: 'azul', nome: 'Azul', cor: '#2196F3', emoji: '💙' },
    { id: 'verde', nome: 'Verde', cor: '#4CAF50', emoji: '💚' },
    { id: 'vermelho', nome: 'Vermelho', cor: '#F44336', emoji: '❤️' },
  ];

  // FUNÇÃO DE LOGOUT
  const handleLogout = () => {
    AlertCustom.alert(
      'Sair da conta',
      'Tem certeza que deseja sair? Seus dados estarão salvos quando você voltar! 😊',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Iniciando logout...');
              
              // 1. Faz logout do Firebase Auth
              await signOut(auth);
              console.log('✅ Logout do Firebase concluído');
              
              // 2. Limpa dados sensíveis do AsyncStorage (opcional)
              // Mantenha os dados do usuário salvos para próximo login
              // await AsyncStorage.clear(); // Use apenas se quiser limpar TUDO
              
              console.log('✅ Logout concluído com sucesso!');
              
              // 3. Navega para tela de Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              
            } catch (error) {
              console.error('❌ Erro ao fazer logout:', error);
              AlertCustom.alert('Erro', 'Não foi possível sair. Tente novamente!');
            }
          }
        }
      ]
    );
  };

  const calcularPontosDisponiveis = async (objetivos) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      let pontosGanhos = 0;
      let pontosGastos = 0;
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // MESMA LÓGICA DO HOME
        pontosGanhos = (data.pontosTotaisAcumulados || 0) + 
                      objetivos.filter(obj => obj.finalizado).reduce((total, obj) => total + obj.pontos, 0);
        pontosGastos = data.pontosGastos || 0;
      }
      
      const pontosDisponiveis = pontosGanhos - pontosGastos;
      setPontosDisponiveis(Math.max(0, pontosDisponiveis));
      
    } catch (error) {
      console.log('Profile - Erro ao calcular pontos disponíveis:', error);
    }
};

  const carregarTasks = async (objetivos) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      const total = objetivos.length;
      const finalizados = objetivos.filter(t => t.finalizado).length;
      
      // Calcula pontos GANHOS (acumulados + pendentes)
      let pontosGanhosTotais = 0;
      if (docSnap.exists()) {
        const data = docSnap.data();
        pontosGanhosTotais = (data.pontosTotaisAcumulados || 0) + 
                            objetivos.filter(t => t.finalizado).reduce((sum, t) => sum + (t.pontos || 5), 0);
      }
      
      setTotalObjetivos(total);
      setObjetivosFinalizados(finalizados);
      setPontosGanhos(pontosGanhosTotais);
      
    } catch (error) {
      console.log('Erro ao carregar tasks:', error);
    }
};

  useEffect(() => {
    carregarDados();
    
    const carregarDadosIniciais = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const docRef = doc(db, "users", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const objetivos = data.objetivos || [];
            carregarTasks(objetivos);
            calcularPontosDisponiveis(objetivos);
            
            // Carrega a cor do mascote
            if (data.corMascote) {
              setCorMascote(data.corMascote);
            }
          }
        } catch (error) {
          console.log('Profile - Erro ao carregar dados iniciais:', error);
        }
      }
    };
    
    carregarDadosIniciais();
    
    const interval = setInterval(async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const docRef = doc(db, "users", userId);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            const objetivos = data.objetivos || [];
            calcularPontosDisponiveis(objetivos);
          }
        } catch (error) {
          console.log('Profile - Erro ao atualizar pontos:', error);
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        return;
      }

      const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const objetivos = data.objetivos || [];
          carregarTasks(objetivos);
          calcularPontosDisponiveis(objetivos);
          
          // Atualiza a cor do mascote
          if (data.corMascote) {
            setCorMascote(data.corMascote);
          }
        }
      }, (error) => {
        console.log('Profile - Erro ao carregar dados do Firestore:', error);
      });

      return () => {
        unsubscribe();
      };
    }, [])
  );

  const carregarDados = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.nomeUsuario) {
            setNomeUsuario(data.nomeUsuario);
            setNomePinguim(data.nomePinguim || 'Pinguim');
            setAvatarSelecionado(data.avatar || '🐧');
            setCorMascote(data.corMascote || 'azul');
            
            const userData = {
              nomeUsuario: data.nomeUsuario,
              nomePinguim: data.nomePinguim || 'Pinguim',
              avatar: data.avatar || '🐧'
            };
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            return;
          }
        }
      }
      
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const dados = JSON.parse(userData);
        setNomeUsuario(dados.nomeUsuario);
        setNomePinguim(dados.nomePinguim);
        setAvatarSelecionado(dados.avatar || '🐧');
      }
      
      const corSalva = await AsyncStorage.getItem('corMascote');
      if (corSalva) {
        setCorMascote(corSalva);
      }
    } catch (error) {
      console.log('Profile - Erro ao carregar dados:', error);
    }
  };

  const abrirModalEdicao = () => {
    setNovoNomeUsuario(nomeUsuario);
    setNovoNomePinguim(nomePinguim);
    setNovoAvatar(avatarSelecionado);
    setNovaCorMascote(corMascote);
    setModalEditVisible(true);
  };

  const selecionarCor = (cor) => {
    setNovaCorMascote(cor.id);
    // Animação ao trocar
    Animated.sequence([
      Animated.timing(pinguimScaleAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(pinguimScaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
  };

  const salvarEdicao = async () => {
    if (novoNomeUsuario.trim() === '' || novoNomePinguim.trim() === '') {
      alert('Por favor, preencha todos os campos! 😊');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert('Erro: usuário não autenticado!');
        return;
      }

      const userData = {
        nomeUsuario: novoNomeUsuario.trim(),
        nomePinguim: novoNomePinguim.trim(),
        avatar: novoAvatar,
        corMascote: novaCorMascote,
        dataRegistro: new Date().toISOString()
      };
      
      // Salva no AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('corMascote', novaCorMascote);
      
      // Salva no Firestore
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        await updateDoc(userDocRef, {
          nomeUsuario: userData.nomeUsuario,
          nomePinguim: userData.nomePinguim,
          avatar: userData.avatar,
          corMascote: novaCorMascote,
          ultimaAtualizacao: new Date().toISOString()
        });
        console.log('Profile - Dados atualizados no Firestore');
      } else {
        await setDoc(userDocRef, {
          email: auth.currentUser?.email || '',
          ...userData,
          objetivos: [],
          pontosTotais: 0,
          pontosGastos: 0,
          itensComprados: [],
          imagemMascote: 'bicho'
        }, { merge: true });
        console.log('Profile - Documento criado no Firestore');
      }
      
      setNomeUsuario(novoNomeUsuario.trim());
      setNomePinguim(novoNomePinguim.trim());
      setAvatarSelecionado(novoAvatar);
      setCorMascote(novaCorMascote);
      setModalEditVisible(false);
      
    } catch (error) {
      console.log('Profile - Erro ao salvar dados:', error);
      alert('Erro ao salvar. Tente novamente!');
    }
  };

  const calcularProgresso = () => {
    if (totalObjetivos === 0) return 0;
    return Math.round((objetivosFinalizados / totalObjetivos) * 100);
  };

  const progressoPercentual = calcularProgresso();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      
      {/* Header com gradiente */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerGreeting}>Olá,</Text>
            <Text style={styles.headerName}>{nomeUsuario}! 👋</Text>
          </View>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={abrirModalEdicao}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}> <Entypo name="back" size={24} color="black" /> </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de Perfil Principal */}
        <View style={styles.profileMainCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmojiLarge}>{avatarSelecionado}</Text>
            <View style={styles.avatarBadge}>
              <Text style={styles.badgeText}>⭐</Text>
            </View>
          </View>
          
          <Text style={styles.profileNameLarge}>{nomeUsuario}</Text>
          <Text style={styles.pinguimNameLarge}>🐧 {nomePinguim}</Text>
          
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pontosDisponiveis}</Text>
              <Text style={styles.statLabel}>⚡ Pontos Disponíveis</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{objetivosFinalizados}</Text>
              <Text style={styles.statLabel}>✅ Completas</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalObjetivos}</Text>
              <Text style={styles.statLabel}>🎯 Total</Text>
            </View>
          </View>
        </View>

        {/* Card de Progresso Melhorado */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Seu Progresso</Text>
            <Text style={styles.sectionSubtitle}>Continue assim!</Text>
          </View>
          
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <View>
                <Text style={styles.progressTitle}>Objetivos Diários</Text>
                <Text style={styles.progressSubtext}>
                  {objetivosFinalizados} de {totalObjetivos} concluídos
                </Text>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{progressoPercentual}%</Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${progressoPercentual}%`,
                      backgroundColor: progressoPercentual === 100 ? '#10B981' : 
                                      progressoPercentual >= 50 ? '#F59E0B' : '#EF4444'
                    }
                  ]} 
                />
              </View>
            </View>
            
            {progressoPercentual === 100 && (
              <View style={styles.congratsCard}>
                <Text style={styles.congratsText}>🎉 Parabéns! Você completou todas as tarefas hoje!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Atividades Recentes Melhoradas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🕐 Atividade Recente</Text>
          </View>
          
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.activityEmoji}>✅</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Tarefas Completadas</Text>
                <Text style={styles.activityTime}>Hoje • {objetivosFinalizados} tarefas</Text>
              </View>
            </View>
            
            <View style={styles.activityDivider} />
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.activityEmoji}>⚡</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Pontos Disponíveis</Text>
                <Text style={styles.activityTime}>Total • {pontosGanhos} pontos ganhos • {pontosDisponiveis} disponíveis</Text>
              </View>
            </View>
            
            <View style={styles.activityDivider} />
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.activityEmoji}>🎯</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Meta do Dia</Text>
                <Text style={styles.activityTime}>
                  {progressoPercentual === 100 ? 'Concluída! 🎉' : `${100 - progressoPercentual}% restante`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card de Conquistas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Conquistas</Text>
          </View>
          
          <View style={styles.achievementsCard}>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <Text style={styles.achievementText}>Iniciante</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>⭐</Text>
              <Text style={styles.achievementText}>Dedicado</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>💪</Text>
              <Text style={styles.achievementText}>Persistente</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🎯</Text>
              <Text style={styles.achievementText}>Focado</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Edição Melhorado com Cor do Pinguim */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditVisible}
        onRequestClose={() => setModalEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Editar Perfil</Text>
              <TouchableOpacity onPress={() => setModalEditVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Preview do Pinguim com Cor Selecionada */}
              <View style={styles.pinguimPreviewSection}>
                <Text style={styles.previewLabel}>Preview do {novoNomePinguim || 'Pinguim'}</Text>
                <Animated.View 
                  style={[
                    styles.pinguimPreviewContainer,
                    { transform: [{ scale: pinguimScaleAnim }] }
                  ]}
                >
                  <Image
                    style={styles.pinguimPreviewImage}
                    source={imagensPinguim[novaCorMascote]}
                  />
                </Animated.View>
              </View>

              {/* Seleção de Cor do Pinguim */}
              <View style={styles.colorSelectionSection}>
                <Text style={styles.colorSelectionLabel}>🎨 Cor do Pinguim</Text>
                <View style={styles.coresContainer}>
                  {cores.map((cor) => (
                    <TouchableOpacity
                      key={cor.id}
                      style={[
                        styles.corItem,
                        { borderColor: cor.cor },
                        novaCorMascote === cor.id && styles.corSelecionada
                      ]}
                      onPress={() => selecionarCor(cor)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.corCirculo, { backgroundColor: cor.cor }]}>
                        <Text style={styles.corEmoji}>{cor.emoji}</Text>
                      </View>
                      <Text style={styles.corNome}>{cor.nome}</Text>
                      {novaCorMascote === cor.id && (
                        <Text style={styles.corCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Seleção de Avatar */}
              <View style={styles.avatarSelectionSection}>
                <Text style={styles.avatarSelectionLabel}>😊 Escolha seu avatar</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.avatarScroll}
                >
                  {avatarsDisponiveis.map((avatar, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.avatarOption,
                        novoAvatar === avatar && styles.avatarOptionSelected
                      ]}
                      onPress={() => setNovoAvatar(avatar)}
                    >
                      <Text style={styles.avatarOptionEmoji}>{avatar}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Campos de Texto */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>👤 Seu nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#95A5A6"
                  value={novoNomeUsuario}
                  onChangeText={setNovoNomeUsuario}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🐧 Nome do pinguim</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do pinguim"
                  placeholderTextColor="#95A5A6"
                  value={novoNomePinguim}
                  onChangeText={setNovoNomePinguim}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalEditVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={salvarEdicao}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmButtonText}>Salvar ✓</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8F4',
  },
  headerGradient: {
    backgroundColor: '#4CAF50',
    paddingTop: 15,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 16,
    color: '#E8F5E9',
    fontWeight: '500',
  },
  headerName: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editIcon: {
    fontSize: 20,
  },
  logoutIcon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileMainCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    marginTop: -15,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    backgroundColor: '#E8F5E9',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#4CAF50',
    position: 'relative',
  },
  avatarEmojiLarge: {
    fontSize: 50,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    backgroundColor: '#FFC107',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  badgeText: {
    fontSize: 16,
  },
  profileNameLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  pinguimNameLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  percentageBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  congratsCard: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
  },
  congratsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  activityDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  achievementItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    fontSize: 28,
    color: '#7F8C8D',
    fontWeight: '300',
  },
  // Preview do Pinguim
  pinguimPreviewSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  pinguimPreviewContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  pinguimPreviewImage: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
  },
  // Seleção de Cor
  colorSelectionSection: {
    marginBottom: 20,
  },
  colorSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  coresContainer: {
    gap: 12,
  },
  corItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 3,
    borderColor: 'transparent',
    gap: 12,
  },
  corSelecionada: {
    backgroundColor: '#F0F9FF',
    borderWidth: 3,
    transform: [{ scale: 1.02 }],
  },
  corCirculo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  corEmoji: {
    fontSize: 24,
  },
  corNome: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  corCheckmark: {
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Seleção de Avatar
  avatarSelectionSection: {
    marginBottom: 20,
  },
  avatarSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  avatarScroll: {
    marginBottom: 10,
  },
  avatarOption: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    transform: [{ scale: 1.1 }],
  },
  avatarOptionEmoji: {
    fontSize: 32,
  },
  // Inputs
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    fontWeight: '500',
  },
  // Botões do Modal
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});