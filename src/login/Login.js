// Internal
import './Login.css';

// External
import Axios from 'axios';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function Login() {
    const navigate = useNavigate();

    const handleSubmit = async(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget)
        const login = {
          username: form.get("username"),
          password: form.get("password")
        }
        try {
            let result = await Axios.post('http://localhost:8000/login', login).catch((e)=>{
                let error = e.response.data
                if (error) {
                    // Show error message
                    toast.error(error.message, {
                        autoClose: false,
                    });
                }
            });
            
            Cookies.remove('jwt-token');
            // Add token to current user (result.data.token)
            Cookies.set('jwt-token', result.data.token);
            
            navigate("/main");
        } catch (e) {
            try {
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
    
    return (
        <form onSubmit={handleSubmit} className="login-form">
            <span className="title">TMS</span>
            <TextField margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" autoFocus />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" />
            <Button type="submit" fullWidth variant="contained">
              Sign In
            </Button>
        </form>
    );
}

export default Login;
