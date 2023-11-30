import './Login.css';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import Checkgroup from '../components/Checkgroup';

import { toast } from 'react-toastify';

function Login() {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        try {
            let result = await Axios.post('http://localhost:8000/login', inputs);
            
            // Add token to current user (result.data.token)
            Cookies.set('jwt-token', result.data.token)
            
            // If admin, route to admin
            if (await Checkgroup("admin")) {
                navigate("/admin");
            } else {
                // Else route to user
                navigate("/user");
            }
            
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
        async function redirect() {
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
        redirect();
    }, [navigate]);
    
    return (
        <form onSubmit={handleSubmit} className="login-form">
            <span className="title">TMS</span>
            <label>Username</label>
            <input
                type="text" 
                name="username"
                value={inputs.username || ""} 
                onChange={handleChange}
            />
            <label>Password</label> 
            <input
                type="password"
                name="password" 
                value={inputs.password || ""} 
                onChange={handleChange}
            />
            <input type='submit' value='Sign In' className='submit-button'/>
        </form>
    );
}

export default Login;
