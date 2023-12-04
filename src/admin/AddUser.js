// External Functional
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import Select from "react-select";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

function AddUser(props) {
    const {
        refreshGroups, 
        setRefreshGroups,
        setRefreshUsers,
        users
    } = props;
    const navigate = useNavigate();
    // createUser to add new user and refresh users
    const [inputs, setInputs] = useState({});
    const [groupOptions, setGroupOptions] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);

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

    const handleGroupChange = (event) => {
        let group_list = ",";
        event.map(group => {
            return group_list += group.value + ","
        })
        // delete group_list property if empty
        if (group_list === ",") {
            const newInputs = delete inputs.group_list;
            setInputs(newInputs);
        } else {
            setInputs(values => ({...values, "group_list": group_list}));
        }
        
        setSelectedGroups(event);
    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        try {
            let result = await Axios.post('http://localhost:8000/createUser', inputs, 
                {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}`}}
            );
            if (result) {
                toast.success(result.data.message);
                setRefreshUsers(true);
                setInputs({});
                setSelectedGroups([]);
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
        <form onSubmit={handleSubmit} className="add-user-form">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Username*</th>
                        <th>Email</th>
                        <th>Password*</th>
                        <th>Groups</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input type="text" name="username" value={inputs.username || ""} onChange={handleChange} placeholder='Username' required/>
                        </td>
                        <td>
                            <input type="text" name="email" value={inputs.email || ""} onChange={handleChange} placeholder='Email'/>
                        </td>
                        <td>
                            <input type="password" name="password" value={inputs.password || ""} onChange={handleChange} placeholder='Password' required/>
                        </td>
                        <td>
                            <Select
                                isMulti
                                name="group_list"
                                options={groupOptions}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={handleGroupChange}
                                value={selectedGroups}
                                placeholder="Select group"
                            />
                        </td>
                        <td>
                            Active
                        </td>
                        <td>
                            <input type="submit" value="Create New User"/>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    )
};

export default AddUser;