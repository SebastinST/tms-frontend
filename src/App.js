import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './login/Login';
import User from './user/User';
import Admin from './admin/Admin';
import Profile from './profile/Profile';


function App() {

  return (
    <div className="App">
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/user" element={<User />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
