// Internal
import './Profile.css';
import Navbar from '../components/Navbar';

// External
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

function Profile() {
    const [profile, setProfile] = useState({});
    const [inputs, setInputs] = useState({});
    const [editing, setEditing] = useState(false);
    const [changedInputs, setChangedInputs] = useState(false);
    
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
    }, [inputs])

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
                    <div>User Groups:
                        {profile.group_list && profile.group_list.slice(1,-1).split(",").map(group => (
                                <button className="group-button">{group}</button>
                        ))}
                    </div>
                    <button type="button" className="profile-submit" onClick={changedInputs ? handleSubmit : toggleEditing }>
                        {editing ? changedInputs ? "Save" : "Cancel" : "Edit"}
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}

export default Profile;