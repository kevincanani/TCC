import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, SafeAreaView, StatusBar, Modal, TextInput, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../controller';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AlertCustom, AlertProvider } from '../AlertCustom';

export default function Home() {
    const [imagemAtual, setImagemAtual] = useState('azul');
    const [corMascote, setCorMascote] = useState('azul');
    const [acessorioAtual, setAcessorioAtual] = useState('');
    const [nomePinguim, setNomePinguim] = useState('Pinguim');

    // Todas as combinações de cores e acessórios
    const imagens = {
        // Azul
        azul: require('../assets/azul.png'),
        azul_chapeu: require('../assets/azul_chapeu.png'),
        azul_oculos: require('../assets/azul_oculos.png'),
        azul_cachecol: require('../assets/azul_cachecol.png'),
        
        // Verde
        verde: require('../assets/verde.png'),
        verde_chapeu: require('../assets/verde_chapeu.png'),
        verde_oculos: require('../assets/verde_oculos.png'),
        verde_cachecol: require('../assets/verde_cachecol.png'),
        
        // Vermelho
        vermelho: require('../assets/vermelho.png'),
        vermelho_chapeu: require('../assets/vermelho_chapeu.png'),
        vermelho_oculos: require('../assets/vermelho_oculos.png'),
        vermelho_cachecol: require('../assets/vermelho_cachecol.png'),
    };

    // Constrói o nome da imagem baseado na cor e acessório
    const construirNomeImagem = (cor, acessorio) => {
        const corLimpa = cor?.trim() || 'azul';
        const acessorioLimpo = acessorio?.trim() || '';
        
        const nomeImagem = acessorioLimpo !== '' ? `${corLimpa}_${acessorioLimpo}` : corLimpa;
        
        console.log('🎨 construirNomeImagem:', {
            cor: cor,
            corLimpa: corLimpa,
            acessorio: acessorio,
            acessorioLimpo: acessorioLimpo,
            resultado: nomeImagem,
            imagemExiste: !!imagens[nomeImagem]
        });
        
        return nomeImagem;
    };

    const carregarDadosMascote = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (userId) {
                const userDocRef = doc(db, "users", userId);
                const docSnap = await getDoc(userDocRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    // Carrega a cor do mascote
                    if (data.corMascote) {
                        const corSalva = data.corMascote.trim();
                        console.log('Home - Cor carregada do Firestore:', corSalva);
                        setCorMascote(corSalva);
                    }
                    
                    // Carrega o acessório atual
                    if (data.acessorioMascote !== undefined) {
                        const acessorioSalvo = data.acessorioMascote ? data.acessorioMascote.trim() : '';
                        console.log('Home - Acessório carregado do Firestore:', acessorioSalvo);
                        setAcessorioAtual(acessorioSalvo);
                    } else {
                        setAcessorioAtual('');
                    }
                    
                    // Atualiza a imagem com base na cor e acessório
                    const nomeImagem = construirNomeImagem(
                        data.corMascote || 'azul',
                        data.acessorioMascote || ''
                    );
                    console.log('Home - Atualizando para imagem:', nomeImagem);
                    setImagemAtual(nomeImagem);
                    
                    return;
                }
            }
            
            // Fallback: carrega do AsyncStorage
            const corSalva = await AsyncStorage.getItem('corMascote');
            const acessorioSalvo = await AsyncStorage.getItem('acessorioMascote');
            
            if (corSalva) {
                setCorMascote(corSalva);
            }
            if (acessorioSalvo) {
                setAcessorioAtual(acessorioSalvo);
            }
            
            const nomeImagem = construirNomeImagem(
                corSalva || 'azul',
                acessorioSalvo || ''
            );
            setImagemAtual(nomeImagem);
        } catch (error) {
            console.log('Home - Erro ao carregar dados do mascote:', error);
        }
    };

    const carregarNomeMascote = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const dados = JSON.parse(userData);
                if (dados.nomePinguim) {
                    setNomePinguim(dados.nomePinguim);
                }
            }
        } catch (error) {
            console.log('Erro ao carregar nome do mascote:', error);
        }
    };

    useEffect(() => {
  const limparDadosAntigos = async () => {
    try {
      await AsyncStorage.removeItem('acessorioMascote');
      await AsyncStorage.removeItem('pontosGastos');
      await AsyncStorage.removeItem('itensComprados');
      console.log('✅ Dados antigos limpos!');
    } catch (error) {
      console.log('Erro ao limpar:', error);
    }
  };

  limparDadosAntigos();
  carregarDadosMascote();
  carregarNomeMascote();
}, []);

    useEffect(() => {
        carregarDadosMascote();
        carregarNomeMascote();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            console.log('Home - Tela recebeu foco, recarregando dados...');
            carregarDadosMascote();
            carregarNomeMascote();
        }, [])
    );

    const [objetivos, setObjetivos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [novoObjetivoNome, setNovoObjetivoNome] = useState('');
    const [novoObjetivoIcone, setNovoObjetivoIcone] = useState('');

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        
        if (!userId) {
            AlertCustom.alert("Erro", "Usuário não autenticado!");
            return;
        }

        const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Atualiza cor do mascote
                if (data.corMascote) {
                    const corLimpa = data.corMascote.trim();
                    console.log('Home - Firestore: Nova cor recebida:', corLimpa);
                    setCorMascote(corLimpa);
                }
                
                // Atualiza acessório do mascote
                if (data.acessorioMascote !== undefined) {
                    const acessorioLimpo = data.acessorioMascote ? data.acessorioMascote.trim() : '';
                    console.log('Home - Firestore: Novo acessório recebido:', acessorioLimpo);
                    setAcessorioAtual(acessorioLimpo);
                } else {
                    setAcessorioAtual('');
                }

                // Após atualizar cor e acessório
                const corFinal = data.corMascote ? data.corMascote.trim() : corMascote;
                const acessorioFinal = data.acessorioMascote !== undefined ? (data.acessorioMascote ? data.acessorioMascote.trim() : '') : '';
                const novaImagem = construirNomeImagem(corFinal, acessorioFinal);
                console.log('Home - Atualizando imagem para:', novaImagem);
                setImagemAtual(novaImagem);
                
                // Carrega os objetivos
                if (data.objetivos && Array.isArray(data.objetivos)) {
                    setObjetivos(data.objetivos);
                } else {
                    const objetivosPadrao = [
                        {
                            id: 1,
                            title: 'Usar fio-dental',
                            pontos: 5,
                            finalizado: false,
                            icon: '🦷',
                            color: '#8B5CF6'
                        },
                        {
                            id: 2,
                            title: 'Escovar os dentes',
                            pontos: 5,
                            finalizado: false,
                            icon: '🪥',
                            color: '#06B6D4'
                        },
                        {
                            id: 3,
                            title: 'Escrever no diário',
                            pontos: 5,
                            finalizado: false,
                            icon: '📖',
                            color: '#F97316'
                        },
                        {
                            id: 4,
                            title: 'Lavar o rosto',
                            pontos: 5,
                            finalizado: false,
                            icon: '🧼',
                            color: '#EC4899'
                        }
                    ];
                    setObjetivos(objetivosPadrao);
                    salvarObjetivosFirestore(objetivosPadrao);
                }
            }
        }, (error) => {
            console.log('Home - Erro ao carregar dados:', error);
        });

        return () => unsubscribe();
    }, []);

    const salvarObjetivosFirestore = async (novosObjetivos) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                console.log('Home - Erro: userId não disponível');
                return;
            }

            const pontosGanhos = novosObjetivos
                .filter(obj => obj.finalizado)
                .reduce((total, obj) => total + obj.pontos, 0);

            console.log('Home - Salvando objetivos no Firestore:', novosObjetivos.length, 'objetivos');
            console.log('Home - Pontos ganhos:', pontosGanhos);

            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            
            const dadosParaSalvar = {
                objetivos: novosObjetivos,
                pontosTotais: pontosGanhos,
                ultimaAtualizacao: new Date().toISOString()
            };

            if (docSnap.exists()) {
                await updateDoc(docRef, dadosParaSalvar);
                console.log('Home - Objetivos atualizados no Firestore');
            } else {
                await setDoc(docRef, dadosParaSalvar, { merge: true });
                console.log('Home - Documento criado no Firestore');
            }
            
            console.log('Home - Objetivos salvos com sucesso no Firestore');
        } catch (error) {
            console.log('Home - Erro ao salvar objetivos:', error);
            console.log('Home - Detalhes do erro:', error.message);
        }
    };

    const finalizadoObjetivos = objetivos.filter(objetivo => objetivo.finalizado).length;
    const totalObjetivos = objetivos.length;
    const remainingObjetivos = totalObjetivos - finalizadoObjetivos;
    
    const [pontosDisponiveis, setPontosDisponiveis] = useState(0);

    useEffect(() => {
        calcularPontosDisponiveis();
        const interval = setInterval(calcularPontosDisponiveis, 1000);
        return () => clearInterval(interval);
    }, [objetivos]);

    const calcularPontosDisponiveis = async () => {
        try {
            const pontosGanhos = objetivos.filter(objetivo => objetivo.finalizado).reduce((total, objetivo) => total + objetivo.pontos, 0);
            
            let pontosGastos = 0;
            const userId = auth.currentUser?.uid;
            if (userId) {
                try {
                    const docRef = doc(db, "users", userId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        pontosGastos = data.pontosGastos || 0;
                    }
                } catch (error) {
                    console.log('Home - Erro ao carregar pontos gastos do Firestore:', error);
                }
            }
            
            if (pontosGastos === 0) {
                const gastosData = await AsyncStorage.getItem('pontosGastos');
                pontosGastos = gastosData ? parseInt(gastosData) : 0;
            }
            
            const disponiveis = pontosGanhos - pontosGastos;
            setPontosDisponiveis(disponiveis);
        } catch (error) {
            console.log('Home - Erro ao calcular pontos:', error);
        }
    };

    const toggleObjetivo = (objetivoId) => {
        const novosObjetivos = objetivos.map(objetivo =>
            objetivo.id === objetivoId ? { ...objetivo, finalizado: !objetivo.finalizado } : objetivo
        );
        setObjetivos(novosObjetivos);
        salvarObjetivosFirestore(novosObjetivos);
    };

    const deleteObjetivo = (objetivoId) => {
        const novosObjetivos = objetivos.filter(objetivo => objetivo.id !== objetivoId);
        setObjetivos(novosObjetivos);
        salvarObjetivosFirestore(novosObjetivos);
    };

    const adicionarObjetivo = () => {
        if (objetivos.length >= 12) {
            AlertCustom.alert(
                "Limite atingido", 
                "Você atingiu o número máximo de 10 tarefas. Delete uma tarefa existente para adicionar uma nova.",
                [{ text: "OK" }]
            );
            return;
        }

        if (novoObjetivoNome.trim() === '') {
            AlertCustom.alert("Atenção", "Digite um nome para o objetivo!");
            return;
        }

        const coresObjetivos = ['#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#10B981', '#F59E0B'];
        const corAleatoria = coresObjetivos[Math.floor(Math.random() * coresObjetivos.length)];

        const novoObjetivo = {
            id: Date.now(),
            title: novoObjetivoNome,
            pontos: 5,
            finalizado: false,
            icon: novoObjetivoIcone || '⭐',
            color: corAleatoria
        };

        const novosObjetivos = [...objetivos, novoObjetivo];
        setObjetivos(novosObjetivos);
        salvarObjetivosFirestore(novosObjetivos);
        fecharModal();
    };

    const fecharModal = () => {
        setModalVisible(false);
        setNovoObjetivoNome('');
        setNovoObjetivoIcone('');
    };

    const renderObjetivoItem = (objetivo) => (
        <TouchableOpacity
            key={objetivo.id}
            style={styles.objetivoItem}
            onPress={() => toggleObjetivo(objetivo.id)}
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
                </View>

                <View style={styles.objetivoRight}>
                    <View style={styles.actionButtons}>
                        <View style={styles.pontosContainer}>
                            <Text style={styles.pontosText}>{objetivo.pontos}</Text>
                            <Text style={styles.pontosIconSmall}>⚡</Text>
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
                        {remainingObjetivos} objetivos a serem finalizados hoje!
                    </Text>
                    <View style={styles.pontosHeader}>
                        <Text style={styles.pontosHeaderText}>{pontosDisponiveis}</Text>
                        <Text style={styles.pontosHeaderIcon}>⚡</Text>
                    </View>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.mascoteCard}>
                    <View style={styles.imageContainer}>
                        {imagens[imagemAtual] ? (
                            <Image
                                style={styles.img}
                                source={imagens[imagemAtual]}
                            />
                        ) : (
                            <Text style={styles.errorText}>
                                Erro ao carregar imagem: {imagemAtual}
                            </Text>
                        )}
                    </View>
                    
                    <Text style={styles.imageLabel}>
                        {nomePinguim}
                    </Text>
                    
                    <Text style={styles.dica}>
                        💡 Compre acessórios na loja e altere a cor no perfil!
                    </Text>
                </View>

                <View style={styles.objetivosSection}>
                    <Text style={styles.sectionTitle}>Seus Objetivos</Text>
                    
                    {objetivos.map(renderObjetivoItem)}
                    
                    <TouchableOpacity 
                        style={styles.addObjetivoButton} 
                        activeOpacity={0.8}
                        onPress={() => setModalVisible(true)}
                    >
                        <View style={styles.addObjetivoContent}>
                            <Text style={styles.addObjetivoIcon}>+</Text>
                            <Text style={styles.addObjetivoText}>Adicionar objetivo</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de Novo Objetivo */}
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
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    // Estilos do Mascote
    mascoteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 25,
        shadowColor: '#2D5A2D',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    imageContainer: {
        backgroundColor: '#F1F8E9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#A5D6A7',
    },
    img: {
        width: 100,
        height: 160,
        borderRadius: 10,
    },
    imageLabel: {
        fontSize: 15,
        color: '#388E3C',
        fontWeight: '600',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '600',
        textAlign: 'center',
    },
    dica: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 5,
    },
    // Estilos dos Objetivos
    objetivosSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
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
    pontosIconSmall: {
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
    addObjetivoButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        marginTop: 20,
    },
    addObjetivoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    addObjetivoIcon: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 12,
    },
    addObjetivoText: {
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
        fontWeight: 'bold',
    },
});