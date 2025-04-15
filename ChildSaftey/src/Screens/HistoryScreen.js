import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { fetchHistoricalData } from '../api';
import DataChart from '../components/DataChart';
import { getStoredReadings } from '../services/storage';
import moment from 'moment';

const TIME_RANGES = {
  HOUR: '1 Hour',
  DAY: '24 Hours',
  WEEK: '7 Days',
};

const HistoryScreen = () => {
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES.HOUR);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    average: 0,
    min: 0,
    max: 0,
  });

  useEffect(() => {
    loadHistoricalData(selectedRange);
  }, [selectedRange]);

  const loadHistoricalData = async (range) => {
    setIsLoading(true);
    try {
      // First try to get data from API
      const apiData = await fetchHistoricalData(range);
      if (apiData && apiData.length > 0) {
        setHistoricalData(apiData);
        calculateStatistics(apiData);
      } else {
        // Fall back to local storage if API fails
        const storedData = await getStoredReadings();
        const filteredData = filterDataByRange(storedData, range);
        setHistoricalData(filteredData);
        calculateStatistics(filteredData);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
      // Try local storage as fallback
      try {
        const storedData = await getStoredReadings();
        const filteredData = filterDataByRange(storedData, range);
        setHistoricalData(filteredData);
        calculateStatistics(filteredData);
      } catch (storageError) {
        console.error('Error loading from storage:', storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterDataByRange = (data, range) => {
    const now = moment();
    let cutoff;
    
    switch(range) {
      case TIME_RANGES.HOUR:
        cutoff = moment().subtract(1, 'hours');
        break;
      case TIME_RANGES.DAY:
        cutoff = moment().subtract(24, 'hours');
        break;
      case TIME_RANGES.WEEK:
        cutoff = moment().subtract(7, 'days');
        break;
      default:
        cutoff = moment().subtract(1, 'hours');
    }
    
    return data.filter(item => {
      const itemTime = moment(item.timestamp);
      return itemTime.isAfter(cutoff) && itemTime.isBefore(now);
    });
  };

  const calculateStatistics = (data) => {
    if (data.length === 0) {
      setStatistics({ average: 0, min: 0, max: 0 });
      return;
    }
    
    const values = data.map(item => item.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    setStatistics({
      average: parseFloat(avg.toFixed(1)),
      min: parseFloat(min.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.rangeSelector}>
          {Object.values(TIME_RANGES).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeButton,
                selectedRange === range && styles.rangeButtonActive,
              ]}
              onPress={() => setSelectedRange(range)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  selectedRange === range && styles.rangeButtonTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.average}%</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.min}%</Text>
            <Text style={styles.statLabel}>Minimum</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.max}%</Text>
            <Text style={styles.statLabel}>Maximum</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Oxygen Level History</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading data...</Text>
            </View>
          ) : historicalData.length > 0 ? (
            <DataChart data={historicalData} fullSize={true} />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No historical data available</Text>
            </View>
          )}
        </View>

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Understanding the Data</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#27AE60' }]} />
            <Text style={styles.legendText}>
              <Text style={styles.bold}>Normal (20.0%+):</Text> Safe oxygen levels
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F2C94C' }]} />
            <Text style={styles.legendText}>
              <Text style={styles.bold}>Warning (19.5-20.0%):</Text> Reduced oxygen level
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EB5757' }]} />
            <Text style={styles.legendText}>
              <Text style={styles.bold}>Alert (Below 19.5%):</Text> Potentially unsafe level
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#EB5757',
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  noDataText: {
    color: '#666',
    textAlign: 'center',
  },
  legendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  bold: {
    fontWeight: '600',
  },
});

export default HistoryScreen;