// Internal
import './Tasks.css';
import Navbar from '../components/Navbar';
import Checkgroup from '../components/Checkgroup';

// External
import Button from "@mui/material/Button";
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";

function Tasks() {
    const navigate = useNavigate();
    const token = Cookies.get("jwt-token");
    const [isPM, setIsPM] = useState(false);
    
    // Get app details from previous link here
    const app = useLocation().state;
    
    // Check if current user is Project Lead to show create or edit app options
    useEffect(() => {
        // Check if app is valid, if not push to main page
        if (!app) {
            toast.error("Error: No application selected", {
                autoClose: false,
            });
            navigate("/main");
        }
        async function checkPM() {
            try {
                await Checkgroup("pm").then(function(result){
                    if (result.response && result.response.status == 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    if (result === true) {
                        setIsPM(true);
                    }
                })
            } catch (e) {
                setIsPM(false);
            }   
        }
        checkPM();
    }, [token, app])

    return (
        <>
        <Navbar />
        <div className="tasks-header">
            <h1>App {app && app.App_Acronym}</h1>
            {isPM && 
                <Button className="plans-button" type="button" size="small" variant="outlined" onClick={() => navigate('/plans', { state : app })}>Manage Plans</Button>
            }
        </div>
        <div className="main-ui">
            
        </div>
        </>
    );
}

export default Tasks;