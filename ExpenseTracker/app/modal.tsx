import React, { useRef, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import { addExpense } from '../services/database'; // Import hàm addExpense
import { StatusBar } from 'expo-status-bar';

export default function ModalScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'thu' | 'chi'>('chi'); // Mặc định là 'chi'

  // (Câu 3c) Dùng useRef
  const titleRef = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);

  // (Câu 3b) Hàm xử lý khi bấm "Save"
  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tiêu đề và Số tiền hợp lệ.');
      return;
    }
    
    try {
      await addExpense(title, numericAmount, type);
      
      // (Câu 3c) Dùng useRef để clear
      titleRef.current?.clear();
      amountRef.current?.clear();

      // Clear state
      setTitle('');
      setAmount('');
      
      // Đóng modal
      router.back();

    } catch (error) {
      console.error('Lỗi khi thêm khoản chi:', error);
      Alert.alert('Lỗi', 'Không thể lưu.');
    }
  };

  return (
    <View style={styles.container}>
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
        ref={titleRef}
        style={styles.input}
        placeholder="VD: Tiền ăn trưa"
        value={title}
        onChangeText={setTitle}
      />
      
      <Text style={styles.label}>Số tiền:</Text>
      <TextInput
        ref={amountRef}
        style={styles.input}
        placeholder="VD: 50000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      
      {/* (Câu 3b) Nút "Save" */}
      <Button title="Save" onPress={handleSave} />
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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