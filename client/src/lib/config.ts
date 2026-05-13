/**
 * Central configuration for API endpoints.
 * Uses VITE_API_URL from environment variables or falls back to localhost.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
