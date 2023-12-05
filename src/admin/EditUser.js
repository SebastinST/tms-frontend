// External Functional
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import Select from "react-select";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function EditUser(props) {
    const {
        user,
        refreshGroups,
        setRefreshGroups,
        setRefreshUsers
    } = props;
    const navigate = useNavigate();
    
    // updateUser to edit and update user details and refresh users
        // allow user to update certain fields (eg. is_disabled)
    
    // store inputs to be sent on update to DB
    const [inputs, setInputs] = useState({});

    // store all available group options and currently selected group options
    const [groupOptions, setGroupOptions] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);

    // store whether users want to edit/have edited current user details
    const [editing, setEditing] = useState(false);
    const [changedInputs, setChangedInputs] = useState(false);
    
    // Get all groups available on load and if any new group is added
    useEffect(() => {
        try {
            const getGroupOptions = async() => {
                const result = await Axios.get("http://localhost:8000/getAllGroups", 
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
                setGroupOptions(result.data.data.map(group => (
                    { value: group.group_name, label: group.group_name }
                )))
            }
            getGroupOptions();
            setRefreshGroups(false);
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
        
    // rerun after new group is added
    }, [refreshGroups, setRefreshGroups])

    // Handle starting/ending of editing
    const toggleEditing = () => {
        // if starting to edit, set inputs as current user details
        if (!editing) {
            setInputs(values => ({...values, 
                'username' : user.username, 
                'email' : user.email, 
                'group_list' : user.group_list
            }));
            if (user.group_list) {
                setSelectedGroups(user.group_list.slice(1,-1).split(",").map(group => (
                    { value: group, label: group }
                )));
            }
            setEditing(true);
        } else {
            setEditing(false);
        }
    }

    // Handle input field changes
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    // Handle group select input changes
    const handleGroupChange = (event) => {
        let group_list = ",";
        event.map(group => {
            return group_list += group.value + ","
        })
        // delete group_list property if empty
        if (group_list === ",") {
            setInputs(values => ({...values, "group_list": ""}));
        } else {
            setInputs(values => ({...values, "group_list": group_list}));
        }
        
        setSelectedGroups(event);
    }

    // Check if user changed current inputs from original
    useEffect(() => {
        if (user.email === inputs.email && !inputs.password && user.group_list === inputs.group_list) {
            setChangedInputs(false);
        } else {
            setChangedInputs(true);
        }
    }, [user, inputs])

    // Handle saving of changed current inputs from user to DB
    const handleSubmit = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/updateUser',
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
                setRefreshUsers(true);
                setInputs({});
            }
        } catch (e) {
            try {
                if (e.response.status === 401) {
                    Cookies.remove('jwt-token');
                    navigate("/");
                }
                
                if (e.response.status === 403) {
                    setEditing(false);
                    setRefreshUsers(true);
                    setInputs({});
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

    // Handle toggling of activated/disabled status of user
    const toggleStatus = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/toggleUserStatus',
                {'username' : user.username, 'is_disabled' : !user.is_disabled }, 
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
                setRefreshUsers(true);
            }
        } catch (e) {
            if (e.response.status === 403) {
                setEditing(false);
                setRefreshUsers(true);
                setInputs({});
            }

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

    return(
        <form key={user.username}>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableBody>
                    <TableRow>
                        <TableCell align="center" style={{ width: "18%" }}>
                            {user.username}
                        </TableCell>
                        <TableCell align="center">
                            {
                            editing
                            ? <TextField name="email" size="small" label="Email" value={inputs.email || ""} onChange={handleChange}/>
                            : user.email
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>
                            {
                            editing
                            ? <TextField name="password" size="small" label="New Password" type="password" value={inputs.password || ""} onChange={handleChange}/>
                            : '****************'
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>
                            {editing
                            ? <Select
                                isMulti
                                name="group_list"
                                options={groupOptions}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={handleGroupChange}
                                value={selectedGroups}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            : user.group_list
                                ? user.group_list.slice(1,-1).split(",").map(group => (
                                    <button key={group} className="group-button">{group}</button>
                                ))
                                : ""
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "10%" }}>
                            {user.is_disabled ? 'Disabled' : 'Active'}
                        </TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>
                            <div className="users-table-buttons">
                                {editing
                                ?   changedInputs
                                    ? <Button type="button" size="small" variant="contained" onClick={handleSubmit}color="success">Save</Button>
                                    : <Button type="button" size="small" variant="outlined" onClick={toggleEditing}>Cancel</Button>
                                :   <Button type="button" size="small" variant="outlined" onClick={toggleEditing}>Edit</Button>
                                }
                                {
                                    user.is_disabled 
                                    ? <Button type="button" size="small" variant="contained" color="success" onClick={toggleStatus}>Enable</Button>
                                    : <Button type="button" size="small" variant="contained" color="error" onClick={toggleStatus}>
                                    Disable
                                    </Button>
                                }
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
        </form>
    )
}

export default EditUser;