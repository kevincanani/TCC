import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Shop() {
  const [pontosUsuario, setpontosUsuario] = useState(145);
  const [itensComprados, setitensComprados] = useState([1, 3]);

  const [shopItems, setShopItems] = useState([
    {
      id: 1,
      name: 'Chapéu Pirata',
      categoria: 'Acessórios',
      price: 25,
      icon: '🏴‍☠️',
      color: '#8B5CF6',
    },
    {
      id: 2,
      name: 'Óculos de Sol',
      categoria: 'Acessórios',
      price: 15,
      icon: '🕶️',
      color: '#06B6D4',
    },
    {
      id: 3,
      name: 'Gravata Borboleta',
      categoria: 'Acessórios',
      price: 20,
      icon: '🎀',
      color: '#F97316',
    },
  ]);

  const categorias = ['Todos', 'Acessórios'];
  const [categoriaSelect, setcategoriaSelect] = useState('Todos');

  const itensFiltrados = categoriaSelect === 'Todos' 
    ? shopItems 
    : shopItems.filter(item => item.categoria === categoriaSelect);

  const purchaseItem = (item) => {
    if (pontosUsuario >= item.price && !itensComprados.includes(item.id)) {
      setpontosUsuario(prev => prev - item.price);
      setitensComprados(prev => [...prev, item.id]);
    }
  };

  const rendercategoriaTab = (categoria) => (
    <TouchableOpacity
      key={categoria}
      style={[
        styles.categoriaTab,
        categoriaSelect === categoria && styles.activecategoriaTab
      ]}
      onPress={() => setcategoriaSelect(categoria)}
    >
      <Text style={[
        styles.categoriaText,
        categoriaSelect === categoria && styles.activecategoriaText
      ]}>
        {categoria}
      </Text>
    </TouchableOpacity>
  );

  const renderShopItem = (item) => {
    const foiComprado = itensComprados.includes(item.id);
    const podeComprar = pontosUsuario >= item.price;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.shopItem,
          foiComprado && styles.purchasedItem
        ]}
        onPress={() => purchaseItem(item)}
        activeOpacity={0.8}
        disabled={foiComprado || !podeComprar}
      >
        <View style={styles.itemContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemcategoria}>{item.categoria}</Text>
          </View>

          <View style={styles.itemRight}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{item.price}</Text>
              <Text style={styles.pontosIcone}>⚡</Text>
            </View>
            
            <View style={[
              styles.purchaseButton,
              foiComprado ? styles.ownedButton : 
              podeComprar ? styles.buyButton : styles.cantAffordButton
            ]}>
              {foiComprado ? (
                <Text style={styles.ownedText}>✓</Text>
              ) : podeComprar ? (
                <Text style={styles.buyText}>Comprar</Text>
              ) : (
                <Text style={styles.cantAffordText}>💰</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#9C27B0" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Loja</Text>
          <View style={styles.pontosDisplay}>
            <Text style={styles.pontosTexto}>{pontosUsuario}</Text>
            <Text style={styles.pontosIcone}>⚡</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        horizontal 
        style={styles.categoriasContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriasContent}
      >
        {categorias.map(rendercategoriaTab)}
      </ScrollView>

      <ScrollView 
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
      >
        <Text style={styles.sectionTitle}>
          {categoriaSelect === 'Todos' ? 'Todos os itens' : categoriaSelect}
        </Text>
        
        {itensFiltrados.map(renderShopItem)}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9C27B0',
  },
  header: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 15,
  },
  pontosDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pontosTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  pontosIcone: {
    fontSize: 16,
  },
  categoriasContainer: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
  },
  categoriasContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoriaTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activecategoriaTab: {
    backgroundColor: 'white',
  },
  categoriaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  activecategoriaText: {
    color: '#9C27B0',
  },
  itemsList: {
    flex: 1,
    backgroundColor: '#9C27B0',
  },
  itemsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  shopItem: {
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
  purchasedItem: {
    opacity: 0.7,
    backgroundColor: '#F0F9FF',
  },
  itemContent: {
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
  itemIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemcategoria: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  itemRight: {
    alignItems: 'center',
    gap: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginRight: 2,
  },
  purchaseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  ownedButton: {
    backgroundColor: '#3B82F6',
  },
  cantAffordButton: {
    backgroundColor: '#E5E7EB',
  },
  buyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ownedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cantAffordText: {
    fontSize: 12,
  },
  bottomSpace: {
    height: 100,
  },
});