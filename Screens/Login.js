import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from 'react';
import { auth } from "../controller";
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login({navigation}) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const VerificaUser = () => {
        signInWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                navigation.navigate('Welcome')
            })
            .catch((error) => {
                console.log('Erro ao logar! ',error.message);
            });
    }

    return(
        <View style={styles.containerLogin}>
            <Text style={styles.textTitle}>Login</Text>

            <Image style={styles.img} source={require('../assets/logo.png')}/>

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

                <TouchableOpacity
                onPress={VerificaUser}>
                    <Text style={styles.txtBtn}>Efetuar Login</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.txt}>Ainda não possui uma conta?</Text>
            <Text style={styles.txt}>Cadastre-se agora.</Text>

            <TouchableOpacity style={styles.btn}
            onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.txtBtn}>Cadastre-se</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    containerLogin:{
        flex: 1,
        backgroundColor: '#F1F8E9',
        color: '#FFFFFF'
    },
    txtInput:{
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
    textTitle:{
        padding: 25,
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    btn:{
        alignItems: 'center'
    },
    txtBtn:{
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
    txt:{
        fontWeight: 'bold',
        textAlign: 'justify',
        alignSelf: 'center',
        fontSize: 20
    },
    viewInput:{
        padding: 30
    },
    btn:{
        padding: 30
    },
    img:{
        width: 150,
        height: 150,
        alignSelf: 'center',
        borderRadius: 20
    },
})