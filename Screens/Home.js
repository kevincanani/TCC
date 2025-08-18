import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

export default function Home() {
    // Estado para controlar qual imagem mostrar
    const [imagemAtual, setImagemAtual] = useState('bicho');

    // Objeto com as imagens disponíve
    // Função para trocar a imagem
    const trocarImagem = () => {is
    const imagens = {
        bicho: require('../assets/bicho.png'),
        bicho2: require('../assets/bicho2.png'),
    };

        // Se você tiver apenas 2 imagens:
        setImagemAtual(imagemAtual === 'bicho' ? 'bicho2' : 'bicho');
    };

    return(
        <View style={styles.container}>
            {/* Card principal com sombra */}
            <View style={styles.card}>
                <Text style={styles.title}>🌿 AAAAAAAAAAA</Text>
                
                {/* Container da imagem com bordas elegantes */}
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.img}
                        source={imagens[imagemAtual]}
                    />
                </View>
                
                {/* Indicador de qual imagem está sendo mostrada */}
                <Text style={styles.imageLabel}>
                    {imagemAtual === 'bicho' ? '🐾 Bicho 1' : '🐾 Bicho 2'}
                </Text>
                
                {/* Botão estilizado */}
                <TouchableOpacity style={styles.button} onPress={trocarImagem}>
                    <Text style={styles.buttonText}>✨ Trocar Bicho</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E8F5E8', // Verde muito claro de fundo
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#2D5A2D',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8, // Para Android
        borderWidth: 1,
        borderColor: '#C8E6C9', // Verde suave na borda
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32', // Verde escuro
        marginBottom: 20,
        textAlign: 'center',
    },
    imageContainer: {
        backgroundColor: '#F1F8E9', // Verde muito claro
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#A5D6A7', // Verde médio
    },
    img: {
        width: 120,
        height: 200,
        borderRadius: 10,
    },
    imageLabel: {
        fontSize: 16,
        color: '#388E3C', // Verde médio-escuro
        fontWeight: '600',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50', // Verde principal
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        shadowColor: '#2E7D32',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#66BB6A', // Verde mais claro na borda
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});