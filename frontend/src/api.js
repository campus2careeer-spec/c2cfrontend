// src/api.js
import axios from 'axios';
import API_BASE_URL from './apiConfig';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// To use your "Find by Skills" feature:
export const getRecommendations = async (userSkills) => {
  const response = await api.post('/analyze-skills', { skills: userSkills });
  return response.data;
};

export default api;