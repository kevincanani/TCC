import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState } from 'react';
import { auth, db } from "../controller";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Cadastro({navigation}) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const CadastrarUser = async () => {
        if (!nome.trim() || !email.trim() || !senha.trim()) {
            Alert.alert("Erro", "Por favor, preencha todos os campos!");
            return;
        }

        try {
            // Cria o usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            // Adiciona informações do usuário no Firestore
            await setDoc(doc(db, "users", user.uid), {
                nome: nome,
                email: email,
                criadoEm: new Date().toISOString(),
                pontosTotais: 0,
                objetivos: []
            });

            Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
            navigation.navigate('Login');
        } catch (error) {
            console.log('Erro ao cadastrar: ', error.message);
            
            let mensagemErro = "Erro ao cadastrar usuário!";
            if (error.code === 'auth/email-already-in-use') {
                mensagemErro = "Este e-mail já está em uso!";
            } else if (error.code === 'auth/weak-password') {
                mensagemErro = "A senha deve ter pelo menos 6 caracteres!";
            } else if (error.code === 'auth/invalid-email') {
                mensagemErro = "E-mail inválido!";
            }
            
            Alert.alert("Erro", mensagemErro);
        }
    }

    return(
        <View style={styles.containerCadastro}>
            <Text style={styles.textTitle}>Cadastro</Text>

            <Image style={styles.img} source={require('../assets/logo.png')}/>

            <View style={styles.viewInput}>
                <TextInput
                    style={styles.txtInput}
                    placeholder='Nome completo'
                    placeholderTextColor={'#666'}
                    value={nome}
                    onChangeText={setNome}
                />

                <TextInput
                    style={styles.txtInput}
                    placeholder='Email'
                    placeholderTextColor={'#666'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                />

                <TextInput
                    style={styles.txtInput}
                    placeholder='Senha (mínimo 6 caracteres)'
                    placeholderTextColor={'#666'}
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={true}
                />

                <TouchableOpacity 
                    style={styles.btnCadastrar}
                    onPress={CadastrarUser}
                    activeOpacity={0.8}
                >
                    <Text style={styles.txtBtn}>Cadastrar</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.txt}>Já possui uma conta?</Text>

            <TouchableOpacity 
                style={styles.btnLogin}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
            >
                <Text style={styles.txtBtn}>Fazer Login</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    containerCadastro:{
        flex: 1,
        backgroundColor: '#F1F8E9',
        justifyContent: 'center'
    },
    txtInput:{
        fontWeight: 'bold',
        width: 325,
        borderWidth: 2,
        borderColor: '#A5D6A7',
        borderRadius: 15,
        padding: 15,
        alignSelf: 'center',
        margin: 10,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        color: '#000'
    },
    textTitle:{
        fontSize: 28,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
        color: '#2E7D32'
    },
    btnCadastrar:{
        alignSelf: 'center',
        marginTop: 10
    },
    btnLogin:{
        alignSelf: 'center',
        marginTop: 10
    },
    txtBtn:{
        color: '#FFF',
        fontWeight: 'bold',
        padding: 15,
        paddingLeft: 30,
        paddingRight: 30,
        borderColor: '#388E3C',
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: '#66BB6A',
        fontSize: 16
    },
    txt:{
        fontWeight: '600',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 16,
        marginTop: 20,
        color: '#2E7D32'
    },
    viewInput:{
        paddingVertical: 20
    },
    img:{
        width: 150,
        height: 150,
        alignSelf: 'center',
        borderRadius: 20,
        marginBottom: 20
    },
});