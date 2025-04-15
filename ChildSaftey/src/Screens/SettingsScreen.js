import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStorageItem, setStorageItem } from '../services/storage';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [backgroundMonitoring, setBackgroundMonitoring] = useState(true);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [deviceID, setDeviceID] = useState('');
  const [deviceConnected, setDeviceConnected] = useState(false);
  
  // Load settings from storage when component mounts
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const notifEnabled = await getStorageItem('notificationsEnabled');
      if (notifEnabled !== null) setNotificationsEnabled(JSON.parse(notifEnabled));
      
      const soundOn = await getStorageItem('soundEnabled');
      if (soundOn !== null) setSoundEnabled(JSON.parse(soundOn));
      
      const bgMonitoring = await getStorageItem('backgroundMonitoring');
      if (bgMonitoring !== null) setBackgroundMonitoring(JSON.parse(bgMonitoring));
      
      const contact = await getStorageItem('emergencyContact');
      if (contact) setEmergencyContact(contact);
      
      const devID = await getStorageItem('deviceID');
      if (devID) setDeviceID(devID);
      
      const devConnected = await getStorageItem('deviceConnected');
      if (devConnected !== null) setDeviceConnected(JSON.parse(devConnected));
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'There was a problem loading your settings');
    }
  };
  
  const saveSettings = async (key, value) => {
    try {
      await setStorageItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };
  
  const handleToggleNotifications = (value) => {
    setNotificationsEnabled(value);
    saveSettings('notificationsEnabled', value);
  };
  
  const handleToggleSound = (value) => {
    setSoundEnabled(value);
    saveSettings('soundEnabled', value);
  };
  
  const handleToggleBackgroundMonitoring = (value) => {
    setBackgroundMonitoring(value);
    saveSettings('backgroundMonitoring', value);
  };
  
  const handleSaveEmergencyContact = () => {
    try {
      setStorageItem('emergencyContact', emergencyContact);
      Alert.alert('Success', 'Emergency contact updated successfully');
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };
  
  const handleConnectDevice = () => {
    if (deviceID.trim() === '') {
      Alert.alert('Error', 'Please enter a valid device ID');
      return;
    }
    
    // Simulate device connection
    setTimeout(() => {
      setDeviceConnected(true);
      setStorageItem('deviceID', deviceID);
      setStorageItem('deviceConnected', 'true');
      Alert.alert('Success', 'Device connected successfully');
    }, 1500);
  };
  
  const handleDisconnectDevice = () => {
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect this device?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          onPress: () => {
            setDeviceConnected(false);
            setStorageItem('deviceConnected', 'false');
            Alert.alert('Success', 'Device disconnected');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              setNotificationsEnabled(true);
              setSoundEnabled(true);
              setBackgroundMonitoring(true);
              setEmergencyContact('');
              
              await setStorageItem('notificationsEnabled', 'true');
              await setStorageItem('soundEnabled', 'true');
              await setStorageItem('backgroundMonitoring', 'true');
              await setStorageItem('emergencyContact', '');
              
              Alert.alert('Success', 'Settings reset to default');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="bell" size={24} color="#4A90E2" />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#D1D1D6', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="volume-high" size={24} color="#4A90E2" />
              <Text style={styles.settingText}>Sound Alerts</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#D1D1D6', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="radar" size={24} color="#4A90E2" />
              <Text style={styles.settingText}>Background Monitoring</Text>
            </View>
            <Switch
              value={backgroundMonitoring}
              onValueChange={handleToggleBackgroundMonitoring}
              trackColor={{ false: '#D1D1D6', true: '#4CD964' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <TextInput
            style={styles.input}
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="Enter emergency contact phone number"
            keyboardType="phone-pad"
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSaveEmergencyContact}
          >
            <Text style={styles.buttonText}>Save Contact</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Management</Text>
          
          {deviceConnected ? (
            <View>
              <View style={styles.deviceInfo}>
                <Icon name="bluetooth-connect" size={24} color="#4A90E2" />
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceName}>Connected Device</Text>
                  <Text style={styles.deviceId}>{deviceID}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.button, styles.disconnectButton]} 
                onPress={handleDisconnectDevice}
              >
                <Text style={styles.disconnectButtonText}>Disconnect Device</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.input}
                value={deviceID}
                onChangeText={setDeviceID}
                placeholder="Enter device ID"
              />
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleConnectDevice}
              >
                <Text style={styles.buttonText}>Connect Device</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={handleResetSettings}
        >
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>App Version: 1.2.3</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
  },
  deviceDetails: {
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  deviceId: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 16,
    marginTop: 24,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#888888',
  },
});

export default SettingsScreen;