import axios from "axios";

// Backend URL (override with Vite env var). Example: VITE_BACKEND_URL=http://localhost:8080
export const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://chat-app-708i.onrender.com';

export const httpClient = axios.create({
  baseURL,
});

