// Internal
import './Navbar.css';

// External
import { useNavigate } from "react-router-dom";
import Axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Checkgroup from '../components/Checkgroup';
import { toast } from 'react-toastify';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography"

function Navbar() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const token = Cookies.get("jwt-token");

    const handleLogout = async() => {
        try {
            let result = await Axios.get('http://localhost:8000/_logout',{
                headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
            }).catch((e)=>{
                if (e.response.status === 401) {
                    Cookies.remove('jwt-token');
                    navigate("/");
                }
    
                let error = e.response.data
                if (error) {
                    // Show error message
                    toast.error(error.message, {
                        autoClose: false,
                    });
                }
            });
            Cookies.remove('jwt-token');

            navigate("/");

            toast.success(result.data.message);
        } catch (e) {
            try {
                if (e.response.status === 401) {
                    Cookies.remove('jwt-token');
                    navigate("/");
                }
                let error = e.response.data
                if (error) {
                    // Show error message
                    toast.error(error.message, {
                        autoClose: false,
                    });
                }
            } catch (e) {
                toast.error(e, {
                    autoClose: false,
                });
            }
        }
    }

    useEffect(() => {
        async function checkAdmin() {
            try {
                await Checkgroup("admin").then(function(result){
                    if (result.response && result.response.status == 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    if (result === true) {
                        setIsAdmin(true);
                    }
                })
            } catch (e) {
                setIsAdmin(false);
            }   
        }
        checkAdmin();
    }, [token])
    

    return (
        <>
        <div className="navbar">
            <Button type="submit" variant="text" onClick={() => navigate("/main")}>
                <Typography variant='h3'>TMS</Typography>
            </Button>
            <div className="buttons">
                {isAdmin &&
                    <Button variant="contained" size="small" onClick={() => navigate("/admin")}>
                        Account<br/>Management
                    </Button>
                }
                <Button variant="contained" size="small" onClick={() => navigate("/profile")}>
                    My Account
                </Button>
                <Button variant="contained" size="small" onClick={handleLogout}>
                    Log Out
                </Button>
            </div>
        </div>
        </>
        
    );
}

export default Navbar;
