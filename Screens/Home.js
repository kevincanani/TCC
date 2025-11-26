import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, SafeAreaView, StatusBar, Modal, TextInput, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../controller';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, arrayUnion } from 'firebase/firestore';

import { AlertCustom, AlertProvider } from '../AlertCustom';

export default function Home() {
    const [imagemAtual, setImagemAtual] = useState('azul');
    const [corMascote, setCorMascote] = useState('azul');
    const [acessorioAtual, setAcessorioAtual] = useState([]);
    const [nomePinguim, setNomePinguim] = useState('Pinguim');
    const [conquistas, setConquistas] = useState([]);
    const [conquistasUsuario, setConquistasUsuario] = useState([]);

    const imagens = {
        azul: require('../assets/azul.png'),

        azul_chapeu: require('../assets/azul_chapeu.png'),
        azul_oculos: require('../assets/azul_oculos.png'),
        azul_cachecol: require('../assets/azul_cachecol.png'),

        azul_chapeu_oculos: require('../assets/azul_chapeu_oculos.png'),
        azul_cachecol_chapeu: require('../assets/azul_cachecol_chapeu.png'),
        azul_cachecol_oculos: require('../assets/azul_cachecol_oculos.png'),

        azul_cachecol_chapeu_oculos: require('../assets/azul_cachecol_chapeu_oculos.png'),
        

        verde: require('../assets/verde.png'),

        verde_chapeu: require('../assets/verde_chapeu.png'),
        verde_oculos: require('../assets/verde_oculos.png'),
        verde_cachecol: require('../assets/verde_cachecol.png'),

        verde_chapeu_oculos: require('../assets/verde_chapeu_oculos.png'),
        verde_cachecol_chapeu: require('../assets/verde_cachecol_chapeu.png'),
        verde_cachecol_oculos: require('../assets/verde_cachecol_oculos.png'),

        verde_cachecol_chapeu_oculos: require('../assets/verde_cachecol_chapeu_oculos.png'),
        

        vermelho: require('../assets/vermelho.png'),

        vermelho_chapeu: require('../assets/vermelho_chapeu.png'),
        vermelho_oculos: require('../assets/vermelho_oculos.png'),
        vermelho_cachecol: require('../assets/vermelho_cachecol.png'),

        vermelho_chapeu_oculos: require('../assets/vermelho_chapeu_oculos.png'),
        vermelho_cachecol_chapeu: require('../assets/vermelho_cachecol_chapeu.png'),
        vermelho_cachecol_oculos: require('../assets/vermelho_cachecol_oculos.png'),

        vermelho_cachecol_chapeu_oculos: require('../assets/vermelho_cachecol_chapeu_oculos.png'),
    };

    const construirNomeImagem = (cor, acessorios) => {
    const corLimpa = cor?.trim() || 'azul';
    
    if (!acessorios) {
        return corLimpa;
    }
    
    if (typeof acessorios === 'string' && acessorios.trim() === '') {
        return corLimpa;
    }
    
    let acessoriosArray = [];
    if (typeof acessorios === 'string') {
        acessoriosArray = acessorios.split(',').map(a => a.trim()).filter(a => a !== '');
    } else if (Array.isArray(acessorios)) {
        acessoriosArray = acessorios.filter(a => a && a.trim && a.trim() !== '');
    }
    
    if (acessoriosArray.length === 0) {
        return corLimpa;
    }
    
    const acessoriosOrdenados = [...acessoriosArray].sort();
    
    const nomeImagem = `${corLimpa}_${acessoriosOrdenados.join('_')}`;
    
    console.log('🎨 construirNomeImagem:', {
        cor: cor,
        acessoriosRecebidos: acessorios,
        tipoAcessorios: typeof acessorios,
        acessoriosArray: acessoriosArray,
        resultado: nomeImagem,
        imagemExiste: !!imagens[nomeImagem]
    });
    
    return nomeImagem;
};

    const carregarDadosMascote = async () => {
    try {
        const userId = auth.currentUser?.uid;
        if (userId) {
            const userDocRef = doc(db, "users", userId);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                if (data.corMascote) {
                    const corSalva = data.corMascote.trim();
                    console.log('Home - Cor carregada do Firestore:', corSalva);
                    setCorMascote(corSalva);
                }
                
                if (data.acessoriosMascote !== undefined) {
                    const acessoriosSalvos = Array.isArray(data.acessoriosMascote) 
                        ? data.acessoriosMascote 
                        : [];
                    console.log('Home - Acessórios carregados do Firestore:', acessoriosSalvos);
                    setAcessorioAtual(acessoriosSalvos);
                } else {
                    setAcessorioAtual([]);
                }
                
                const nomeImagem = construirNomeImagem(
                    data.corMascote || 'azul',
                    data.acessoriosMascote || []
                );
                console.log('Home - Atualizando para imagem:', nomeImagem);
                setImagemAtual(nomeImagem);
                
                return;
            }
        }

const corSalva = await AsyncStorage.getItem('corMascote');
const acessorioSalvo = await AsyncStorage.getItem('acessorioMascote');

if (corSalva) {
    setCorMascote(corSalva);
}

let acessoriosArray = [];
if (acessorioSalvo) {
    try {
        acessoriosArray = JSON.parse(acessorioSalvo);
    } catch {
        if (acessorioSalvo.trim() !== '') {
            acessoriosArray = [acessorioSalvo];
        }
    }
}
setAcessorioAtual(acessoriosArray);

const nomeImagem = construirNomeImagem(
    corSalva || 'azul',
    acessoriosArray
);
setImagemAtual(nomeImagem);
    } catch (error) {
        console.log('Home - Erro ao carregar dados do mascote:', error);
    }
};

    const carregarNomeMascote = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (userId) {
                const userDocRef = doc(db, "users", userId);
                const docSnap = await getDoc(userDocRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.nomePinguim) {
                        setNomePinguim(data.nomePinguim);
                        return;
                    }
                }
            }
            
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const dados = JSON.parse(userData);
                if (dados.nomePinguim) {
                    setNomePinguim(dados.nomePinguim);
                }
            }
        } catch (error) {
            console.log('Erro ao carregar nome do mascote:', error);
        }
    };

    useEffect(() => {
//   const limparDadosAntigos = async () => {
//     try {
//       await AsyncStorage.removeItem('acessorioMascote');
//       await AsyncStorage.removeItem('pontosGastos');
//       await AsyncStorage.removeItem('itensComprados');
//       console.log('✅ Dados antigos limpos!');
//     } catch (error) {
//       console.log('Erro ao limpar:', error);
//     }
//   };

//   limparDadosAntigos();
  carregarDadosMascote();
  carregarNomeMascote();
}, []);

    useEffect(() => {
        const carregarEDebug = async () => {
        await carregarConquistas();
        console.log('🎮 Conquistas carregadas:', conquistas.length);
        
        const userId = auth.currentUser?.uid;
        if (userId) {
            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('📊 Debug Home - Dados do usuário:');
                console.log('   - Tarefas completadas total:', data.tarefasCompletadasTotal);
                console.log('   - Conquistas desbloqueadas:', data.conquistasDesbloqueadas);
                console.log('   - Pontos acumulados:', data.pontosTotaisAcumulados);
            }
        }
    };

        carregarDadosMascote();
        carregarNomeMascote();
        carregarConquistas();
        carregarEDebug();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            console.log('Home - Tela recebeu foco, recarregando dados...');
            carregarDadosMascote();
            carregarNomeMascote();
        }, [])
    );

    const [objetivos, setObjetivos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [novoObjetivoNome, setNovoObjetivoNome] = useState('');
    const [novoObjetivoIcone, setNovoObjetivoIcone] = useState('');

    useEffect(() => {
        const userId = auth.currentUser?.uid;
    
    if (!userId) {
        AlertCustom.alert("Erro", "Usuário não autenticado!");
        return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            if (data.nomePinguim) {
                setNomePinguim(data.nomePinguim);
            }
                
                if (data.corMascote) {
                    const corLimpa = data.corMascote.trim();
                    console.log('Home - Firestore: Nova cor recebida:', corLimpa);
                    setCorMascote(corLimpa);
                }
                
                if (data.acessoriosMascote !== undefined) {
                    const acessoriosLimpos = Array.isArray(data.acessoriosMascote) 
                        ? data.acessoriosMascote 
                        : [];
                    console.log('Home - Firestore: Novos acessórios recebidos:', acessoriosLimpos);
                    setAcessorioAtual(acessoriosLimpos);
                } else {
                    setAcessorioAtual([]);
                }

                const corFinal = data.corMascote ? data.corMascote.trim() : corMascote;
                const acessoriosFinal = data.acessoriosMascote !== undefined 
                    ? (Array.isArray(data.acessoriosMascote) ? data.acessoriosMascote : [])
                    : [];
                const novaImagem = construirNomeImagem(corFinal, acessoriosFinal);
                console.log('Home - Atualizando imagem para:', novaImagem);
                setImagemAtual(novaImagem);
                
                if (data.objetivos && Array.isArray(data.objetivos)) {
                    setObjetivos(data.objetivos);
                } else {
                    const objetivosPadrao = [
                        {
                            id: 1,
                            title: 'Usar fio-dental',
                            pontos: 5,
                            finalizado: false,
                            icon: '🦷',
                            color: '#8B5CF6'
                        },
                        {
                            id: 2,
                            title: 'Escovar os dentes',
                            pontos: 5,
                            finalizado: false,
                            icon: '🪥',
                            color: '#06B6D4'
                        },
                        {
                            id: 3,
                            title: 'Escrever no diário',
                            pontos: 5,
                            finalizado: false,
                            icon: '📖',
                            color: '#F97316'
                        },
                        {
                            id: 4,
                            title: 'Lavar o rosto',
                            pontos: 5,
                            finalizado: false,
                            icon: '🧼',
                            color: '#EC4899'
                        }
                    ];
                    setObjetivos(objetivosPadrao);
                    salvarObjetivosFirestore(objetivosPadrao);
                }
            }
        }, (error) => {
            console.log('Home - Erro ao carregar dados:', error);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
    const migrarAcessoriosParaArray = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const userDocRef = doc(db, "users", userId);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                if (data.acessorioMascote !== undefined && !data.acessoriosMascote) {
                    console.log('🔄 Migrando acessórios de string para array...');
                    
                    let acessoriosArray = [];
                    if (data.acessorioMascote && data.acessorioMascote.trim() !== '') {
                        acessoriosArray = data.acessorioMascote
                            .split(',')
                            .map(a => a.trim())
                            .filter(a => a !== '');
                    }
                    
                    await updateDoc(userDocRef, {
                        acessoriosMascote: acessoriosArray,
                        acessorioMascote: null
                    });
                    
                    console.log('✅ Migração concluída! Acessórios:', acessoriosArray);
                }
            }
        } catch (error) {
            console.log('Erro na migração:', error);
        }
    };

    migrarAcessoriosParaArray();
}, []);

    const salvarObjetivosFirestore = async (novosObjetivos) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                console.log('Home - Erro: userId não disponível');
                return;
            }

            const pontosPendentes = novosObjetivos
                .filter(obj => obj.finalizado)
                .reduce((total, obj) => total + obj.pontos, 0);

            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            
            const dadosParaSalvar = {
                objetivos: novosObjetivos,
                pontosTotais: pontosPendentes,
                ultimaAtualizacao: new Date().toISOString()
            };

            if (docSnap.exists()) {
                await updateDoc(docRef, dadosParaSalvar);
            } else {
                await setDoc(docRef, dadosParaSalvar, { merge: true });
            }
            
        } catch (error) {
            console.log('Home - Erro ao salvar objetivos:', error);
        }
    };

    const finalizadoObjetivos = objetivos.filter(objetivo => objetivo.finalizado).length;
    const totalObjetivos = objetivos.length;
    const remainingObjetivos = totalObjetivos - finalizadoObjetivos;
    
    const [pontosDisponiveis, setPontosDisponiveis] = useState(0);

    useEffect(() => {
        calcularPontosDisponiveis();
        const interval = setInterval(calcularPontosDisponiveis, 1000);
        return () => clearInterval(interval);
    }, [objetivos]);

    const calcularPontosDisponiveis = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            
            let pontosGanhos = 0;
            let pontosGastos = 0;
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                pontosGanhos = (data.pontosTotaisAcumulados || 0) + 
                            objetivos.filter(obj => obj.finalizado).reduce((total, obj) => total + obj.pontos, 0);
                pontosGastos = data.pontosGastos || 0;
            }
            
            const disponiveis = pontosGanhos - pontosGastos;
            setPontosDisponiveis(disponiveis);
            
        } catch (error) {
            console.log('Home - Erro ao calcular pontos:', error);
        }
    };

    const toggleObjetivo = (objetivoId) => {
    const objetivo = objetivos.find(obj => obj.id === objetivoId);
    
    if (!objetivo.finalizado) {
        completarObjetivo(objetivoId);
    }
};

    const deleteObjetivo = (objetivoId) => {
        const novosObjetivos = objetivos.filter(objetivo => objetivo.id !== objetivoId);
        setObjetivos(novosObjetivos);
        salvarObjetivosFirestore(novosObjetivos);
    };

    const adicionarObjetivo = () => {
        if (objetivos.length >= 10) {
            AlertCustom.alert(
                "Limite atingido", 
                "Você atingiu o número máximo de 10 tarefas. Delete uma tarefa existente para adicionar uma nova.",
                [{ text: "OK" }]
            );
            return;
        }

        if (novoObjetivoNome.trim() === '') {
            AlertCustom.alert("Atenção", "Digite um nome para o objetivo!");
            return;
        }

        const coresObjetivos = ['#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#10B981', '#F59E0B'];
        const corAleatoria = coresObjetivos[Math.floor(Math.random() * coresObjetivos.length)];

        const novoObjetivo = {
            id: Date.now(),
            title: novoObjetivoNome,
            pontos: 5,
            finalizado: false,
            icon: novoObjetivoIcone || '⭐',
            color: corAleatoria
        };

        const novosObjetivos = [...objetivos, novoObjetivo];
        setObjetivos(novosObjetivos);
        salvarObjetivosFirestore(novosObjetivos);
        fecharModal();
    };

    const completarObjetivo = async (objetivoId) => {
        const objetivo = objetivos.find(obj => obj.id === objetivoId);
        
        if (!objetivo || objetivo.finalizado) return;
        
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            
            let pontosTotaisAcumulados = 0;
            let tarefasCompletadasTotal = 0;
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                pontosTotaisAcumulados = data.pontosTotaisAcumulados || 0;
                tarefasCompletadasTotal = (data.tarefasCompletadasTotal || 0) + 1;
            } else {
                tarefasCompletadasTotal = 1;
            }
            
            const novoTotal = pontosTotaisAcumulados + objetivo.pontos;
            const objetivosFiltrados = objetivos.filter(obj => obj.id !== objetivoId);
            
            await updateDoc(docRef, {
                objetivos: objetivosFiltrados,
                pontosTotaisAcumulados: novoTotal,
                tarefasCompletadasTotal: tarefasCompletadasTotal,
                ultimaAtualizacao: new Date().toISOString()
            });
            
            setObjetivos(objetivosFiltrados);
            
            console.log('🎯 Tarefa completa! Total agora:', tarefasCompletadasTotal);
            
            setTimeout(async () => {
                await verificarConquistas(tarefasCompletadasTotal, novoTotal);
            }, 500);
            
            AlertCustom.alert(
                "🎉 Tarefa Completa!", 
                `Parabéns! Você ganhou ${objetivo.pontos} pontos por completar "${objetivo.title}"!`,
                [{ text: "OK" }]
            );
            
        } catch (error) {
            console.log('Erro ao completar objetivo:', error);
            AlertCustom.alert("Erro", "Não foi possível completar a tarefa.");
        }
    };

    const fecharModal = () => {
        setModalVisible(false);
        setNovoObjetivoNome('');
        setNovoObjetivoIcone('');
    };

    const renderObjetivoItem = (objetivo) => (
        <TouchableOpacity
            key={objetivo.id}
            style={styles.objetivoItem}
            onPress={() => toggleObjetivo(objetivo.id)}
            activeOpacity={0.8}
        >
            <View style={styles.objetivoContent}>
                <View style={[styles.iconContainer, { backgroundColor: objetivo.color + '20' }]}>
                    <Text style={styles.objetivoIcon}>{objetivo.icon}</Text>
                </View>
                
                <View style={styles.objetivoInfo}>
                    <View style={styles.titleRow}>
                        {objetivo.progresso && (
                            <Text style={styles.progressoText}>{objetivo.progresso} </Text>
                        )}
                        <Text style={styles.objetivoTitle}>{objetivo.title}</Text>
                    </View>
                </View>

                <View style={styles.objetivoRight}>
                    <View style={styles.actionButtons}>
                        <View style={styles.pontosContainer}>
                            <Text style={styles.pontosText}>{objetivo.pontos}</Text>
                            <Text style={styles.pontosIconSmall}>⚡</Text>
                        </View>

                        <View style={[
                            styles.statusButton,
                            objetivo.finalizado ? styles.finalizadoButton : styles.pendingButton
                        ]}>
                            {objetivo.finalizado ? (
                                <Text style={styles.checkmark}>✓</Text>
                            ) : (
                                <Text style={styles.plusIcon}>+</Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                deleteObjetivo(objetivo.id);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const carregarConquistas = async () => {
        try {
            const conquistasCollection = collection(db, "achievements");
            const conquistasSnapshot = await getDocs(conquistasCollection);
            
            const conquistasArray = conquistasSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setConquistas(conquistasArray);
        } catch (error) {
            console.log('Erro ao carregar conquistas:', error);
        }
    };

    const verificarConquistas = async (tarefasCompletadas, pontosTotal) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            console.log('🔍 Verificando conquistas...', { tarefasCompletadas, pontosTotal });

            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                console.log('❌ Documento não existe');
                return;
            }
            
            const data = docSnap.data();
            const conquistasDesbloqueadas = data.conquistasDesbloqueadas || [];
            
            console.log('📋 Conquistas já desbloqueadas:', conquistasDesbloqueadas);
            console.log('📋 Total de conquistas disponíveis:', conquistas.length);
            
            const novasConquistas = [];
            
            for (const conquista of conquistas) {
                // Se já foi desbloqueada, pula
                if (conquistasDesbloqueadas.includes(conquista.id)) {
                    console.log(`⏭️ Conquista ${conquista.id} já desbloqueada`);
                    continue;
                }
                
                let desbloqueada = false;
                
                // Verifica o tipo de conquista
                switch (conquista.tipo) {
                    case 'tarefas_completadas':
                        desbloqueada = tarefasCompletadas >= conquista.meta;
                        console.log(`🎯 ${conquista.nome}: ${tarefasCompletadas}/${conquista.meta} - ${desbloqueada ? '✅' : '❌'}`);
                        break;
                        
                    case 'pontos_acumulados':
                        desbloqueada = pontosTotal >= conquista.meta;
                        console.log(`💎 ${conquista.nome}: ${pontosTotal}/${conquista.meta} - ${desbloqueada ? '✅' : '❌'}`);
                        break;
                        
                    case 'sequencia_dias':
                        const sequencia = data.sequenciaDias || 0;
                        desbloqueada = sequencia >= conquista.meta;
                        console.log(`🔥 ${conquista.nome}: ${sequencia}/${conquista.meta} - ${desbloqueada ? '✅' : '❌'}`);
                        break;
                        
                    default:
                        break;
                }
                
                if (desbloqueada) {
                    novasConquistas.push(conquista);
                    console.log(`🎉 Nova conquista desbloqueada: ${conquista.nome}`);
                }
            }
            
            console.log('✨ Total de novas conquistas:', novasConquistas.length);
            
            // Se houver novas conquistas, salvar e notificar
            if (novasConquistas.length > 0) {
                const idsNovasConquistas = novasConquistas.map(c => c.id);
                
                // Atualizar conquistas desbloqueadas
                const conquistasAtualizadas = [...conquistasDesbloqueadas, ...idsNovasConquistas];
                
                await updateDoc(docRef, {
                    conquistasDesbloqueadas: conquistasAtualizadas
                });
                
                console.log('💾 Conquistas salvas no Firestore:', conquistasAtualizadas);
                
                // Calcular bônus total
                const bonusTotal = novasConquistas.reduce((sum, c) => sum + (c.recompensaPontos || 0), 0);
                
                // Adicionar pontos de bônus
                if (bonusTotal > 0) {
                    await updateDoc(docRef, {
                        pontosTotaisAcumulados: pontosTotal + bonusTotal
                    });
                    console.log(`💰 Bônus adicionado: ${bonusTotal} pontos`);
                }
                
                // Notificar usuário para cada conquista
                for (let i = 0; i < novasConquistas.length; i++) {
                    const conquista = novasConquistas[i];
                    setTimeout(() => {
                        AlertCustom.alert(
                            `🏆 Conquista Desbloqueada!`,
                            `${conquista.icone} ${conquista.nome}\n\n${conquista.descricao}\n\n+${conquista.recompensaPontos || 0} pontos de bônus!`,
                            [{ text: "Incrível!" }]
                        );
                    }, 1000 + (i * 1500)); // Delay entre notificações
                }
            } else {
                console.log('ℹ️ Nenhuma conquista nova para desbloquear');
            }
            
        } catch (error) {
            console.log('❌ Erro ao verificar conquistas:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
            
            <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>
                    {remainingObjetivos === 0 
                        ? 'Nenhum objetivo a ser finalizado hoje!' 
                        : remainingObjetivos === 1 
                            ? '1 objetivo a ser finalizado hoje!' 
                            : `${remainingObjetivos} objetivos a serem finalizados hoje!`
                    }
                </Text>
                <View style={styles.pontosHeader}>
                    <Text style={styles.pontosHeaderText}>{pontosDisponiveis}</Text>
                    <Text style={styles.pontosHeaderIcon}>⚡</Text>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.mascoteCard}>
                    <View style={styles.imageContainer}>
                        {imagens[imagemAtual] ? (
                            <Image
                                style={styles.img}
                                source={imagens[imagemAtual]}
                            />
                        ) : (
                            <Text style={styles.errorText}>
                                Erro ao carregar imagem: {imagemAtual}
                            </Text>
                        )}
                    </View>
                    
                    <Text style={styles.imageLabel}>
                        {nomePinguim}
                    </Text>
                    
                    <Text style={styles.dica}>
                        💡 Compre acessórios na loja e altere a cor no perfil!
                    </Text>
                </View>

                <View style={styles.objetivosSection}>
                    <Text style={styles.sectionTitle}>Seus Objetivos</Text>
                    
                    {objetivos.map(renderObjetivoItem)}
                    
                    <TouchableOpacity 
                        style={styles.addObjetivoButton} 
                        activeOpacity={0.8}
                        onPress={() => setModalVisible(true)}
                    >
                        <View style={styles.addObjetivoContent}>
                            <Text style={styles.addObjetivoIcon}>+</Text>
                            <Text style={styles.addObjetivoText}>Adicionar objetivo</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={fecharModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Novo Objetivo</Text>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nome da tarefa</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Fazer exercícios"
                                placeholderTextColor="#9CA3AF"
                                value={novoObjetivoNome}
                                onChangeText={setNovoObjetivoNome}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Ícone (emoji)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 💪"
                                placeholderTextColor="#9CA3AF"
                                value={novoObjetivoIcone}
                                onChangeText={setNovoObjetivoIcone}
                                maxLength={2}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={fecharModal}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Descartar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={adicionarObjetivo}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d1f7d4ff',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    pontosHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
        borderWidth: 2,
        borderColor: '#81C784',
    },
    pontosHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    pontosHeaderIcon: {
        fontSize: 18,
    },
    headerTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 12,
        marginLeft: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    mascoteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 25,
        shadowColor: '#2D5A2D',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    imageContainer: {
        backgroundColor: '#F1F8E9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#A5D6A7',
    },
    img: {
        width: 100,
        height: 160,
        borderRadius: 10,
    },
    imageLabel: {
        fontSize: 15,
        color: '#388E3C',
        fontWeight: '600',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '600',
        textAlign: 'center',
    },
    dica: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 5,
    },
    objetivosSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B5E20',
        marginBottom: 15,
    },
    objetivoItem: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    objetivoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    objetivoIcon: {
        fontSize: 24,
    },
    objetivoInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10B981',
        marginRight: 4,
    },
    objetivoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    objetivoRight: {
        alignItems: 'flex-end',
    },
    pontosContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginBottom: 8,
    },
    pontosText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    pontosIconSmall: {
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    statusButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    finalizadoButton: {
        backgroundColor: '#10B981',
    },
    pendingButton: {
        backgroundColor: '#E5E7EB',
    },
    checkmark: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    plusIcon: {
        color: '#10B981',
        fontSize: 20,
        fontWeight: 'bold',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteIcon: {
        fontSize: 16,
    },
    addObjetivoButton: {
        backgroundColor: '#66BB6A',
        borderRadius: 16,
        marginTop: 20,
        shadowColor: '#2E7D32',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    addObjetivoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    addObjetivoIcon: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 12,
    },
    addObjetivoText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});