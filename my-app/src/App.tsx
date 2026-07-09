import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useState } from "react"; 
import MarketPage from "./pages/MarketPage";
import PortfolioPage from "./pages/PortfolioPage";
import LoginPage from "./pages/LoginPage"; 
import { Toaster } from "react-hot-toast";
import RegisterPage from "./pages/RegisterPage";
import TransactionsPage from "./pages/TransactionsPage";
import WatchlistPage from "./pages/WatchlistPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("token")
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        {isAuthenticated && (
          <nav className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-sm px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/portfolio" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                Portfolio
              </Link>
              <Link to="/market" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                Market
              </Link>
              <Link to="/transactions" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                History
              </Link>
              <Link to="/watchlists" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                Watchlists
              </Link>
            </div>
            
            <button 
              onClick={() => { localStorage.clear(); setIsAuthenticated(false); }}
              className="text-sm font-medium text-gray-500 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50"
            >
              Log out
            </button>
          </nav>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Toaster position="top-right" />
          <Routes> 
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/portfolio"/> : <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />} 
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/portfolio" /> : <RegisterPage />} 
            />
            <Route 
              path="/portfolio" 
              element={isAuthenticated ? <PortfolioPage /> : <Navigate to="/register" />} 
            />
            <Route 
              path="/market" 
              element={isAuthenticated ? <MarketPage /> : <Navigate to="/register" />}
            />
            <Route 
              path="/transactions" 
              element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/register" />}
            />
            <Route 
              path="/watchlists" 
              element={isAuthenticated ? <WatchlistPage /> : <Navigate to="/register" />}
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