// src/apiConfig.js
// Uses Vite env variable (VITE_API_BASE_URL) with a hardcoded fallback.
// NEVER put localhost here — all API calls go to the deployed backend.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://c2cbackend-lanu.onrender.com";

export default API_BASE_URL;