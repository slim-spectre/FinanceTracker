import './App.css'
import toast, { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
function App() {

  return (
    <div>
      <LoginPage/>
      <Toaster />
    </div>
  )
}

export default App
