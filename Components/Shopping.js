import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'produce', name: '🥕 Produce', color: '#4CAF50' },
  { id: 'dairy', name: '🥛 Dairy', color: '#2196F3' },
  { id: 'meat', name: '🥩 Meat', color: '#F44336' },
  { id: 'bakery', name: '🍞 Bakery', color: '#FF9800' },
  { id: 'pantry', name: '🥫 Pantry', color: '#9C27B0' },
  { id: 'frozen', name: '🧊 Frozen', color: '#00BCD4' },
  { id: 'household', name: '🧽 Household', color: '#795548' },
  { id: 'other', name: '📦 Other', color: '#607D8B' },
];

const ShoppingListScreen = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [quantity, setQuantity] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fabScaleAnim = useRef(new Animated.Value(1)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(headerScaleAnim, {
        toValue: 1,
        duration: 800,
        delay: 100,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const addItem = () => {
    if (!newItem.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const item = {
      id: Date.now().toString(),
      name: newItem.trim(),
      category: selectedCategory,
      quantity: parseInt(quantity) || 1,
      completed: false,
      createdAt: new Date(),
    };

    // Add item with animation
    const newItems = [item, ...items];
    setItems(newItems);
    
    // Reset form
    setNewItem('');
    setQuantity('1');
    setSelectedCategory('other');
    setShowAddModal(false);

    // Animate FAB
    Animated.sequence([
      Animated.timing(fabScaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setItems(items.filter(item => item.id !== id))
        },
      ]
    );
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCompleted = () => {
    Alert.alert(
      'Clear Completed',
      'Remove all completed items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => setItems(items.filter(item => !item.completed))
        },
      ]
    );
  };

  const getFilteredItems = () => {
    let filtered = items;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Sort: incomplete items first, then by category
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed - b.completed;
      }
      return a.category.localeCompare(b.category);
    });
  };

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const getStats = () => {
    const total = items.length;
    const completed = items.filter(item => item.completed).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  };

  const ItemComponent = ({ item, index }) => {
    const categoryInfo = getCategoryInfo(item.category);
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            opacity: itemAnim,
            transform: [{
              translateX: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.item,
            item.completed && styles.itemCompleted,
          ]}
          onPress={() => toggleItem(item.id)}
          onLongPress={() => deleteItem(item.id)}
        >
          <View style={styles.itemLeft}>
            <View style={[
              styles.checkbox,
              item.completed && styles.checkboxCompleted,
              { borderColor: categoryInfo.color }
            ]}>
              {item.completed && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={[
                styles.itemName,
                item.completed && styles.itemNameCompleted
              ]}>
                {item.name}
              </Text>
              <Text style={styles.itemCategory}>
                {categoryInfo.name}
              </Text>
            </View>
          </View>
          
          <View style={styles.itemRight}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color="#666" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const stats = getStats();
  const filteredItems = getFilteredItems();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: headerScaleAnim }
              ],
            },
          ]}
        >
          <Text style={styles.headerTitle}>Shopping List</Text>
          <Text style={styles.headerSubtitle}>
            {stats.remaining} of {stats.total} items remaining
          </Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.remaining}</Text>
              <Text style={styles.statLabel}>Left</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategories(true)}
        >
          <Ionicons name="filter" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <Animated.View
        style={[
          styles.listContainer,
          { opacity: fadeAnim }
        ]}
      >
        {filteredItems.length > 0 ? (
          <>
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <ItemComponent item={item} index={index} />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
            
            {stats.completed > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearCompleted}
              >
                <Text style={styles.clearButtonText}>
                  Clear {stats.completed} completed items
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || filterCategory !== 'all' 
                ? 'No items match your search' 
                : 'Your shopping list is empty'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterCategory !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Tap the + button to add your first item'
              }
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fab,
          { transform: [{ scale: fabScaleAnim }] }
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={['#ff6b6b', '#ff8e8e']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={addItem}>
              <Text style={styles.modalSave}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Item Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter item name"
                value={newItem}
                onChangeText={setNewItem}
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quantity</Text>
              <TextInput
                style={styles.formInput}
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesRow}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category.id && [
                          styles.categoryChipSelected,
                          { backgroundColor: category.color }
                        ]
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        selectedCategory === category.id && styles.categoryChipTextSelected
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Category Filter Modal */}
      <Modal
        visible={showCategories}
        animationType="fade"
        transparent
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>Filter by Category</Text>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterCategory === 'all' && styles.filterOptionSelected
              ]}
              onPress={() => {
                setFilterCategory('all');
                setShowCategories(false);
              }}
            >
              <Text style={[
                styles.filterOptionText,
                filterCategory === 'all' && styles.filterOptionTextSelected
              ]}>
                🛒 All Items
              </Text>
            </TouchableOpacity>
            
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterOption,
                  filterCategory === category.id && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setFilterCategory(category.id);
                  setShowCategories(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterCategory === category.id && styles.filterOptionTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.filterCloseButton}
              onPress={() => setShowCategories(false)}
            >
              <Text style={styles.filterCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff90',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff80',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  itemContainer: {
    marginBottom: 12,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemCompleted: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
  },
  itemRight: {
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'center',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabButton: {
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSave: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#667eea',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: width * 0.8,
    maxHeight: height * 0.6,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#667eea',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  filterCloseButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  filterCloseText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ShoppingListScreen;