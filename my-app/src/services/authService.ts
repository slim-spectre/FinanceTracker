import {type LoginCredentials} from '../types/Auth'
import toast from 'react-hot-toast';


export const loginUser = async (credentials:LoginCredentials) => {
  const response = await fetch("/api/auth/login",{
    method:"POST",
    headers: {
      'Content-Type' : 'application/json',
    },
    body:JSON.stringify(credentials)
  });
  if(!response.ok){
    const errorData = await response.json().catch(() => ({}));
    toast.error(errorData.message || "Invalid password or email");
    throw new Error(errorData.message || "Invalid credentials"); 
  }
  const token = await response.text();
  localStorage.setItem('token',token);
  return token;
}