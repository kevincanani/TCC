import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Animated, 
    Modal, 
    TextInput, 
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../controller';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';

export default function Welcome({ navigation, route }) {
    const [etapaAtual, setEtapaAtual] = useState('inicial'); // inicial, dados, cor, finalizando
    const [modalVisible, setModalVisible] = useState(false);
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [nomePinguim, setNomePinguim] = useState('');
    const [corSelecionada, setCorSelecionada] = useState('azul');
    const [jaTemDados, setJaTemDados] = useState(false);
    const [mensagemBemVindo, setMensagemBemVindo] = useState('Bem-vindo ao');
    
    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pinguimFadeAnim = useRef(new Animated.Value(0)).current;
    const pinguimScaleAnim = useRef(new Animated.Value(0.5)).current;

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

    useEffect(() => {
        iniciarTela();
    }, []);

    useEffect(() => {
  const adicionarCampoFaltante = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          acessorioMascote: ''
        });
        console.log('✅ Campo acessorioMascote adicionado!');
      }
    } catch (error) {
      console.log('Erro ao adicionar campo:', error);
    }
  };
  
  adicionarCampoFaltante();
}, []);

    const iniciarTela = async () => {
        // Inicia animação
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                delay: 300,
                useNativeDriver: true,
            })
        ]).start();

        // Aguarda um pouco para animação aparecer
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verifica se tem dados salvos
        await verificarDados();
    };

    const verificarDados = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            
            if (userData) {
                // Usuário já tem dados - voltando
                setJaTemDados(true);
                setMensagemBemVindo('Bem-vindo de volta!');
                
                // Aguarda mais um pouco e vai para Home
                setTimeout(() => {
                    navigation.replace('Home');
                }, 1500);
            } else {
                // Usuário novo - primeira vez
                setJaTemDados(false);
                setMensagemBemVindo('Bem-vindo ao');
                
                // Mostra o modal após animação
                setTimeout(() => {
                    setModalVisible(true);
                    setEtapaAtual('dados');
                }, 500);
            }
        } catch (error) {
            console.log('Erro ao verificar dados:', error);
            // Em caso de erro, mostra o modal
            setModalVisible(true);
            setEtapaAtual('dados');
        }
    };

    const avancarParaEscolhaCor = () => {
        if (nomeUsuario.trim() === '' || nomePinguim.trim() === '') {
            alert('Por favor, preencha todos os campos! 😊');
            return;
        }

        // Animação de saída do formulário
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setEtapaAtual('cor');
            
            // Animação de entrada do pinguim
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(pinguimScaleAnim, {
                    toValue: 1,
                    tension: 10,
                    friction: 4,
                    useNativeDriver: true,
                }),
                Animated.timing(pinguimFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    delay: 200,
                    useNativeDriver: true,
                })
            ]).start();
        });
    };

    const finalizarCadastro = async () => {
        try {
            // Animação de saída
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start();

            setEtapaAtual('finalizando');

            const userId = auth.currentUser?.uid;
            if (!userId) {
                alert('Erro: usuário não autenticado!');
                return;
            }

            const userData = {
                nomeUsuario: nomeUsuario.trim(),
                nomePinguim: nomePinguim.trim(),
                avatar: '🐧',
                corMascote: corSelecionada,
                acessorioMascote: '',
                dataRegistro: new Date().toISOString()
            };
            
            // Salva no AsyncStorage (para compatibilidade)
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('corMascote', corSelecionada);
            
            // Salva no Firestore
            const userDocRef = doc(db, "users", userId);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
                // Atualiza documento existente
                await updateDoc(userDocRef, {
                    nomeUsuario: userData.nomeUsuario,
                    nomePinguim: userData.nomePinguim,
                    avatar: userData.avatar,
                    corMascote: corSelecionada,
                    acessorioMascote: '',
                    ultimaAtualizacao: new Date().toISOString()
                });
                console.log('Welcome - Dados atualizados no Firestore');
            } else {
                // Cria documento se não existir
                await setDoc(userDocRef, {
                    email: auth.currentUser?.email || '',
                    ...userData,
                    objetivos: [],
                    pontosTotais: 0,
                    pontosGastos: 0,
                    itensComprados: [],
                    imagemMascote: 'bicho'
                }, { merge: true });
                console.log('Welcome - Documento criado no Firestore');
            }
            
            // Animação de entrada da mensagem final
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.delay(1500)
            ]).start(() => {
                // Fecha modal
                setModalVisible(false);
                
                // Navega para Home
                setTimeout(() => {
                    navigation.replace('Home');
                }, 500);
            });
        } catch (error) {
            console.log('Erro ao salvar dados:', error);
            alert('Erro ao salvar. Tente novamente!');
        }
    };

    const renderEtapaDados = () => (
        <Animated.View style={[styles.etapaContainer, { opacity: fadeAnim }]}>
            <Text style={styles.modalEmoji}>🐧</Text>
            <Text style={styles.modalTitle}>Vamos nos conhecer!</Text>
            <Text style={styles.modalSubtitle}>
                Precisamos de algumas informações para personalizar sua experiência
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>👤 Seu nome</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu nome"
                    placeholderTextColor="#95A5A6"
                    value={nomeUsuario}
                    onChangeText={setNomeUsuario}
                    autoCapitalize="words"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🐧 Nome do seu pinguim</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Pingu, Gelinho, Frosty..."
                    placeholderTextColor="#95A5A6"
                    value={nomePinguim}
                    onChangeText={setNomePinguim}
                    autoCapitalize="words"
                />
            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                onPress={avancarParaEscolhaCor}
                activeOpacity={0.8}
            >
                <Text style={styles.confirmButtonText}>Continuar ➜</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderEtapaCor = () => (
        <Animated.View style={[styles.etapaContainer, { opacity: fadeAnim }]}>
            <Text style={styles.modalTitle}>Escolha a cor do {nomePinguim}! 🎨</Text>
            <Text style={styles.modalSubtitle}>
                Selecione a cor que mais combina com você
            </Text>

            <Animated.View 
                style={[
                    styles.pinguimPreview,
                    {
                        opacity: pinguimFadeAnim,
                        transform: [{ scale: pinguimScaleAnim }]
                    }
                ]}
            >
                <Image
                    style={styles.pinguimImage}
                    source={imagensPinguim[corSelecionada]}
                />
                <Text style={styles.pinguimNome}>✨ {nomePinguim} ✨</Text>
            </Animated.View>

            <View style={styles.coresContainer}>
                {cores.map((cor) => (
                    <TouchableOpacity
                        key={cor.id}
                        style={[
                            styles.corItem,
                            { borderColor: cor.cor },
                            corSelecionada === cor.id && styles.corSelecionada
                        ]}
                        onPress={() => {
                            setCorSelecionada(cor.id);
                            // Pequena animação ao trocar
                            Animated.sequence([
                                Animated.timing(pinguimScaleAnim, {
                                    toValue: 0.9,
                                    duration: 100,
                                    useNativeDriver: true,
                                }),
                                Animated.spring(pinguimScaleAnim, {
                                    toValue: 1,
                                    tension: 20,
                                    friction: 3,
                                    useNativeDriver: true,
                                })
                            ]).start();
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.corCirculo, { backgroundColor: cor.cor }]}>
                            <Text style={styles.corEmoji}>{cor.emoji}</Text>
                        </View>
                        <Text style={styles.corNome}>{cor.nome}</Text>
                        {corSelecionada === cor.id && (
                            <Text style={styles.corCheckmark}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                onPress={finalizarCadastro}
                activeOpacity={0.8}
            >
                <Text style={styles.confirmButtonText}>Confirmar Escolha! 🚀</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderEtapaFinalizando = () => (
        <Animated.View style={[styles.etapaContainer, { opacity: fadeAnim }]}>
            <Text style={styles.loadingEmoji}>✨</Text>
            <Text style={styles.loadingTitle}>Tudo pronto!</Text>
            <Text style={styles.loadingSubtitle}>
                Aguarde alguns instantes...
            </Text>
            <View style={styles.loadingDots}>
                <Text style={styles.dot}>●</Text>
                <Text style={styles.dot}>●</Text>
                <Text style={styles.dot}>●</Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <Image 
                    style={styles.logo} 
                    source={require('../assets/logo_platlist.png')}
                />
                
                <Animated.View 
                    style={[
                        styles.textContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.welcomeText}>{mensagemBemVindo}</Text>
                    <Text style={styles.appName}>Platlist</Text>
                    <Text style={styles.subtitle}>
                        {jaTemDados ? 'Carregando... 🎯' : 'Vamos começar sua jornada! 🎯'}
                    </Text>
                </Animated.View>
            </Animated.View>

            {/* Modal de Cadastro - Agora com etapas */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {}}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        {etapaAtual === 'dados' && renderEtapaDados()}
                        {etapaAtual === 'cor' && renderEtapaCor()}
                        {etapaAtual === 'finalizando' && renderEtapaFinalizando()}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        borderRadius: 30,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    textContainer: {
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 5,
        textAlign: 'center',
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#E8F5E9',
        fontWeight: '500',
        textAlign: 'center',
    },
    // Estilos do Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    etapaContainer: {
        width: '100%',
    },
    modalEmoji: {
        fontSize: 60,
        textAlign: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
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
    confirmButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#4CAF50',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Estilos da etapa de escolha de cor
    pinguimPreview: {
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: '#F0F9FF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 3,
        borderColor: '#BFDBFE',
    },
    pinguimImage: {
        width: 120,
        height: 180,
        resizeMode: 'contain',
    },
    pinguimNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginTop: 10,
    },
    coresContainer: {
        gap: 12,
        marginVertical: 20,
    },
    corItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        borderWidth: 3,
        borderColor: 'transparent',
        gap: 16,
    },
    corSelecionada: {
        backgroundColor: '#F0F9FF',
        borderWidth: 3,
        transform: [{ scale: 1.02 }],
    },
    corCirculo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    corEmoji: {
        fontSize: 24,
    },
    corNome: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    corCheckmark: {
        fontSize: 24,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    // Estilos da etapa de finalização
    loadingEmoji: {
        fontSize: 80,
        textAlign: 'center',
        marginBottom: 20,
    },
    loadingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        textAlign: 'center',
        marginBottom: 10,
    },
    loadingSubtitle: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 30,
    },
    loadingDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    dot: {
        fontSize: 24,
        color: '#4CAF50',
        opacity: 0.5,
    },
});