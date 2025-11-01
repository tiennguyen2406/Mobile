import React, { useState, useCallback } from 'react';
// 1. Import TextInput
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
// 2. Import hàm searchDeletedExpenses
import { getDeletedExpenses, ExpenseItem, searchDeletedExpenses, restoreExpense } from '../../services/database';

export default function TrashScreen() {
  const [deletedExpenses, setDeletedExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Thêm state cho tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // 4. CẬP NHẬT HÀM loadDeletedExpenses
  const loadDeletedExpenses = useCallback(async () => {
    if (searchQuery.trim() === '') {
      setIsLoading(true);
    }
    try {
      let fetchedExpenses;
      if (searchQuery.trim() !== '') {
        fetchedExpenses = await searchDeletedExpenses(searchQuery);
      } else {
        fetchedExpenses = await getDeletedExpenses();
      }
      setDeletedExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Lỗi khi tải khoản đã xóa:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadDeletedExpenses();
    }, [loadDeletedExpenses])
  );

  const handleRestorePress = (id: number) => {
    Alert.alert(
      'Khôi phục Khoản chi',
      'Bạn có muốn khôi phục khoản chi này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'default',
          onPress: async () => {
            try {
              await restoreExpense(id);
              await loadDeletedExpenses(); // Tải lại danh sách đã xóa
            } catch (error) {
              console.error('Lỗi khi khôi phục:', error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ExpenseItem }) => (
    // (Câu 8a) Bọc item trong Pressable
    <Pressable onLongPress={() => handleRestorePress(item.id)}>
      <View style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDate}>{item.createdAt}</Text>
        </View>
        <View>
          <Text 
            style={[
              styles.itemAmount,
              item.type === 'thu' ? styles.thu : styles.chi
            ]}
          >
            {item.type === 'thu' ? '+' : '-'} {item.amount.toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm trong thùng rác..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={deletedExpenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy kết quả.' : 'Thùng rác trống.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: { // Mới
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#f5f5f5',
  },
  searchInput: { // Mới
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  thu: {
    color: 'green',
  },
  chi: {
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});