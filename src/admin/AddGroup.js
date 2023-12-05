// External
import { useState } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

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
                setGroupname({});
                setRefreshGroups(true);
            }
            
        } catch (e) {
            try {
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
            } catch (e) {
                toast.error(e, {
                    autoClose: false,
                });
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="add-group">
            <TextField name="groupname" required size="small" label="Group Name" value={groupname.group_name || ""} onChange={handleChange}/>
            <Button type="submit" variant="contained" size="small" color="success">Create New Group</Button>
        </form>
    )
}

export default AddGroup;