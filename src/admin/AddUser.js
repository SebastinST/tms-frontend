// External
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
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function AddUser(props) {
    const {
        refreshGroups, 
        setRefreshGroups,
        setRefreshUsers
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
                    setGroupOptions(result.data.data.map(group => (
                        { value: group.group_name, label: group.group_name }
                    )));
                }
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
                setInputs({});
                setSelectedGroups([]);
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
        <form onSubmit={handleSubmit} className="add-user-form">
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" style={{ width: "18%" }}>Username*</TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>Email</TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>Password*</TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>Groups</TableCell>
                        <TableCell align="center" style={{ width: "10%" }}>Status</TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell align="center" style={{ width: "18%" }}>
                            <TextField name="username" required size="small" label="New Username" value={inputs.username || ""} onChange={handleChange}/>
                        </TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>
                            <TextField name="email" size="small" label="New Email" value={inputs.email || ""} onChange={handleChange}/>
                        </TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>
                            <TextField name="password" required size="small" label="New Password" type="password" value={inputs.password || ""} onChange={handleChange}/>
                        </TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>
                            <Select
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
                        </TableCell>
                        <TableCell align="center" style={{ width: "10%" }}>Active</TableCell>
                        <TableCell align="center" style={{ width: "18%" }}>
                            <Button type="submit" size="small" variant="contained" color="success">Create New User</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
        </form>
    )
};

export default AddUser;