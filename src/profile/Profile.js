// Internal
import './Profile.css';
import Navbar from '../components/Navbar';

// External
import { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from "react-router-dom"; 
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({});
    const [inputs, setInputs] = useState({});
    const [editing, setEditing] = useState(false);
    const [changedInputs, setChangedInputs] = useState(false);
    
    useEffect(() => {
        async function getSelf() {
            try {
                let result = await Axios.get('http://localhost:8000/getSelf',{
                    headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                }).catch(()=>{});
                if (result.data) {
                    setProfile(result.data.data);
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
        getSelf();
    }, [editing]);

    const toggleEditing = () => {
        if (!editing) {
            setInputs(values => ({...values, 'email': profile.email}));
            setEditing(true);
        } else {
            setEditing(false);
        }
    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    useEffect(() => {
        if (profile.email === inputs.email && !inputs.password) {
            setChangedInputs(false);
        } else {
            setChangedInputs(true);
        }
    }, [profile, inputs])

    const handleSubmit = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/updateSelf',
                inputs, 
                {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}`}}
            ).catch((e)=>{
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
            if (result) {
                toast.success(result.data.message);
                setEditing(false);
                setInputs({});
            }
        } catch (e) {
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
        }
    }

    return (
        <>
        <Navbar />
        <div className="profile-container">
            <span className="title">My Account</span>
            <div className="profile-form">
                <div>
                    <div>
                        Username: {profile.username}
                    </div>
                    <div className="profile-input">
                    {editing
                    ? <TextField name="email" label="Email" id="email" value={inputs.email || ""} onChange={handleChange}/>
                    : `Email: ${profile.email}`
                    }
                    </div>
                    <div className="profile-input">
                    {editing
                    ? <TextField name="password" label="New Password" type="password" id="password" value={inputs.password || ""} onChange={handleChange}/>
                    : `Password: ****************`
                    }    
                    </div>
                </div>
                <div>
                    <div>User Groups:                        
                        {profile.group_list && profile.group_list.slice(1,-1).split(",").map(group => (
                                <button className="group-button">{group}</button>
                        ))}
                    </div>
                    {editing
                    ? changedInputs
                        ? <Button type="submit" variant="contained" onClick={handleSubmit}>Save</Button>
                        : <Button type="button" variant="outlined" onClick={toggleEditing}>Cancel</Button>
                    : <Button type="button" variant="outlined" onClick={toggleEditing}>Edit</Button>
                    }
                </div>
            </div>
        </div>
        </>
    );
}

export default Profile;