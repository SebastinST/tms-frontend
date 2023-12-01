// Internal
import './App.css';
import Login from './login/Login';
import Main from './main/Main';
import Admin from './admin/Admin';
import Profile from './profile/Profile';
import ValidateUser from './components/ValidateUser';

// External
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <div className="App">
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/main" element={<ValidateUser><Main /></ValidateUser>} />
            <Route path="/admin" element={<ValidateUser group={"admin"}><Admin /></ValidateUser>} />
            <Route path="/profile" element={<ValidateUser><Profile /></ValidateUser>} />
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </div>
      <ToastContainer closeOnClick theme="colored"/>
    </div>
  );
}

export default App;
