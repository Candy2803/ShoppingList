import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, Keyboard } from 'react-native';
import { Trash2, Plus, ShoppingCart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShoppingItem {
  id: string;
  name: string;
  isChecked: boolean;
}

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('shoppingItems');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const saveItems = async (newItems: ShoppingItem[]) => {
    try {
      await AsyncStorage.setItem('shoppingItems', JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;

    const newItems = [
      {
        id: Date.now().toString(),
        name: newItem.trim(),
        isChecked: false
      },
      ...items
    ];
    
    saveItems(newItems);
    setNewItem('');
    Keyboard.dismiss();
  };

  const toggleItem = (id: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    saveItems(newItems);
  };

  const deleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    saveItems(newItems);
  };

  const clearList = () => {
    saveItems([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShoppingCart size={28} color="#1a1a1a" />
        <Text style={styles.title}>Shopping List</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item"
          placeholderTextColor="#999"
          returnKeyType="done"
          onSubmitEditing={addItem}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addItem}
          activeOpacity={0.7}
        >
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      {items.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearList}
          activeOpacity={0.7}
        >
          <Text style={styles.clearButtonText}>Clear List</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              { backgroundColor: item.isChecked ? '#e8f5e9' : '#ffffff' }
            ]}
            onPress={() => toggleItem(item.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.itemText,
                {
                  color: item.isChecked ? '#2e7d32' : '#1a1a1a',
                  textDecorationLine: item.isChecked ? 'line-through' : 'none',
                }
              ]}
            >
              {item.name}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteItem(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 color="#ff3b30" size={20} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    marginLeft: 10,
    color: '#1a1a1a',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  clearButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});