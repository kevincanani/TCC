import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Modal, Animated, KeyboardAvoidingView, Platform } from "react-native"
import { useState, useRef } from 'react';
import { auth, db } from "../controller";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Cadastro({ navigation }) {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [nomePinguim, setNomePinguim] = useState('');
    const [corSelecionada, setCorSelecionada] = useState('azul');
    const [etapaCadastro, setEtapaCadastro] = useState('credenciais'); // credenciais, dados, cor
    const [modalVisible, setModalVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pinguimFadeAnim = useRef(new Animated.Value(0)).current;
    const pinguimScaleAnim = useRef(new Animated.Value(0.5)).current;

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

    const RegistroUsuario = async () => {
        if (!email.trim() || !senha.trim()) {
            alert('Por favor, preencha email e senha!');
            return;
        }
        
        // Avança para próxima etapa ao invés de criar conta imediatamente
        setEtapaCadastro('dados');
        setModalVisible(true);
    }

    const avancarParaEscolhaCor = () => {
        if (nomeUsuario.trim() === '' || nomePinguim.trim() === '') {
            alert('Por favor, preencha todos os campos! 😊');
            return;
        }

        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setEtapaCadastro('cor');
            
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

    const finalizarCadastroCompleto = async () => {
        try {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start();

            // Agora sim cria o usuário no Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            
            console.log("Usuário cadastrado no Authentication!", user.email);
            
            // Cria documento completo no Firestore
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                email: user.email,
                nomeUsuario: nomeUsuario.trim(),
                nomePinguim: nomePinguim.trim(),
                avatar: '🧊',
                corMascote: corSelecionada,
                objetivos: [],
                pontosTotais: 0,
                pontosTotaisAcumulados: 0,
                pontosGastos: 0,
                itensComprados: [],
                acessoriosMascote: [],
                imagemMascote: 'bicho',
                dataRegistro: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString()
            });
            
            console.log("Documento criado no Firestore para usuário:", user.uid);
            
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    setModalVisible(false);
                    navigation.navigate('Login');
                }, 1500);
            });
            
        } catch (error) {
            console.log('Erro ao cadastrar:', error.message);
            alert('Erro ao cadastrar: ' + error.message);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
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
                    onPress={finalizarCadastroCompleto}
                    activeOpacity={0.8}
                >
                    <Text style={styles.confirmButtonText}>Confirmar Escolha! 🚀</Text>
                </TouchableOpacity>
            </Animated.View>
        );

    return (
        <View style={styles.containerCadastro}>
            <Text style={styles.textTitle}>Cadastro</Text>

            <Image style={styles.img} source={require('../assets/logo_platlist.png')} />

            <Text style={styles.txt}>Se você ainda não possui uma conta,</Text>
            <Text style={styles.txt}>cadastre-se para acessar nossos serviços.</Text>

            <View style={styles.viewInput}>
                <TextInput
                    style={styles.txtInput}
                    placeholder='Email'
                    placeholderTextColor={'black'}
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.txtInput}
                    placeholder='Senha'
                    placeholderTextColor={'black'}
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={true}
                />

                <TouchableOpacity onPress={RegistroUsuario}>
                    <Text style={styles.txtBtn}>Cadastre-se</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.txtFooter}>Já possui uma conta?</Text>
            <Text style={styles.txtFooter}>Faça login agora.</Text>

            <TouchableOpacity 
                style={styles.btn}
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.txtBtn}>Fazer Login</Text>
            </TouchableOpacity>

{/* Modal de Cadastro com etapas */}
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
                        {etapaCadastro === 'dados' && renderEtapaDados()}
                        {etapaCadastro === 'cor' && renderEtapaCor()}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    containerCadastro: {
        flex: 1,
        backgroundColor: '#F1F8E9',
        color: '#FFFFFF'
    },
    txtInput: {
        fontWeight: 'bold',
        width: 325,
        borderWidth: 2,
        borderColor: '#A5D6A7',
        borderRadius: 15,
        padding: 15,
        alignSelf: 'center',
        margin: 15,
        backgroundColor: '#F1F8E9'
    },
    textTitle: {
        padding: 25,
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    btn: {
        alignItems: 'center',
        padding: 30
    },
    txtBtn: {
        color: '#FFF',
        fontWeight: 'bold',
        alignSelf: 'center',
        padding: 15,
        paddingLeft: 30,
        paddingRight: 30,
        borderColor: '#388E3C',
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: '#66BB6A',
        margin: 10
    },
    txt: {
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 16,
        marginTop: 5
    },
    txtFooter: {
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 20
    },
    viewInput: {
        padding: 30
    },
    img: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        borderRadius: 20,
        marginBottom: 15
    },
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
        padding: 20, // reduzido de 30
        width: '100%',
        maxWidth: 400,
        maxHeight: '85%', // adicionar
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
        fontSize: 50, // reduzido de 60
        textAlign: 'center',
        marginBottom: 10, // reduzido de 15
    },
    modalTitle: {
        fontSize: 22, // reduzido de 26
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 8, // reduzido de 10
    },
    modalSubtitle: {
        fontSize: 14, // reduzido de 15
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 15, // reduzido de 25
        lineHeight: 20, // reduzido de 22
    },
    inputContainer: {
    marginBottom: 15, // reduzido de 20
},
inputLabel: {
    fontSize: 15, // reduzido de 16
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6, // reduzido de 8
},
input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 14, // reduzido de 16
    fontSize: 15, // reduzido de 16
    color: '#2C3E50',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    fontWeight: '500',
},
confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14, // reduzido de 16
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // reduzido de 10
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
        fontSize: 17, // reduzido de 18
        fontWeight: 'bold',
    },
    pinguimPreview: {
        alignItems: 'center',
        marginVertical: 15, // reduzido de 20
        backgroundColor: '#F0F9FF',
        borderRadius: 20,
        padding: 15, // reduzido de 20
        borderWidth: 3,
        borderColor: '#BFDBFE',
    },
    pinguimImage: {
        width: 100, // reduzido de 120
        height: 150, // reduzido de 180
        resizeMode: 'contain',
    },
    pinguimNome: {
        fontSize: 16, // reduzido de 18
        fontWeight: 'bold',
        color: '#2C3E50',
        marginTop: 8, // reduzido de 10
    },
    coresContainer: {
        gap: 10, // reduzido de 12
        marginVertical: 15, // reduzido de 20
    },
    corItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 12, // reduzido de 16
        borderWidth: 3,
        borderColor: 'transparent',
        gap: 12, // reduzido de 16
    },
    corSelecionada: {
        backgroundColor: '#F0F9FF',
        borderWidth: 3,
        transform: [{ scale: 1.02 }],
    },
    corCirculo: {
        width: 45, // reduzido de 50
        height: 45, // reduzido de 50
        borderRadius: 22.5,
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
        fontSize: 22, // reduzido de 24
    },
    corNome: {
        flex: 1,
        fontSize: 16, // reduzido de 18
        fontWeight: '600',
        color: '#1F2937',
    },
    corCheckmark: {
        fontSize: 22, // reduzido de 24
        color: '#4CAF50',
        fontWeight: 'bold',
    },
});