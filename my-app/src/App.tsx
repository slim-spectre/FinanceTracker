import './App.css'
import toast, { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import MarketPage from './pages/MarketPage';
import { useState } from 'react';
import PortfolioPage from './pages/PortfolioPage';

function App() {

  const [isAuthenticated,setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      {isAuthenticated ? (
        <PortfolioPage />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      <Toaster />
    </div>
  )
}

export default App
