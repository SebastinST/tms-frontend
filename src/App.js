import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './login/Login';
import User from './user/User';
import Admin from './admin/Admin';
import Profile from './profile/Profile';
import CheckLogin from './components/CheckLogin';
import CatchAll from './components/CatchAll';

function App() {

  return (
    <div className="App">
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/user" element={<CheckLogin><User /></CheckLogin>} />
            <Route path="/admin" element={<CheckLogin><Admin /></CheckLogin>} />
            <Route path="/profile" element={<CheckLogin><Profile /></CheckLogin>} />
            <Route path="*" element={<CatchAll />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
