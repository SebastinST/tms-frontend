import './Login.css';
import { useState } from 'react';
import Axios from 'axios';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [inputs, setInputs] = useState({});
    const navigate = useNavigate();

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

            // Take note of groups of logged in user (result.data.group_list)
            Cookies.set('group_list', result.data.group_list)
                
            // If admin, route to admin
            if (Cookies.get('group_list').includes("admin")) {
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
            <ToastContainer closeOnClick theme="colored"/>
        </form>
    );
}

export default Login;
