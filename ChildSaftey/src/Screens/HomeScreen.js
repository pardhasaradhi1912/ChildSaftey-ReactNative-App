// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PushNotification from 'react-native-push-notification';
import axios from 'axios';

// API configuration
const API_URL = 'https://your-api-endpoint.com/api';

// CircularProgress component for oxygen level display
const CircularProgress = ({ size, strokeWidth, progressPercent, status }) => {
  // Calculate values for the circular progress
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
  
  // Color based on status
  const getColor = () => {
    switch(status) {
      case 'Normal': return '#27AE60'; // Green
      case 'Warning': return '#F2C94C'; // Yellow
      case 'Alert': return '#EB5757';   // Red
      default: return '#27AE60';
    }
  };

  return (
    <View style={{ width: size, height: size }}>
      <View style={[
        styles.circularProgress,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#E0E0E0' 
        }
      ]}>
        <View style={[
          styles.progressLayer,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: getColor(),
            transform: [{ rotateZ: `${progressPercent * 3.6}deg` }]
          }
        ]} />
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const [oxygenLevel, setOxygenLevel] = useState(21.0);
  const [status, setStatus] = useState('Normal');
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentReadings, setRecentReadings] = useState([]);

  useEffect(() => {
    // Initial data fetch
    fetchLatestData();
    
    // Set up polling interval
    const interval = setInterval(() => {
      fetchLatestData();
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchLatestData = async () => {
    try {
      // In a real app, you would fetch from your API endpoint
      // const response = await axios.get(`${API_URL}/readings/latest`);
      
      // Simulating API response for demonstration
      const mockResponse = {
        data: {
          oxygen_level: parseFloat((Math.random() * (21.5 - 19.5) + 19.5).toFixed(1)),
          timestamp: new Date().toISOString(),
          is_alert: Math.random() < 0.1 // 10% chance of alert for demo
        }
      };
      
      const data = mockResponse.data;
      setOxygenLevel(data.oxygen_level);
      updateStatus(data.oxygen_level);
      setIsConnected(true);
      
      // Format and set last update time
      const now = new Date();
      setLastUpdate(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
      
      // Update recent readings
      const newReading = {
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        value: data.oxygen_level
      };
      
      setRecentReadings(prev => {
        const updated = [...prev, newReading];
        return updated.length > 10 ? updated.slice(-10) : updated;
      });
      
      // Check if this is an alert situation
      if (data.is_alert || data.oxygen_level < 19.5) {
        triggerAlert();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsConnected(false);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = (level) => {
    if (level >= 20.0) {
      setStatus('Normal');
    } else if (level >= 19.5) {
      setStatus('Warning');
    } else {
      setStatus('Alert');
    }
  };

  const triggerAlert = () => {
    // Show in-app alert
    Alert.alert(
      "EMERGENCY ALERT",
      "Possible child detected in vehicle! Check immediately!",
      [
        { text: "Call Emergency", onPress: () => callEmergency() },
        { text: "Check Now", onPress: () => console.log("Check now pressed") }
      ],
      { cancelable: false }
    );
    
    // Send push notification
    PushNotification.localNotification({
      channelId: "child-detection-alerts",
      title: "EMERGENCY: Child Detection Alert",
      message: "Possible child detected in your vehicle! Check immediately!",
      playSound: true,
      importance: "high",
      priority: "high",
    });
  };

  const callEmergency = () => {
    // Open phone dialer with emergency number
    Linking.openURL('tel:911');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLatestData();
  };

  const testAlert = () => {
    triggerAlert();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EB5757" />
        <Text style={styles.loadingText}>Connecting to your device...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statusBar}>
          <View style={styles.statusIndicator}>
            <Icon 
              name={isConnected ? "wifi" : "wifi-off"} 
              size={18} 
              color={isConnected ? "#27AE60" : "#EB5757"} 
            />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <Text style={styles.lastUpdateText}>
            Last update: {lastUpdate || 'Never'}
          </Text>
        </View>
        
        <View style={styles.oxygenContainer}>
          <CircularProgress 
            size={200}
            strokeWidth={15}
            progressPercent={(oxygenLevel / 25) * 100}
            status={status}
          />
          <View style={styles.oxygenReading}>
            <Text style={styles.oxygenValue}>{oxygenLevel.toFixed(1)}%</Text>
            <Text style={[
              styles.oxygenStatus,
              status === 'Normal' ? styles.statusNormal : 
              status === 'Warning' ? styles.statusWarning : 
              styles.statusAlert
            ]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Oxygen Level Information</Text>
          <View style={styles.infoItem}>
            <Icon name="information-outline" size={20} color="#4A6572" />
            <Text style={styles.infoText}>
              Normal oxygen level is approximately 20.9%.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="alert-circle-outline" size={20} color="#F2C94C" />
            <Text style={styles.infoText}>
              Levels below 19.5% may indicate reduced air quality.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="alert" size={20} color="#EB5757" />
            <Text style={styles.infoText}>
              The system will detect sounds after 4 minutes of low oxygen.
            </Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Device Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Icon 
                name="battery" 
                size={24} 
                color="#27AE60" 
              />
              <Text style={styles.statusItemText}>Device Battery</Text>
              <Text style={styles.statusItemValue}>Good</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Icon 
                name={isConnected ? "signal" : "signal-off"} 
                size={24} 
                color={isConnected ? "#27AE60" : "#EB5757"} 
              />
              <Text style={styles.statusItemText}>Signal</Text>
              <Text style={styles.statusItemValue}>
                {isConnected ? 'Strong' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={testAlert}
        >
          <Icon name="bell-alert" size={20} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>Test Alert System</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
    padding: 16,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4A6572',
  },
  lastUpdateText: {
    fontSize: 14,
    color: '#4A6572',
  },
  oxygenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressLayer: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotateZ: '-45deg' }],
  },
  oxygenReading: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oxygenValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  oxygenStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  statusNormal: {
    color: '#27AE60',
  },
  statusWarning: {
    color: '#F2C94C',
  },
  statusAlert: {
    color: '#EB5757',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4A6572',
    marginLeft: 8,
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statusDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  statusItemText: {
    fontSize: 14,
    color: '#4A6572',
    marginTop: 8,
  },
  statusItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 4,
  },
  emergencyButton: {
    backgroundColor: '#EB5757',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#EB5757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HomeScreen;