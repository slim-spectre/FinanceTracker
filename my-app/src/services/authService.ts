import { type LoginCredentials, type RegisterCredentials } from '../types/Auth';
const API_URL = import.meta.env.VITE_API_URL || "";

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Invalid credentials");
  }
  const data = await response.json();
  const tokenString = data.token;
  localStorage.setItem('token', tokenString);
  return tokenString;
}

export const registerUser = async (credentials: RegisterCredentials) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {}
    throw new Error(errorMessage || "Something went wrong");
  }
  return await response.text();
}