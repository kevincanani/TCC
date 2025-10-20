import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, Modal, TextInput } from 'react-native';

const { width } = Dimensions.get('window');

export default function Home() {
  const [objetivos, setobjetivos] = useState([
    {
      id: 1,
      title: 'Usar fio-dental',
      pontos: 5,
      finalizado: true,
      icon: '🦷',
      color: '#8B5CF6'
    },
    {
      id: 2,
      title: 'Escovar os dentes',
      pontos: 5,
      finalizado: false,
      progresso: '1 / 2',
      icon: '🪥',
      color: '#06B6D4'
    },
    {
      id: 3,
      title: 'Escrever no diário',
      pontos: 5,
      finalizado: true,
      icon: '📖',
      color: '#F97316'
    },
    {
      id: 4,
      title: 'Lavar o rosto',
      pontos: 5,
      finalizado: true,
      icon: '🧼',
      color: '#EC4899'
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [novoObjetivoNome, setNovoObjetivoNome] = useState('');
  const [novoObjetivoIcone, setNovoObjetivoIcone] = useState('');

  const finalizadoobjetivos = objetivos.filter(objetivo => objetivo.finalizado).length;
  const totalobjetivos = objetivos.length;
  const remainingobjetivos = totalobjetivos - finalizadoobjetivos;
  const pontosGanhos = objetivos.filter(objetivo => objetivo.finalizado).reduce((total, objetivo) => total + objetivo.pontos, 0);

  const toggleobjetivo = (objetivoId) => {
    setobjetivos(prevobjetivos =>
      prevobjetivos.map(objetivo =>
        objetivo.id === objetivoId ? { ...objetivo, finalizado: !objetivo.finalizado } : objetivo
      )
    );
  };

  const deleteObjetivo = (objetivoId) => {
    setobjetivos(prevobjetivos =>
      prevobjetivos.filter(objetivo => objetivo.id !== objetivoId)
    );
  };

  const adicionarObjetivo = () => {
    if (novoObjetivoNome.trim() === '') {
      return;
    }

    const cores = ['#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#10B981', '#F59E0B'];
    const corAleatoria = cores[Math.floor(Math.random() * cores.length)];

    const novoObjetivo = {
      id: Date.now(),
      title: novoObjetivoNome,
      pontos: 5,
      finalizado: false,
      icon: novoObjetivoIcone || '⭐',
      color: corAleatoria
    };

    setobjetivos(prevobjetivos => [...prevobjetivos, novoObjetivo]);
    fecharModal();
  };

  const fecharModal = () => {
    setModalVisible(false);
    setNovoObjetivoNome('');
    setNovoObjetivoIcone('');
  };

  const renderobjetivoItem = (objetivo) => (
    <TouchableOpacity
      key={objetivo.id}
      style={styles.objetivoItem}
      onPress={() => toggleobjetivo(objetivo.id)}
      activeOpacity={0.8}
    >
      <View style={styles.objetivoContent}>
        <View style={[styles.iconContainer, { backgroundColor: objetivo.color + '20' }]}>
          <Text style={styles.objetivoIcon}>{objetivo.icon}</Text>
        </View>
        
        <View style={styles.objetivoInfo}>
          <View style={styles.titleRow}>
            {objetivo.progresso && (
              <Text style={styles.progressoText}>{objetivo.progresso} </Text>
            )}
            <Text style={styles.objetivoTitle}>{objetivo.title}</Text>
          </View>
          <Text style={styles.objetivocategoria}>{objetivo.categoria}</Text>
        </View>

        <View style={styles.objetivoRight}>
          <View style={styles.actionButtons}>
            <View style={styles.pontosContainer}>
              <Text style={styles.pontosText}>{objetivo.pontos}</Text>
              <Text style={styles.pontosIcon}>⚡</Text>
            </View>

            <View style={[
              styles.statusButton,
              objetivo.finalizado ? styles.finalizadoButton : styles.pendingButton
            ]}>
              {objetivo.finalizado ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.plusIcon}>+</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                deleteObjetivo(objetivo.id);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            {remainingobjetivos} objetivos a serem finalizadas hoje!
          </Text>
          <View style={styles.pontosHeader}>
            <Text style={styles.pontosHeaderText}>{pontosGanhos}</Text>
            <Text style={styles.pontosHeaderIcon}>⚡</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.objetivosList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.objetivosContainer}
      >
        {objetivos.map(renderobjetivoItem)}
        
        <TouchableOpacity 
          style={styles.addobjetivoButton} 
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.addobjetivoContent}>
            <Text style={styles.addobjetivoIcon}>+</Text>
            <Text style={styles.addobjetivoText}>Adicionar objetivo</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para adicionar novo objetivo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={fecharModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Objetivo</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome da tarefa</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Fazer exercícios"
                placeholderTextColor="#9CA3AF"
                value={novoObjetivoNome}
                onChangeText={setNovoObjetivoNome}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ícone (emoji)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 💪"
                placeholderTextColor="#9CA3AF"
                value={novoObjetivoIcone}
                onChangeText={setNovoObjetivoIcone}
                maxLength={2}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={fecharModal}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Descartar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={adicionarObjetivo}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
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
    backgroundColor: '#4CAF50',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pontosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  pontosHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pontosHeaderIcon: {
    fontSize: 18,
  },
  calendarIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 12,
  },
  objetivosList: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  objetivosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  objetivoItem: {
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
  },
  objetivoContent: {
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
  objetivoIcon: {
    fontSize: 24,
  },
  objetivoInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 4,
  },
  objetivoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  objetivocategoria: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  objetivoRight: {
    alignItems: 'flex-end',
  },
  pontosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  pontosText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  pontosIcon: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalizadoButton: {
    backgroundColor: '#10B981',
  },
  pendingButton: {
    backgroundColor: '#E5E7EB',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  plusIcon: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 16,
  },
  addobjetivoButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    marginTop: 20,
  },
  addobjetivoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addobjetivoIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  addobjetivoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});