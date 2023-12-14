// Internal
import './App.css';
import Login from './login/Login';
import Main from './main/Main';
import Admin from './admin/Admin';
import Profile from './profile/Profile';
import Tasks from './tasks/Tasks';
import Plans from './plans/Plans';
import ValidateUser from './components/ValidateUser';

// External
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <>
    <ToastContainer closeOnClick theme="colored" autoClose={1000} />
    <div className="App">
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/main" element={<ValidateUser><Main /></ValidateUser>} />
            <Route path="/admin" element={<ValidateUser group={"admin"}><Admin /></ValidateUser>} />
            <Route path="/profile" element={<ValidateUser><Profile /></ValidateUser>} />
            <Route path="/tasks" element={<ValidateUser><Tasks /></ValidateUser>} />
            <Route path="/plans" element={<ValidateUser group={"pm"}><Plans /></ValidateUser>} />
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
    </>
  );
}

export default App;
