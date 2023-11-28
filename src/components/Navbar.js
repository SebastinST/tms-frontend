import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Axios from 'axios';
import Cookies from 'js-cookie';

import Checkgroup from '../components/Checkgroup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async() => {
        try {
            await Axios.get('http://localhost:8000/_logout',{
                headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
            });
            Cookies.remove('jwt-token');

            navigate("/");
        } catch (e) {
            let error = e.response.data
            if (error) {
                
                // Show error message
                toast.error(error.message, {
                    autoClose: false,
                });
            }
        }
    }

    const backToHome = async() => {
        if (Cookies.get('jwt-token')) {
            // If admin, route to admin
            if (await Checkgroup("admin")) {
                navigate("/admin");
            } else {
                // Else route to user
                navigate("/user");
            }
        }
    }

    return (
        <>
        <div className="navbar">
            <button onClick={backToHome}>
                <span className="title">TMS</span>
            </button>
            <div className="buttons">
                <button type="button">
                    <Link to='/profile'>
                        My Account
                    </Link>
                </button>
                <button type="button" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
        </div>
        <ToastContainer closeOnClick theme="colored"/>
        </>
        
    );
}

export default Navbar;
