import {type LoginCredentials} from '../types/Auth'
import { type RegisterCredentials } from '../types/Auth';
import toast from 'react-hot-toast';


export const loginUser = async (credentials:LoginCredentials) => {
  const response = await fetch("/api/login",{
    method:"POST",
    headers: {
      'Content-Type' : 'application/json',
    },
    body:JSON.stringify(credentials)
  });
  if(!response.ok){
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Invalid credentials"); 
  }
  const data = await response.json();
  const tokenString = data.token;

  localStorage.setItem('token',tokenString);
  return tokenString;
}

export const registerUser = async (credentials: RegisterCredentials) => {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
    }

    throw new Error(errorMessage || "Something went wrong");
  }
  const data = await response.text();
  return data;
}