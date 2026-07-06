import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useState } from "react"; 
import MarketPage from "./pages/MarketPage";
import PortfolioPage from "./pages/PortfolioPage";
import LoginPage from "./pages/LoginPage"; 
import { Toaster } from "react-hot-toast";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("token")
  );

  return (
    <Router>
      <div style={{ minHeight: "100vh", fontFamily: "sans-serif" }}>
        {isAuthenticated && (
          <nav style={{ padding: "10px 20px", background: "#eee", display: "flex", gap: "15px" }}>
            <Link to="/portfolio">Портфоліо</Link>
            <Link to="/market">Маркет</Link>
            
            <button onClick={() => { localStorage.clear(); setIsAuthenticated(false); }}>Вийти</button>
          </nav>
        )}

        <main style={{ padding: "20px" }}>
          <Toaster />
          <Routes> 
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/portfolio"/> : <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />} 
            />
            <Route
             path="/register"
              element={isAuthenticated ? <Navigate to="/portfolio" /> : <RegisterPage />} />
            <Route 
              path="/portfolio" 
              element={isAuthenticated ? <PortfolioPage /> : <Navigate to="/register" />} 
            />
            <Route 
              path="/market" 
              element={isAuthenticated ? <MarketPage /> : <Navigate to="/register" />}
            />
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? "/portfolio" : "/register"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;