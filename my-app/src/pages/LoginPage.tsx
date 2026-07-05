import React, { useState } from "react"
import { loginUser } from '../services/authService'
import { validateLogin, validatePassword } from "../utils/validation"
import { type LoginCredentials } from "../types/Auth"
import { toast } from 'react-hot-toast'
import { type ILoginProps } from "../types/ILoginProps"

function LoginPage({onLoginSuccess} : ILoginProps) {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [backendError, setBackendError] = useState<string>("");

  
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      
      
      if (loginError || passwordError || !login || !password) {
        toast.error("Please fix validation errors first");
        return;
      }

      const credentials: LoginCredentials = { login, password };
      
      
      await loginUser(credentials); 
      
      toast.success("Logged in successfully!");
      onLoginSuccess();
      setBackendError(""); 
    } catch (error: any) {
      toast.error(error.message || "Network error, please try again later");
      setBackendError(error.message);
    }
  }

  const handleLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLogin(value);
    setLoginError(validateLogin(value, "Not correct form of email"));
  }

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value, "Not correct form of password"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={login} onChange={handleLogin} placeholder="Login" />
      {loginError && <span>{loginError}</span>}
      
      <input type="password" value={password} onChange={handlePassword} placeholder="Password" />
      {passwordError && <span>{passwordError}</span>}
      
      {backendError && <span style={{ color: 'red' }}>{backendError}</span>}
      <button type="submit">Sign in</button>
    </form>
  );
}

export default LoginPage;