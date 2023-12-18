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
import Box from '@mui/material/Box';

function EditPlan(props) {
    const {
        plan,
        setRefreshPlans
    } = props;
    const navigate = useNavigate();
    
    // store inputs to be sent on update to DB
    const [inputs, setInputs] = useState({});

    // store whether users want to edit/have edited current plan details
    const [editing, setEditing] = useState(false);
    const [changedInputs, setChangedInputs] = useState(false);

    // Handle starting/ending of editing
    const toggleEditing = () => {
        // if starting to edit, set inputs as current plan details
        if (!editing) {
            setInputs(values => ({...values, 
                'Plan_MVP_name' : plan.Plan_MVP_name, 
                'Plan_startDate' : plan.Plan_startDate, 
                'Plan_endDate' : plan.Plan_endDate, 
                'Plan_app_Acronym' : plan.Plan_app_Acronym,
                'Plan_color' : plan.Plan_color
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
        if (plan.Plan_startDate === inputs.Plan_startDate && plan.Plan_endDate === inputs.Plan_endDate) {
            setChangedInputs(false);
        } else {
            setChangedInputs(true);
        }
    }, [plan, inputs])

    // Handle saving of changed current inputs from user to DB
    const handleSubmit = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/updatePlan',
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
                setRefreshPlans(true);
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
                    setRefreshPlans(true);
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
        <form key={plan.Plan_MVP_name}>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableBody>
                    <TableRow>
                        <TableCell align="center" style={{ width: "25%" }}>
                            {plan.Plan_MVP_name}
                        </TableCell>
                        <TableCell style={{ width: "25%" }}>
                            {
                            editing
                            ?   <Box>
                                <TextField name="Plan_startDate" size="small" label="Start" value={inputs.Plan_startDate || ""} onChange={handleChange} inputProps={{ maxLength: 10 }}/> <TextField name="Plan_endDate" size="small" label="End" value={inputs.Plan_endDate || ""} onChange={handleChange} inputProps={{ maxLength: 10 }}/>
                                </Box>
                            : <Box>
                                Start: {plan.Plan_startDate}<br/>
                                End: {plan.Plan_endDate}
                            </Box>
                            }
                        </TableCell>
                        <TableCell align="center" style={{ width: "25%", backgroundColor : plan.Plan_color}} >
                            {plan.Plan_color}
                        </TableCell>
                        <TableCell align="center" style={{ width: "25%" }}>
                            {editing
                            ?   changedInputs
                                ? <Button type="button" size="small" variant="contained" onClick={handleSubmit}color="success">Save</Button>
                                : <Button type="button" size="small" variant="outlined" onClick={toggleEditing}>Cancel</Button>
                            :   <Button type="button" size="small" variant="outlined" onClick={toggleEditing}>Edit</Button>
                            }
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
        </form>
    )
}

export default EditPlan;