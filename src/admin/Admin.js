// Internal
import './Admin.css';
import Navbar from '../components/Navbar';
import AddGroup from './AddGroup';

// External Functional
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

// External Aesthetics
import Select from 'react-select';

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
        <tr>
            <td>
                {user.username}
            </td>
            <td>
                {user.email}
            </td>
            <td>
                **********
            </td>
            <td>
                {user.group_list}
            </td>
            <td>
                {user.is_disabled ? 'Disabled' : 'Active'}
            </td>
            <td>
                <div className="users-buttons">
                    <input type="submit" value="Edit"/>
                    <input type="submit" value="Disable"/>
                </div>
            </td>
        </tr>
        );
    });

    return (
        <>
        <Navbar />
        <div className="admin-ui">
            <AddGroup />
            <div className='users-container'>
                <table className="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Password</th>
                                <th>Group</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <input type="text" placeholder='Username'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='Email'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='Password'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='dev, admin'/>
                                </td>
                                <td>
                                    Active
                                </td>
                                <td>
                                    <input type="submit" value="Create New User"/>
                                </td>
                            </tr>
                            {userRows}
                        </tbody>
                </table>
            </div>
        </div>
        <ToastContainer closeOnClick theme="colored"/>
        </>
    );
}

export default User;
