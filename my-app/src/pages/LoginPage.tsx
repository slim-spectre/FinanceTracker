import React, { useState } from "react"
import { loginUser } from '../services/authService'
import { validateEmail, validatePassword } from "../utils/validation"
import { type LoginCredentials } from "../types/Auth"
import { toast } from 'react-hot-toast'

function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [backendError, setBackendError] = useState<string>("");

  
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      
      
      if (emailError || passwordError || !email || !password) {
        toast.error("Please fix validation errors first");
        return;
      }

      const credentials: LoginCredentials = { email, password };
      
      
      await loginUser(credentials); 
      
      toast.success("Logged in successfully!");
      setBackendError(""); 
    } catch (error: any) {
      toast.error(error.message || "Network error, please try again later");
      setBackendError(error.message);
    }
  }

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value, "Not correct form of email"));
  }

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value, "Not correct form of password"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={handleEmail} placeholder="Email" />
      {emailError && <span>{emailError}</span>}
      
      <input type="password" value={password} onChange={handlePassword} placeholder="Password" />
      {passwordError && <span>{passwordError}</span>}
      
      {backendError && <span style={{ color: 'red' }}>{backendError}</span>}
      <button type="submit">Sign in</button>
    </form>
  );
}

export default LoginPage;