import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../controller';
import { doc, onSnapshot, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [nomePinguim, setNomePinguim] = useState('Pinguim');
  const [avatarSelecionado, setAvatarSelecionado] = useState('🐧');
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [novoNomeUsuario, setNovoNomeUsuario] = useState('');
  const [novoNomePinguim, setNovoNomePinguim] = useState('');
  const [novoAvatar, setNovoAvatar] = useState('🐧');
  
  // Estados das tasks sincronizadas
  const [totalObjetivos, setTotalObjetivos] = useState(0);
  const [objetivosFinalizados, setObjetivosFinalizados] = useState(0);
  const [pontosGanhos, setPontosGanhos] = useState(0);
  const [pontosDisponiveis, setPontosDisponiveis] = useState(0);

  const avatarsDisponiveis = ['🐧', '🦈', '🦊', '🐨', '🐼', '🦁', '🐯', '🐸', '🦄', '🐱', '🐶', '🐻'];

  const calcularPontosDisponiveis = async (objetivos) => {
    try {
      // Pontos ganhos das tasks do Firestore
      const pontosGanhos = objetivos
        .filter(obj => obj.finalizado)
        .reduce((total, obj) => total + (obj.pontos || 5), 0);
      
      console.log('Profile - Pontos ganhos calculados:', pontosGanhos);
      
      // Pontos gastos - tenta carregar do Firestore primeiro
      let pontosGastos = 0;
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const docRef = doc(db, "users", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            pontosGastos = data.pontosGastos || 0;
            console.log('Profile - Pontos gastos carregados do Firestore:', pontosGastos);
          }
        } catch (error) {
          console.log('Profile - Erro ao carregar pontos gastos do Firestore:', error);
        }
      }
      
      // Fallback: carrega do AsyncStorage se não encontrou no Firestore
      if (pontosGastos === 0) {
        const gastosData = await AsyncStorage.getItem('pontosGastos');
        pontosGastos = gastosData ? parseInt(gastosData) : 0;
        console.log('Profile - Pontos gastos carregados do AsyncStorage:', pontosGastos);
      }
      
      // Pontos disponíveis
      const pontosDisponiveis = pontosGanhos - pontosGastos;
      console.log('Profile - Pontos disponíveis:', pontosDisponiveis);
      setPontosDisponiveis(Math.max(0, pontosDisponiveis)); // Garante que não seja negativo
    } catch (error) {
      console.log('Profile - Erro ao calcular pontos disponíveis:', error);
    }
  };

  const carregarTasks = (objetivos) => {
    try {
      const total = objetivos.length;
      const finalizados = objetivos.filter(t => t.finalizado).length;
      const pontos = objetivos.filter(t => t.finalizado).reduce((sum, t) => sum + (t.pontos || 5), 0);
      
      setTotalObjetivos(total);
      setObjetivosFinalizados(finalizados);
      setPontosGanhos(pontos);
    } catch (error) {
      console.log('Erro ao carregar tasks:', error);
    }
  };

  useEffect(() => {
    carregarDados();
    
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
            console.log('Profile - Dados iniciais carregados:', objetivos.length, 'objetivos');
            carregarTasks(objetivos);
            calcularPontosDisponiveis(objetivos);
          }
        } catch (error) {
          console.log('Profile - Erro ao carregar dados iniciais:', error);
        }
      }
    };
    
    carregarDadosIniciais();
    
    // Atualiza pontos gastos periodicamente (para sincronizar com compras na Shop)
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

  // Listener do Firestore - recria quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.log('Profile - userId não disponível');
        return;
      }

      console.log('Profile - Configurando listener do Firestore para userId:', userId);

      // Listener em tempo real para os objetivos do Firestore
      const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
        console.log('Profile - Firestore atualizado:', docSnap.exists());
        if (docSnap.exists()) {
          const data = docSnap.data();
          const objetivos = data.objetivos || [];
          console.log('Profile - Objetivos recebidos:', objetivos.length, 'objetivos');
          console.log('Profile - Objetivos finalizados:', objetivos.filter(obj => obj.finalizado).length);
          carregarTasks(objetivos);
          calcularPontosDisponiveis(objetivos);
        } else {
          console.log('Profile - Documento não existe no Firestore');
        }
      }, (error) => {
        console.log('Profile - Erro ao carregar dados do Firestore:', error);
      });

      return () => {
        console.log('Profile - Removendo listener do Firestore');
        unsubscribe();
      };
    }, [])
  );

  const carregarDados = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        // Tenta carregar do Firestore primeiro
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.nomeUsuario) {
            setNomeUsuario(data.nomeUsuario);
            setNomePinguim(data.nomePinguim || 'Pinguim');
            setAvatarSelecionado(data.avatar || '🐧');
            console.log('Profile - Dados carregados do Firestore');
            
            // Sincroniza com AsyncStorage
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
      
      // Fallback: carrega do AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const dados = JSON.parse(userData);
        setNomeUsuario(dados.nomeUsuario);
        setNomePinguim(dados.nomePinguim);
        setAvatarSelecionado(dados.avatar || '🐧');
        console.log('Profile - Dados carregados do AsyncStorage');
      }
    } catch (error) {
      console.log('Profile - Erro ao carregar dados:', error);
    }
  };


  const abrirModalEdicao = () => {
    setNovoNomeUsuario(nomeUsuario);
    setNovoNomePinguim(nomePinguim);
    setNovoAvatar(avatarSelecionado);
    setModalEditVisible(true);
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
        dataRegistro: new Date().toISOString()
      };
      
      // Salva no AsyncStorage (para compatibilidade)
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Salva no Firestore
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        await updateDoc(userDocRef, {
          nomeUsuario: userData.nomeUsuario,
          nomePinguim: userData.nomePinguim,
          avatar: userData.avatar,
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
          <TouchableOpacity 
            style={styles.editButton}
            onPress={abrirModalEdicao}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
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

      {/* Modal de Edição Melhorado */}
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

            <View style={styles.avatarSelectionSection}>
              <Text style={styles.avatarSelectionLabel}>Escolha seu avatar</Text>
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
  editIcon: {
    fontSize: 20,
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
    marginBottom: 25,
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
  },
  avatarOptionEmoji: {
    fontSize: 32,
  },
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
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