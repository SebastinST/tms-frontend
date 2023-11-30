// External Functional
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

// External Aesthetics
import Select from "react-select";
import { toast } from 'react-toastify';

function EditUser(props) {
    const {
        user,
        refreshGroups,
        setRefreshGroups,
        setRefreshUsers
    } = props;
    
    // updateUser to edit and update user details and refresh users
        // allow user to update certain fields (eg. is_disabled)
    const [inputs, setInputs] = useState({});
    const [groupOptions, setGroupOptions] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [editing, setEditing] = useState(false);
    const [changedInputs, setChangedInputs] = useState(false);
    
    useEffect(() => {
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
    // rerun after new group is added
    }, [refreshGroups, setRefreshGroups])

    const toggleEditing = () => {
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

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    const handleGroupChange = (event) => {
        let group_list = ",";
        event.map(group => {
            return group_list += group.value + ","
        })
        // delete group_list property if empty
        if (group_list === ",") {
            setInputs(values => ({...values, "group_list": null}));
        } else {
            setInputs(values => ({...values, "group_list": group_list}));
        }
        
        setSelectedGroups(event);
    }

    useEffect(() => {
        if (user.email === inputs.email && user.group_list === inputs.group_list) {
            setChangedInputs(false);
        } else {
            setChangedInputs(true);
        }
    }, [user, inputs])

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
        <form>
            <table className="users-table">
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
                                <button className="group-button">{group}</button>
                            ))
                            : ""
                        }
                    </td>
                    <td>
                        {user.is_disabled ? 'Disabled' : 'Active'}
                    </td>
                    <td>
                        <div className="users-table-buttons">
                            {
                            editing
                            ?   changedInputs
                                ? <input type="button" onClick={handleSubmit} value="Save"/>
                                : <button type="button" onClick={toggleEditing}>Cancel</button>
                            :   <button type="button" onClick={toggleEditing}>Edit</button> 
                            }
                            <button type="button" onClick={toggleStatus}>
                                {user.is_disabled ? "Enable" : "Disable"}
                            </button>
                        </div>
                    </td>
                </tr>
            </table>
        </form>
    )
}

export default EditUser;