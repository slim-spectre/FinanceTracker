import React, { useState } from "react"
import { registerUser } from '../services/authService'
import { validateFullName, validateLogin, validatePassword } from "../utils/validation"
import { type RegisterCredentials } from "../types/Auth"
import { toast } from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName,setFullName] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [fullNameError, setFullNameError] = useState<string>("");
  const [backendError, setBackendError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    try {
      e.preventDefault();

      const currentLoginError = validateLogin(login, "Not correct form of email");
      const currentPasswordError = validatePassword(password, "Not correct form of password");
      const currentFullNameError = validateFullName(fullName,"Not correct form of fullName")
      setLoginError(currentLoginError);
      setPasswordError(currentPasswordError);
      setFullNameError(currentFullNameError)

      if (currentLoginError || currentPasswordError || currentFullNameError || !login || !password || !fullName) {
        toast.error("Please fix validation errors first");
        return;
      }

      const credentials: RegisterCredentials  = { login, password, fullName };
      await registerUser(credentials); 
      
      toast.success("Registered successfully!");
      navigate("/login");
      setBackendError(""); 
    } catch (error: any) {
      toast.error(error.message || "Network error, please try again later");
      setBackendError(error.message);
    }
  }

  const handleLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLogin(value);
    setLoginError(validateLogin(value, "Not correct form of login"));
  }

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value, "Not correct form of password"));
  }

  const handleFullName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    setFullNameError(validateFullName(value, "Not correct form of fullName"));
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={handleFullName} 
            placeholder="John Doe" 
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
              fullNameError ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-gray-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            }`}
          />
          {fullNameError && <p className="text-rose-500 text-xs mt-1 font-medium">{fullNameError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Login</label>
          <input 
            type="text" 
            value={login} 
            onChange={handleLogin} 
            placeholder="example@mail.com" 
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
              loginError ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-gray-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            }`}
          />
          {loginError && <p className="text-rose-500 text-xs mt-1 font-medium">{loginError}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={handlePassword} 
            placeholder="••••••••" 
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
              passwordError ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-gray-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            }`}
          />
          {passwordError && <p className="text-rose-500 text-xs mt-1 font-medium">{passwordError}</p>}
        </div>
        
        {backendError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-2.5 rounded-xl font-medium">
            {backendError}
          </div>
        )}

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all"
        >
          Sign up
        </button>

        <p className="text-center text-sm text-gray-500 pt-2">
          Already have an account?{" "}
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;