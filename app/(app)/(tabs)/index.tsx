import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Trash2, Plus } from 'lucide-react-native';

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

  const loadItems = () => {
    const savedItems = localStorage.getItem('shoppingItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  };

  const saveItems = (newItems: ShoppingItem[]) => {
    localStorage.setItem('shoppingItems', JSON.stringify(newItems));
    setItems(newItems);
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
      <Text style={styles.title}>Shopping List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item"
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      {items.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearList}>
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
            >
              <Trash2 color="#ff3b30" size={20} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    marginBottom: 20,
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
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});