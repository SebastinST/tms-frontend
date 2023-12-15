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

function EditApp(props) {
    const {
        app,
        setRefreshApps,
        isPL
    } = props;
    const navigate = useNavigate();
    
    // store inputs to be sent on update to DB
    const [inputs, setInputs] = useState({});

    // store all available group options and currently selected group options
    const [groupOptions, setGroupOptions] = useState([]);

    // store whether users want to edit/have edited current user details
    const [editing, setEditing] = useState(false);
    const [changedInputs, setChangedInputs] = useState(false);
    
    // If user is PL, get all groups available on load and if any new group is added
    useEffect(() => {
        if (isPL) {
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
        }
    }, [])

    // Handle starting/ending of editing
    const toggleEditing = () => {
        // if starting to edit, set inputs as current app details
        if (!editing) {
            setInputs(values => ({...values, 
                'App_Acronym' : app.App_Acronym, 
                'App_startDate' : app.App_startDate, 
                'App_endDate' : app.App_endDate, 
                'App_Rnumber' : app.App_Rnumber,
                'App_Description' : app.App_Description,
                'App_permit_create' : app.App_permit_create,
                'App_permit_Open' : app.App_permit_Open,
                'App_permit_toDoList' : app.App_permit_toDoList,
                'App_permit_Doing' : app.App_permit_Doing,
                'App_permit_Done' : app.App_permit_Done
            }));
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

    // Check if user changed current inputs from original
    useEffect(() => {
        if (app.App_startDate === inputs.App_startDate && app.App_endDate === inputs.App_endDate && app.App_Rnumber === inputs.App_Rnumber && app.App_Description === inputs.App_Description && app.App_permit_create === inputs.App_permit_create && app.App_permit_Open === inputs.App_permit_Open && app.App_permit_toDoList === inputs.App_permit_toDoList && app.App_permit_Doing === inputs.App_permit_Doing && app.App_permit_Done === inputs.App_permit_Done) {
            setChangedInputs(false);
        } else {
            setChangedInputs(true);
        }
    }, [app, inputs])

    // Check for appropriate action buttons to display
    function actionButtons() {
        if (isPL) {
            return (
                <div className="apps-table-buttons">
                    {editing
                    ?   changedInputs
                        ? <Button type="button" size="small" variant="contained" onClick={handleSubmit}color="success">Save</Button>
                        : <Button type="button" size="small" variant="outlined" onClick={toggleEditing}>Cancel</Button>
                    :   <Button type="button" size="small" variant="outlined" onClick={toggleEditing}>Edit</Button>
                    }
                    <Button type="button" size="small" variant="contained" onClick={() => navigate('/tasks', { state : app })} color="success">GO</Button>
                </div>
            );
        } else {
            return (
                <div className="apps-table-buttons">
                    <Button type="button" size="small" variant="contained" onClick={() => navigate('/tasks', { state : app })} color="success">GO</Button>
                </div>
            )
        }
    };

    // Handle saving of changed current inputs from user to DB
    const handleSubmit = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/updateApp',
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
                    setEditing(false);
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
        <form key={app.App_Acronym}>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableBody>
                    <TableRow>
                        <TableCell align="center" style={{ width: "5%" }}>
                            {app.App_Acronym}
                        </TableCell>
                        <TableCell align="center" style={{ width: "5%" }}>
                            {
                            editing
                            ?   <div>
                                <TextField name="App_startDate" size="small" label="Start" value={inputs.App_startDate || ""} onChange={handleChange}/> <TextField name="App_endDate" size="small" label="End" value={inputs.App_endDate || ""} onChange={handleChange}/>
                                </div>
                            : <div>
                            Start: {app.App_startDate}<br/>
                            End: {app.App_endDate}
                            </div>
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "5%" }}>
                            {
                            editing
                            ? <TextField name="App_Rnumber" size="small" label="Rnum" value={inputs.App_Rnumber || ""} onChange={handleChange}/>
                            : app.App_Rnumber
                            }
                        </TableCell>
                        <TableCell style={{ width: "25%" }}>
                            {
                            editing
                            ? <TextField minRows={4} name="App_Description" size="small" label="App Description" value={inputs.App_Description || ""} onChange={handleChange}/>
                            : app.App_Description
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            {editing
                            ? <Select
                                name="App_permit_create"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_create", value : event ? event.value : ""}})}
                                value={{
                                    value : inputs.App_permit_create,
                                    label : inputs.App_permit_create
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                isClearable
                                />
                            : app.App_permit_create
                                ? <button className="group-button">{app.App_permit_create}</button>
                                : ""
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            {editing
                            ? <Select
                                name="App_permit_Open"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_Open", value : event ? event.value : ""}})}
                                value={{
                                    value : inputs.App_permit_Open,
                                    label : inputs.App_permit_Open
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                isClearable
                                />
                            : app.App_permit_Open
                                ? <button className="group-button">{app.App_permit_Open}</button>
                                : ""
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            {editing
                            ? <Select
                                name="App_permit_toDoList"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_toDoList", value : event ? event.value : ""}})}
                                value={{
                                    value : inputs.App_permit_toDoList,
                                    label : inputs.App_permit_toDoList
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                isClearable
                                />
                            : app.App_permit_toDoList
                                ? <button className="group-button">{app.App_permit_toDoList}</button>
                                : ""
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            {editing
                            ? <Select
                                name="App_permit_Doing"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_Doing", value : event ? event.value : ""}})}
                                value={{
                                    value : inputs.App_permit_Doing,
                                    label : inputs.App_permit_Doing
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                isClearable
                                />
                            : app.App_permit_create
                                ? <button className="group-button">{app.App_permit_Doing}</button>
                                : ""
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>
                            {editing
                            ? <Select
                                name="App_permit_Done"
                                options={groupOptions}
                                className="basic-select"
                                onChange={event => handleChange({target:{name :"App_permit_Done", value : event ? event.value : ""}})}
                                value={{
                                    value : inputs.App_permit_Done,
                                    label : inputs.App_permit_Done
                                }}
                                placeholder="Select Group"
                                classNames="group-select"
                                menuPortalTarget={document.body} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                isClearable
                                />
                            : app.App_permit_Done
                                ? <button className="group-button">{app.App_permit_Done}</button>
                                : ""
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "10%" }}>
                            {actionButtons()}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
        </form>
    )
}

export default EditApp;