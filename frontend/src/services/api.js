import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload services
export const uploadLegacyCertificate = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/api/upload/legacy', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadDigitalCertificate = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/api/upload/digital', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Verification services
export const verifyCertificate = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/api/verify/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const verifyById = async (certificateId) => {
  return api.get(`/api/verify/${certificateId}`);
};

// Dashboard services
export const getDashboardAnalytics = async () => {
  return api.get('/api/dashboard/analytics');
};

export default api;
