// Internal
import './Admin.css';
import Navbar from '../components/Navbar';
import AddGroup from './AddGroup';
import AddUser from './AddUser';
import EditUser from './EditUser';

// External Functional
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

// External Aesthetics
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function User() {
    
    // createUser to add new user and refresh users
    // updateUser to edit and update user details and refresh users
        // allow user to update certain fields (eg. is_disabled)
    const [users, setUsers] = useState([]);

    // getAllUsers to display users details and refresh when changed, show latest on top
    useEffect(() => {
        async function getAllUsers() {
            try {
                let result = await Axios.get('http://localhost:8000/getAllUsers',{
                    headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                });
                if (result.data) {
                    setUsers(result.data.data.reverse());
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
        getAllUsers();
    }, []);
    const userRows = users.map(user => {
        return (
            <EditUser user={user} id={user.username}/>        
        );
    });

    return (
        <>
        <Navbar />
        <div className="admin-ui">
            <AddGroup />
            <AddUser />
            <div className="users-container">
                {userRows}
            </div>  
        </div>
        <ToastContainer closeOnClick theme="colored"/>
        </>
    );
}

export default User;
