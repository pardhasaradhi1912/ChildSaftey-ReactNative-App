import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Check if token exists on app load
  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');
      
      if (userToken && userInfoString) {
        setUserInfo(JSON.parse(userInfoString));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Error retrieving auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Call checkLoginStatus on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const logout = async () => {
    try {
      // Clear all authentication related data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setIsLoggedIn(false);
      setUserInfo(null);
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        isLoading,
        userInfo,
        setIsLoggedIn, 
        setUserInfo,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};