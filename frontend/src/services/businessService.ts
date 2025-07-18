// src/services/businessService.ts
import axios from 'axios';
import { isPlatform } from '@ionic/react';

// Define the base URL based on the platform
const getBaseUrl = () => {
  // When running in an emulator or device
  if (isPlatform('cordova') || isPlatform('capacitor')) {
    // Replace with your actual server IP address
    // This is your computer's IP address on the network that the emulator can reach
    return 'http://172.27.8.69:3000'; // Replace X with your actual IP
  }
  // When running in the browser with ionic serve
  return 'http://172.27.8.69:3000';
};

// Create a baseURL-configured axios instance
const api = axios.create({
  baseURL: getBaseUrl()
});

export const getTopRated = async () => {
  const res = await api.get('/api/businesses/top-rated');
  return res.data;
};

export const getMostSearched = async () => {
  const res = await api.get('/api/businesses/most-searched');
  return res.data;
};

export const getBusinessesByCategory = async (category: string) => {
  const res = await api.get(`/api/businesses?category=${category}`);
  return res.data;
};

// For debugging purposes
export const testConnection = async () => {
  try {
    console.log(`Testing connection to: ${getBaseUrl()}/api/test`);
    const res = await api.get('/api/test');
    console.log('Connection successful:', res.data);
    return res.data;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  }
};