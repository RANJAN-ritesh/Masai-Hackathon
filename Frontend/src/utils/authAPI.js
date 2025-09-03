/**
 * Utility functions for making authenticated API requests
 */

const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

/**
 * Get the authentication headers with proper JWT token
 * Falls back to userId if JWT token is not available (temporary compatibility)
 */
export const getAuthHeaders = () => {
  const authToken = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");
  
  // Use JWT token if available, otherwise fall back to userId
  const token = authToken || userId;
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Make an authenticated GET request
 */
export const authGet = async (endpoint) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response;
};

/**
 * Make an authenticated POST request
 */
export const authPost = async (endpoint, data) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response;
};

/**
 * Make an authenticated PUT request
 */
export const authPut = async (endpoint, data = null) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined
  });
  return response;
};

/**
 * Make an authenticated DELETE request
 */
export const authDelete = async (endpoint) => {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response;
};

/**
 * Update stored auth token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userData");
  localStorage.removeItem("currentHackathon");
};
