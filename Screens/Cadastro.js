import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native"
import { useState } from 'react';
import { auth, db } from "../controller";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Cadastro({ navigation }) {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const RegistroUsuario = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            
            console.log("Usuário cadastrado no Authentication!", user.email);
            
            // Cria documento inicial no Firestore
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                email: user.email,
                nomeUsuario: '',
                nomePinguim: '',
                avatar: '🐧',
                objetivos: [],
                pontosTotais: 0,
                pontosGastos: 0,
                itensComprados: [],
                imagemMascote: 'bicho',
                dataRegistro: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString()
            });
            
            console.log("Documento criado no Firestore para usuário:", user.uid);
            navigation.navigate('Login');
        } catch (error) {
            console.log('Erro ao cadastrar:', error.message);
            alert('Erro ao cadastrar: ' + error.message);
        }
    }

    return (
        <View style={styles.containerCadastro}>
            <Text style={styles.textTitle}>Cadastro</Text>

            <Image style={styles.img} source={require('../assets/logo.png')} />

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
});