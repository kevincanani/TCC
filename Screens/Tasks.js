import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';

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

  const finalizadoobjetivos = objetivos.filter(objetivo => objetivo.finalizado).length;
  const totalobjetivos = objetivos.length;
  const remainingobjetivos = totalobjetivos - finalizadoobjetivos;

  const toggleobjetivo = (objetivoId) => {
    setobjetivos(prevobjetivos =>
      prevobjetivos.map(objetivo =>
        objetivo.id === objetivoId ? { ...objetivo, finalizado: !objetivo.finalizado } : objetivo
      )
    );
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
        </View>
      </View>

      <ScrollView 
        style={styles.objetivosList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.objetivosContainer}
      >
        {objetivos.map(renderobjetivoItem)}
        
        <TouchableOpacity style={styles.addobjetivoButton} activeOpacity={0.8}>
          <View style={styles.addobjetivoContent}>
            <Text style={styles.addobjetivoIcon}>+</Text>
            <Text style={styles.addobjetivoText}>Adicionar objetivo</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
  calendarIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 15,
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
    alignItems: 'center',
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
});