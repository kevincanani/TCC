import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

export default function Home() {
    // Estado para controlar qual imagem mostrar
    const [imagemAtual, setImagemAtual] = useState('bicho');

    // Objeto com as imagens disponível
    // Função para trocar a imagem

    const imagens = {
        bicho: require('../assets/bicho.png'),
        bicho2: require('../assets/bicho2.png'),
        // exemplo: cachorro: require('../assets/cachorro.png'),
    };

    const trocarImagem = () => {
        // Se você tiver apenas 2 imagens:
        setImagemAtual(imagemAtual === 'bicho' ? 'bicho2' : 'bicho');
        
        // Para mais de 2 imagens, você poderia usar um array e índice
    };

    return(
        <View>
            <Image
            style={styles.img}
                source={imagens[imagemAtual]}
            />
            
            <TouchableOpacity onPress={trocarImagem}>
                <Text>Trocar Imagem</Text>
            </TouchableOpacity>
        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    img: {
        width: 100,
        height: 200,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});