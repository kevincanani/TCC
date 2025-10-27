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

export default function Welcome({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [nomePinguim, setNomePinguim] = useState('');
    const [jaTemDados, setJaTemDados] = useState(false);
    
    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Verifica se já tem dados salvos
        checkUserData();
        
        // Animação inicial
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
        ]).start(() => {
            // Após animação, decide o que fazer
            setTimeout(() => {
                checkUserData();
            }, 800);
        });
    }, []);

    const checkUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                // Se já tem dados, vai direto para Home após animação
                setJaTemDados(true);
                setTimeout(() => {
                    navigation.replace('Home');
                }, 1500);
            } else {
                // Se não tem dados, mostra o modal
                setModalVisible(true);
            }
        } catch (error) {
            console.log('Erro ao verificar dados:', error);
            setModalVisible(true);
        }
    };

    const salvarDados = async () => {
        if (nomeUsuario.trim() === '' || nomePinguim.trim() === '') {
            alert('Por favor, preencha todos os campos! 😊');
            return;
        }

        try {
            const userData = {
                nomeUsuario: nomeUsuario.trim(),
                nomePinguim: nomePinguim.trim(),
                avatar: '🐧', // Avatar padrão
                dataRegistro: new Date().toISOString()
            };
            
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            // Animação de saída do modal
            setModalVisible(false);
            
            // Navega para Home após salvar
            setTimeout(() => {
                navigation.replace('Home');
            }, 500);
        } catch (error) {
            console.log('Erro ao salvar dados:', error);
            alert('Erro ao salvar. Tente novamente!');
        }
    };

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
                    source={require('../assets/logo.png')}
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
                    <Text style={styles.welcomeText}>
                        {jaTemDados ? 'Bem-vindo de volta!' : 'Bem-vindo ao'}
                    </Text>
                    <Text style={styles.appName}>Platlist</Text>
                    <Text style={styles.subtitle}>
                        {jaTemDados ? 'Carregando... 🎯' : 'Vamos começar sua jornada! 🎯'}
                    </Text>
                </Animated.View>
            </Animated.View>

            {/* Modal de Cadastro - Só aparece na primeira vez */}
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
                            onPress={salvarDados}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.confirmButtonText}>Começar Aventura! 🚀</Text>
                        </TouchableOpacity>

                        <Text style={styles.privacyText}>
                            Suas informações ficam salvas apenas no seu dispositivo 🔒
                        </Text>
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
    privacyText: {
        fontSize: 12,
        color: '#95A5A6',
        textAlign: 'center',
        marginTop: 15,
    },
});