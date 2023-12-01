// External
import { useState } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

function AddGroup(props) {
    const {
        setRefreshGroups
    } = props;
    const navigate = useNavigate();
    
    // createGroup to add groupname
    const [groupname, setGroupname] = useState({});

    const handleChange = (event) => {
        const value = event.target.value;
        setGroupname({group_name : value})
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        try {
            let result = await Axios.post('http://localhost:8000/createGroup',
                groupname,
                {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}`}}
            );
            if (result) {
                toast.success(result.data.message);
                setGroupname({});
                setRefreshGroups(true);
            }
            
        } catch (e) {
            if (e.response.status === 401) {
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
        <form onSubmit={handleSubmit} className="add-group">
            <input type="text" name="groupname" value={groupname.group_name || ""} onChange={handleChange} placeholder='Group Name' required />
            <input type="submit" value="Create New Group"/>
        </form>
    )
}

export default AddGroup;