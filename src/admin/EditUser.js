// External Functional
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import Select from "react-select";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

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
                )
                setGroupOptions(result.data.data.map(group => (
                    { value: group.group_name, label: group.group_name }
                )))
            }
            getGroupOptions();
            setRefreshGroups(false);
        } catch (e) {
            let error = e.response.data
            if (error) {
                // Show error message
                toast.error(error.message, {
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
            );
            if (result) {
                toast.success(result.data.message);
                setEditing(false);
                setRefreshUsers(true);
                setInputs({});
            }
        } catch (e) {
            if (e.response.status === 401) {
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
        }
    }

    // Handle toggling of activated/disabled status of user
    const toggleStatus = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/toggleUserStatus',
                {'username' : user.username, 'is_disabled' : !user.is_disabled }, 
                {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}`}}
            );
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
            <table className="users-table">
                <tbody>
                    <tr>
                        <td>
                            {user.username}
                        </td>
                        <td>
                            {
                            editing
                            ? <input type='text' name='email' value={inputs.email} onChange={handleChange} placeholder='New email'/>
                            : user.email
                            }
                        </td>
                        <td>
                            {
                            editing
                            ? <input type='password' name='password' value={inputs.password || ""} onChange={handleChange} placeholder='New password'/>
                            : '****************'
                            }
                        </td>
                        <td>
                            {editing
                            ? <Select
                                isMulti
                                name="group_list"
                                options={groupOptions}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={handleGroupChange}
                                value={selectedGroups}
                                placeholder="Select group"
                            />
                            : user.group_list
                                ? user.group_list.slice(1,-1).split(",").map(group => (
                                    <button key={group} className="group-button">{group}</button>
                                ))
                                : ""
                            }
                        </td>
                        <td>
                            {user.is_disabled ? 'Disabled' : 'Active'}
                        </td>
                        <td>
                            <div className="users-table-buttons">
                                {editing
                                ?   changedInputs
                                    ? <button type="button" onClick={handleSubmit}>Save</button>
                                    : <button type="button" onClick={toggleEditing}>Cancel</button>
                                :   <button type="button" onClick={toggleEditing}>Edit</button> 
                                }
                                <button type="button" onClick={toggleStatus}>
                                    {user.is_disabled ? "Enable" : "Disable"}
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    )
}

export default EditUser;