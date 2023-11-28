// Internal
import './Admin.css';

// External Functional
import { useState } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

// External Aesthetics
import CreatableSelect from 'react-select/creatable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AddGroup() {
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
        <form onSubmit={handleSubmit} className="add-group">
            <input type="text" name="groupname" value={groupname.group_name || ""} onChange={handleChange} placeholder='Group Name'/>
            <input type="submit" value="Create New Group"/>
        </form>
        <ToastContainer closeOnClick theme="colored"/>
        </>
    )
}

export default AddGroup;