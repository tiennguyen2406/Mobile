import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { syncToAPI } from '../../services/database'; // Import hàm sync

export default function StatisticsScreen() {
  // States cho Câu 9
  const [apiUrl, setApiUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // (Câu 9a, 9b) Hàm xử lý khi nhấn nút Đồng bộ
  const handleSync = async () => {
    if (!apiUrl) {
      Alert.alert('Lỗi', 'Vui lòng dán link API .../expenses (Câu 9b).');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Đang đồng bộ...');
    const result = await syncToAPI(apiUrl);
    setSyncMessage(result.message);
    setIsSyncing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* (Câu 9) Phần UI Đồng bộ */}
      <View style={styles.syncContainer}>
        <Text style={styles.sectionTitle}>Câu 9: Đồng bộ API</Text>
        <TextInput
          style={styles.input}
          placeholder="Dán link .../expenses (Câu 9b)"
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          title={isSyncing ? 'Đang đồng bộ...' : 'Nhấn để Đồng bộ (Câu 9a)'}
          onPress={handleSync}
          disabled={isSyncing}
        />
        {isSyncing && <ActivityIndicator size="small" color="blue" style={{ marginTop: 10 }} />}
        {syncMessage ? <Text style={styles.syncMessage}>{syncMessage}</Text> : null}
      </View>

      {/* (Câu 12) Phần Biểu đồ (sẽ làm ở bước sau) */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Câu 12: Biểu đồ Thống kê</Text>
        <Text style={styles.placeholderText}>Biểu đồ sẽ hiển thị ở đây...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  syncContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    fontSize: 14,
  },
  syncMessage: {
    textAlign: 'center',
    marginTop: 10,
    color: 'blue',
    fontStyle: 'italic',
  },
  chartContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});