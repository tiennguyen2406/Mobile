import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable, Alert, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, Link } from 'expo-router'; 
import { initDB, getExpenses, ExpenseItem, softDeleteExpense, searchExpenses } from '../../services/database';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadExpenses = useCallback(async () => {
    // Chỉ bật spinner nếu là lần tải đầu (tránh giật khi gõ)
    if (searchQuery.trim() === '') {
      setIsLoading(true);
    }
    
    try {
      await initDB(); 
      let fetchedExpenses;
      
      // Nếu có nội dung tìm kiếm, gọi searchExpenses
      if (searchQuery.trim() !== '') {
        fetchedExpenses = await searchExpenses(searchQuery);
      } else {
        // Nếu không, tải tất cả
        fetchedExpenses = await getExpenses();
      }
      setExpenses(fetchedExpenses);

    } catch (error) {
      console.error('Lỗi khi tải expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);


  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses]) // loadNotes đã bao gồm searchQuery
  );

  const handleDeletePress = (id: number) => {
    // (Câu 5b) Hiển thị hộp thoại xác nhận
    Alert.alert(
      'Xác nhận Xóa',
      'Bạn có chắc muốn xóa khoản chi này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await softDeleteExpense(id);
              await loadExpenses();
            } catch (error) {
              console.error('Lỗi khi xóa:', error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ExpenseItem }) => (
    <Link href={`/edit/${item.id}`} asChild>
      <Pressable onLongPress={() => handleDeletePress(item.id)}>
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
    </Link>
  );
  
  //onRefresh (Câu 7a, 7b)
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSearchQuery(''); 
    await loadExpenses();
    setIsRefreshing(false);
  }, [loadExpenses]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <ActivityIndicator size="large" color="blue" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* (Câu 6a) Thêm Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên khoản chi..."
          value={searchQuery}
          onChangeText={setSearchQuery} // Cập nhật state khi gõ
        />
      </View>

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy kết quả.' : 'Chưa có khoản thu/chi nào.'}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['blue']} // Màu của spinner (tùy chọn)
          />
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
  emptyText: { // Mới
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});