import './App.css';
import Login from './login/Login';
import User from './user/User';
import Admin from './admin/Admin';
import Profile from './profile/Profile';
import ValidateUser from './components/ValidateUser';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <div className="App">
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/user" element={<ValidateUser><User /></ValidateUser>} />
            <Route path="/admin" element={<ValidateUser group={"admin"}><Admin /></ValidateUser>} />
            <Route path="/profile" element={<ValidateUser><Profile /></ValidateUser>} />
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
