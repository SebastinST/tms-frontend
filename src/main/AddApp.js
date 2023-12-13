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
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function AddApp(props) {
    const {
        setRefreshApps
    } = props;
    const navigate = useNavigate();
    
    // store inputs to be sent on update to DB
    const [inputs, setInputs] = useState({});

    // store all available group options and currently selected group options
    const [groupOptions, setGroupOptions] = useState([]);
    
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
    }, [])

    // Handle input field changes
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    // Handle saving of changed current inputs from user to DB
    const handleSubmit = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/createApp',
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
                setRefreshApps(true);
                setInputs({});
            }
        } catch (e) {
            try {
                if (e.response.status === 401) {
                    Cookies.remove('jwt-token');
                    navigate("/");
                }
                
                if (e.response.status === 403) {
                    setRefreshApps(true);
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

    return(
        <form>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableBody>
                    <TableRow>
                        <TableCell align="center" style={{ width: "5%" }}>
                            <TextField name="App_Acronym" required size="small" label="App " value={inputs.App_Acronym || ""} onChange={handleChange}/>
                        </TableCell>
                        <TableCell align="center" style={{ width: "5%" }}>
                            <TextField name="Start" required size="small" label="Start" value={inputs.App_startDate || ""} onChange={handleChange}/>
                            <TextField name="End" required size="small" label="End" value={inputs.App_endDate || ""} onChange={handleChange}/>
                        </TableCell>
                        <TableCell align="center" style={{ width: "5%" }}>
                            <TextField name="App_Rnumber" required size="small" label="Rnum" value={inputs.App_Rnumber || ""} onChange={handleChange}/>
                        </TableCell>
                        <TableCell style={{ width: "25%" }}>
                            <TextField minRows={4} name="App_Description" size="small" label="App Description" value={inputs.App_Description || ""} onChange={handleChange}/>
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            <Select
                                name="App_permit_create"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_create", value : event.value}})}
                                value={{
                                    value : inputs.App_permit_create,
                                    label : inputs.App_permit_create
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            <Select
                                name="App_permit_Open"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_Open", value : event.value}})}
                                value={{
                                    value : inputs.App_permit_Open,
                                    label : inputs.App_permit_Open
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            <Select
                                name="App_permit_toDoList"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_toDoList", value : event.value}})}
                                value={{
                                    value : inputs.App_permit_toDoList,
                                    label : inputs.App_permit_toDoList
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            <Select
                                name="App_permit_Doing"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_Doing", value : event.value}})}
                                value={{
                                    value : inputs.App_permit_Doing,
                                    label : inputs.App_permit_Doing
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            <Select
                                name="App_permit_Done"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_Done", value : event.value}})}
                                value={{
                                    value : inputs.App_permit_Done,
                                    label : inputs.App_permit_Done
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                        </TableCell>
                        <TableCell align="center" style={{ width: "10%" }}>
                            <div className="users-table-buttons">
                                <Button type="button" size="small" variant="contained" onClick={handleSubmit} color="success">Create</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
        </form>
    )
}

export default AddApp;