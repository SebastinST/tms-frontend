// Add cannot press save if no edits

import './Profile.css';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
    const [profile, setProfile] = useState({});
    const [inputs, setInputs] = useState({});
    const [editing, setEditing] = useState(false);
    
    useEffect(() => {
        async function getSelf() {
            try {
                let result = await Axios.get('http://localhost:8000/getSelf',{
                    headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                });
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

    const startEditing = () => {
        setInputs(values => ({...values, 'email': profile.email}));
        setEditing(true);
    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    const handleSubmit = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/updateSelf',
                inputs, 
                {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}`}}
            );
            if (result) {
                toast.success(result.data.message);
                setEditing(false);
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
        <>
        <Navbar />
        <div className="profile-container">
            <span className="title">My Account</span>
            <div className="profile-form">
                <div>
                    <div>
                        Username: {profile.username}
                    </div>
                    <div>
                        Email: {
                        editing
                        ? <input type='text' name='email' value={inputs.email} onChange={handleChange}/>
                        : profile.email
                        }
                    </div>
                    <div>Password: {
                        editing
                        ? <input type='password' name='password' value={inputs.password || ""} onChange={handleChange} placeholder='Input new password'/>
                        : '****************'
                        }
                    </div>
                </div>
                <div>
                    <div>User Groups: dev, admin</div>
                    {editing
                    ? <input className="profile-submit" type="button" onClick={handleSubmit} value="Save"
                        {...profile.email === inputs.email && `disabled`}
                    />
                    : <button className="profile-submit" type="button" onClick={startEditing}>Edit</button> 
                    }
                </div>
            </div>
        </div>
        <ToastContainer closeOnClick theme="colored"/>
        </>
    );
}

export default Profile;