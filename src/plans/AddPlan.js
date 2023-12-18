// External
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Random Color generator
const getRandomColor = () => {
    const letters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
  
    return color
};

function AddPlan(props) {
    const {
        app,
        setRefreshPlans,
        refreshPlans
    } = props;
    const navigate = useNavigate();
    
    // store inputs to be sent on update to DB
    const [inputs, setInputs] = useState({});

    // On render, generate random color for new plan
    useEffect(() => {
        let new_color = getRandomColor();
        setInputs(values => ({...values, "Plan_color": new_color}));

        // Add associated app acronym
        setInputs(values => ({...values, "Plan_app_Acronym": app.App_Acronym}));
    }, [refreshPlans])

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
                'http://localhost:8000/createPlan',
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
        <form>
            <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" style={{ width: "25%" }}>Plan Name*</TableCell>
                        <TableCell align="center" style={{ width: "25%" }}>Date</TableCell>
                        <TableCell align="center" style={{ width: "25%" }}>Color (Hex)</TableCell>
                        <TableCell align="center" style={{ width: "25%" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell align="center" style={{ width: "25%" }}>
                            <TextField name="Plan_MVP_name" size="small" label="Plan Name" value={inputs.Plan_MVP_name || ""} onChange={handleChange} required/>
                        </TableCell>
                        <TableCell align="center" style={{ width: "25%" }}>
                            <div>
                                <TextField name="Plan_startDate" size="small" label="Start" value={inputs.Plan_startDate || ""} onChange={handleChange}/> 
                                <TextField name="Plan_endDate" size="small" label="End" value={inputs.Plan_endDate || ""} onChange={handleChange}/>
                            </div>
                        </TableCell>
                        <TableCell align="center" style={{ width: "25%", backgroundColor : inputs.Plan_color}} >
                            {inputs.Plan_color}
                        </TableCell>
                        <TableCell align="center" style={{ width: "25%" }}>
                            <Button type="button" size="small" variant="contained" onClick={handleSubmit}color="success">
                                Save
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
        </form>
    )
}

export default AddPlan;