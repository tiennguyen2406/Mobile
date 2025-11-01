import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getExpenseById, updateExpense, ExpenseItem } from '../../services/database';
import { StatusBar } from 'expo-status-bar';

export default function EditScreen() {
  // Lấy { id } từ tên tệp [id].tsx
  const { id } = useLocalSearchParams();
  const expenseId = Number(id);

  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'thu' | 'chi'>('chi');
  const [isLoading, setIsLoading] = useState(true);

  // Bước 1: Tải dữ liệu của khoản chi này khi màn hình mở ra
  useEffect(() => {
    if (!expenseId) return;

    const loadExpense = async () => {
      try {
        const data = await getExpenseById(expenseId);
        if (data) {
          setExpense(data);
          setTitle(data.title);
          setAmount(data.amount.toString());
          setType(data.type);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy khoản chi.');
          router.back();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadExpense();
  }, [expenseId]);

  // (Câu 4b) Xử lý nút "Save"
  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tiêu đề và Số tiền hợp lệ.');
      return;
    }

    try {
      await updateExpense(expenseId, title, numericAmount, type);
      router.back(); // Quay về màn hình chính
      // Màn hình chính sẽ tự refresh (Câu 4c) nhờ useFocusEffect
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể cập nhật.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sao chép UI từ modal.tsx */}
      <Text style={styles.label}>Loại:</Text>
      <View style={styles.typeSelector}>
        <Pressable
          style={[styles.typeButton, type === 'chi' && styles.typeButtonActive]}
          onPress={() => setType('chi')}
        >
          <Text style={[styles.typeButtonText, type === 'chi' && styles.typeButtonTextActive]}>Chi</Text>
        </Pressable>
        <Pressable
          style={[styles.typeButton, type === 'thu' && styles.typeButtonActive]}
          onPress={() => setType('thu')}
        >
          <Text style={[styles.typeButtonText, type === 'thu' && styles.typeButtonTextActive]}>Thu</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Tên khoản:</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Tiền ăn trưa"
        value={title}
        onChangeText={setTitle}
      />
      
      <Text style={styles.label}>Số tiền:</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: 50000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      
      {/* (Câu 4b) Nút "Save" */}
      <Button title="Save" onPress={handleSave} />
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

// Bạn có thể copy styles từ modal.tsx sang cho nhanh
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'blue',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  typeButtonActive: {
    backgroundColor: 'blue',
  },
  typeButtonText: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
});