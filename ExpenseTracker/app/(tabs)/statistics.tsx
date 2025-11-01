import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { syncToAPI, initDB, getExpenses, ExpenseItem } from '../../services/database'; // Import hàm sync và DB
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export default function StatisticsScreen() {
  // States cho Câu 9
  const [apiUrl, setApiUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartData, setChartData] = useState<{ labels: string[]; thu: number[]; chi: number[] }>({ labels: [], thu: [], chi: [] });

  const screenWidth = Dimensions.get('window').width - 40; // padding

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

  // Load expenses and compute monthly totals
  useEffect(() => {
    const load = async () => {
      setLoadingChart(true);
      try {
        await initDB();
        const items: ExpenseItem[] = await getExpenses();

        // Helper: get monthKey 'MM/YYYY' from createdAt which is in 'dd/mm/yyyy' format
        const monthKey = (dateStr: string) => {
          const parts = dateStr.split('/');
          if (parts.length >= 3) {
            const m = parts[1];
            const y = parts[2];
            return `${m}/${y}`;
          }
          // fallback: try Date
          const d = new Date(dateStr);
          return `${d.getMonth() + 1}/${d.getFullYear()}`;
        };

        const totalsMap: Record<string, { thu: number; chi: number; date: Date }> = {};

        items.forEach((it) => {
          const key = monthKey(it.createdAt);
          if (!totalsMap[key]) {
            // derive a Date for sorting (use first day of month)
            const [m, y] = key.split('/').map((s) => parseInt(s, 10));
            totalsMap[key] = { thu: 0, chi: 0, date: new Date(y, m - 1, 1) };
          }
          if (it.type === 'thu') totalsMap[key].thu += it.amount;
          else totalsMap[key].chi += it.amount;
        });

        // Take last 6 months (by date)
        const entries = Object.entries(totalsMap).map(([k, v]) => ({ key: k, thu: v.thu, chi: v.chi, date: v.date }));
        entries.sort((a, b) => a.date.getTime() - b.date.getTime());

        // If fewer than 6 months, still show what's available
        const selected = entries.slice(-6);

        const labels = selected.map((e) => e.key);
        const thu = selected.map((e) => e.thu);
        const chi = selected.map((e) => e.chi);

        setChartData({ labels, thu, chi });
      } catch (error) {
        console.error('Error loading chart data', error);
      } finally {
        setLoadingChart(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
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

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Câu 11: Biểu đồ Thống kê thu/chi theo tháng</Text>
        {loadingChart ? (
          <ActivityIndicator size="small" color="blue" />
        ) : chartData.labels.length === 0 ? (
          <Text style={styles.placeholderText}>Chưa có dữ liệu để vẽ biểu đồ.</Text>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Svg width={screenWidth} height={220}>
              {/* Determine scales */}
              {(() => {
                const paddingLeft = 30;
                const paddingBottom = 30;
                const plotWidth = screenWidth - paddingLeft;
                const maxVal = Math.max(...chartData.thu, ...chartData.chi, 1);
                const barGroupWidth = plotWidth / chartData.labels.length;
                const barWidth = Math.min(24, barGroupWidth / 3);

                const elements: any[] = [];

                chartData.labels.forEach((label, i) => {
                  const xGroup = paddingLeft + i * barGroupWidth + (barGroupWidth - 2 * barWidth) / 2;
                  const thuH = (chartData.thu[i] / maxVal) * (180);
                  const chiH = (chartData.chi[i] / maxVal) * (180);

                  // Thu (green) - left
                  elements.push(
                    <Rect
                      key={`thu-${i}`}
                      x={xGroup}
                      y={200 - thuH}
                      width={barWidth}
                      height={thuH}
                      fill="green"
                      rx={3}
                    />
                  );

                  // Chi (red) - right
                  elements.push(
                    <Rect
                      key={`chi-${i}`}
                      x={xGroup + barWidth + 4}
                      y={200 - chiH}
                      width={barWidth}
                      height={chiH}
                      fill="red"
                      rx={3}
                    />
                  );

                  // Label
                  elements.push(
                    <SvgText
                      key={`lab-${i}`}
                      x={xGroup + barWidth}
                      y={210}
                      fontSize="12"
                      fill="#333"
                      alignmentBaseline="hanging"
                      textAnchor="middle"
                    >
                      {label}
                    </SvgText>
                  );
                });

                // Y-axis labels (0 and max)
                elements.push(
                  <SvgText key="y-max" x={6} y={20} fontSize="12" fill="#666">{Math.round(maxVal).toLocaleString()}</SvgText>
                );
                elements.push(
                  <SvgText key="y-0" x={6} y={200} fontSize="12" fill="#666">0</SvgText>
                );

                return elements;
              })()}
            </Svg>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: 'green' }]} /><Text style={styles.legendText}>Thu</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: 'red' }]} /><Text style={styles.legendText}>Chi</Text></View>
            </View>
          </View>
        )}
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
  legendRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
  },
});