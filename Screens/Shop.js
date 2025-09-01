import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Shop() {
  const [userPoints, setUserPoints] = useState(145); // Pontos do usuário
  const [purchasedItems, setPurchasedItems] = useState([1, 3]); // IDs dos itens comprados

  const [shopItems, setShopItems] = useState([
    {
      id: 1,
      name: 'Chapéu Pirata',
      category: 'Acessórios',
      price: 25,
      icon: '🏴‍☠️',
      color: '#8B5CF6',
      description: 'Um chapéu estiloso para aventuras'
    },
    {
      id: 2,
      name: 'Óculos de Sol',
      category: 'Acessórios',
      price: 15,
      icon: '🕶️',
      color: '#06B6D4',
      description: 'Para ficar com estilo'
    },
    {
      id: 3,
      name: 'Gravata Borboleta',
      category: 'Acessórios',
      price: 20,
      icon: '🎀',
      color: '#F97316',
      description: 'Elegância em forma de gravata'
    },
    {
      id: 4,
      name: 'Coroa Dourada',
      category: 'Acessórios',
      price: 50,
      icon: '👑',
      color: '#F59E0B',
      description: 'Para se sentir realeza'
    },
    {
      id: 5,
      name: 'Comida Premium',
      category: 'Alimentação',
      price: 10,
      icon: '🍖',
      color: '#10B981',
      description: 'Aumenta a felicidade +20'
    },
    {
      id: 6,
      name: 'Vitaminas',
      category: 'Saúde',
      price: 30,
      icon: '💊',
      color: '#EC4899',
      description: 'Aumenta a energia +15'
    },
    {
      id: 7,
      name: 'Bola de Brincar',
      category: 'Brinquedos',
      price: 12,
      icon: '⚽',
      color: '#EF4444',
      description: 'Diversão garantida'
    },
    {
      id: 8,
      name: 'Casa Luxuosa',
      category: 'Moradia',
      price: 100,
      icon: '🏰',
      color: '#7C3AED',
      description: 'Uma casa dos sonhos'
    }
  ]);

  const categories = ['Todos', 'Acessórios', 'Alimentação', 'Saúde', 'Brinquedos', 'Moradia'];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredItems = selectedCategory === 'Todos' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const purchaseItem = (item) => {
    if (userPoints >= item.price && !purchasedItems.includes(item.id)) {
      setUserPoints(prev => prev - item.price);
      setPurchasedItems(prev => [...prev, item.id]);
    }
  };

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.activeCategoryTab
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === category && styles.activeCategoryText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderShopItem = (item) => {
    const isPurchased = purchasedItems.includes(item.id);
    const canAfford = userPoints >= item.price;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.shopItem,
          isPurchased && styles.purchasedItem
        ]}
        onPress={() => purchaseItem(item)}
        activeOpacity={0.8}
        disabled={isPurchased || !canAfford}
      >
        <View style={styles.itemContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>

          <View style={styles.itemRight}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{item.price}</Text>
              <Text style={styles.pointsIcon}>⚡</Text>
            </View>
            
            <View style={[
              styles.purchaseButton,
              isPurchased ? styles.ownedButton : 
              canAfford ? styles.buyButton : styles.cantAffordButton
            ]}>
              {isPurchased ? (
                <Text style={styles.ownedText}>✓</Text>
              ) : canAfford ? (
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
          <View style={styles.headerIcon}>
            <Text style={styles.shopIcon}>🛍️</Text>
          </View>
          <Text style={styles.headerTitle}>Loja</Text>
          <View style={styles.pointsDisplay}>
            <Text style={styles.pointsText}>{userPoints}</Text>
            <Text style={styles.pointsIcon}>⚡</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        horizontal 
        style={styles.categoriesContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(renderCategoryTab)}
      </ScrollView>

      <ScrollView 
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
      >
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'Todos' ? 'Todos os itens' : selectedCategory}
        </Text>
        
        {filteredItems.map(renderShopItem)}
        
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
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  pointsIcon: {
    fontSize: 16,
  },
  categoriesContainer: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeCategoryTab: {
    backgroundColor: 'white',
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
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
  itemCategory: {
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