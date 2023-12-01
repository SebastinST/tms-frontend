// Internal
import './Navbar.css';

// External
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Checkgroup from '../components/Checkgroup';
import { toast } from 'react-toastify';

function Navbar() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const token = Cookies.get("jwt-token");

    const handleLogout = async() => {
        try {
            let result = await Axios.get('http://localhost:8000/_logout',{
                headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
            });
            Cookies.remove('jwt-token');

            navigate("/");

            toast.success(result.data.message);
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

    useEffect(() => {
        async function checkAdmin() {
            if (token && await Checkgroup("admin")) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        }
        checkAdmin();
    }, [token])
    

    return (
        <>
        <div className="navbar">
            <Link className="title" to="/main">TMS</Link>
            <div className="buttons">
                {isAdmin &&
                    <button type="button">
                        <Link to='/admin'>
                            Account Management
                        </Link>
                    </button>
                }
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
        </>
        
    );
}

export default Navbar;
