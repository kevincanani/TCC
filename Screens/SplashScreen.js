import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from 'react';

export default function SplashScreen({navigation}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const loadingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 2,
                useNativeDriver: true,
            })
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(loadingAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(loadingAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                })
            ])
        ).start();

        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const loadingOpacity = loadingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1]
    });

    return(
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
                
                <Text style={styles.appName}>Platlist</Text>
                
                <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                </Animated.View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#66BB6A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 180,
        height: 180,
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
    appName: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        marginBottom: 40,
    },
    loadingContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    loadingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
    },
});