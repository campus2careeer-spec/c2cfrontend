// src/apiConfig.js
//
// Environment-aware API base URL:
//   • Local dev  → reads VITE_API_BASE_URL from .env          (http://127.0.0.1:5000)
//   • Production → reads VITE_API_BASE_URL from .env.production (https://c2cbackend-lanu.onrender.com)
//
// Vite automatically picks the right .env file based on the build mode.
// Fallback ensures Render deployments work even without the env var set.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://c2cbackend-lanu.onrender.com";

export default API_BASE_URL;