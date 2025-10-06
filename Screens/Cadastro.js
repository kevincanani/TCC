import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { useState } from 'react';
import { auth, db } from "../controller"; // Importe o db também
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Importe funções do Firestore

export default function Cadastro({ navigation }) {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [nome, setNome] = useState(""); // Campo adicional opcional

    const RegistroUsuario = async () => {
        try {
            // 1. Cria o usuário no Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            
            console.log("Usuário cadastrado!", user.email);

            // 2. Salva dados adicionais no Firestore
            await setDoc(doc(db, "usuarios", user.uid), {
                email: user.email,
                nome: nome || "Usuário", // Use o nome ou um valor padrão
                dataCadastro: new Date().toISOString(),
                uid: user.uid
            });

            console.log("Dados salvos no Firestore!");
            Alert.alert("Sucesso!", "Cadastro realizado com sucesso!");
            navigation.navigate('Login');

        } catch (error) {
            console.log('Erro:', error.message);
            
            // Mensagens de erro em português
            let mensagemErro = "Erro ao cadastrar usuário";
            if (error.code === 'auth/email-already-in-use') {
                mensagemErro = "Este email já está em uso";
            } else if (error.code === 'auth/invalid-email') {
                mensagemErro = "Email inválido";
            } else if (error.code === 'auth/weak-password') {
                mensagemErro = "A senha deve ter pelo menos 6 caracteres";
            }
            
            Alert.alert("Erro", mensagemErro);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Cadastro</Text>
            <Text style={styles.txt}>Se você ainda não possui uma conta, cadastre-se para acessar os nossos serviços.</Text>

            <TextInput 
                style={styles.txtInput}
                placeholder='Nome (opcional)'
                placeholderTextColor={'black'}
                value={nome}
                onChangeText={setNome}
            />

            <TextInput 
                style={styles.txtInput}
                placeholder='Email'
                placeholderTextColor={'black'}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
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
                <Text style={styles.Btn}>Cadastre-se</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#F1F8E9'
    },
    titulo: {
        textAlign: 'center',
        padding: 30,
        fontSize: 38,
        fontWeight: 'bold',
        color: '#000'
    },
    txt: {
        margin: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 30,
        color: '#000',
        fontSize: 15,
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
    Btn: {
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
        margin: 15
    }
});