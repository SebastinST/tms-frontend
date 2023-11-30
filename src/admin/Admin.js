// Internal
import './Admin.css';
import Navbar from '../components/Navbar';
import AddGroup from './AddGroup';
import AddUser from './AddUser';
import EditUser from './EditUser';

// External
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

function User() {
    const [refreshGroups, setRefreshGroups] = useState(false);
    const [refreshUsers, setRefreshUsers] = useState(false);
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
        setRefreshUsers(false);
    }, [refreshUsers]);
    const userRows = users.map(user => {
        return (
            <EditUser 
                id={user.username}
                user={user} 
                refreshGroups={refreshGroups}
                setRefreshGroups={setRefreshGroups}
                setRefreshUsers={setRefreshUsers}
            />        
        );
    });

    return (
        <>
        <Navbar />
        <div className="admin-ui">
            <AddGroup setRefreshGroups={setRefreshGroups} />
            <AddUser 
                refreshGroups={refreshGroups} 
                setRefreshGroups={setRefreshGroups}
                setRefreshUsers={setRefreshUsers}
            />
            <div className="users-container">
                {userRows}
            </div>  
        </div>
        </>
    );
}

export default User;
