import Login from "./Login.js";
import Home from "./Home.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminHome from "./AdminHome.js";
import MyAccount from "./MyAccount.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/myaccount" element={<MyAccount />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
