
// External
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

// Style for the modal
const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%", // Adjust the width as per your requirement
    height: "80%", // Adjust the height as needed
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    outline: "none",
    overflowY: "auto", // Add scroll if content is too long
    display: "flex",
    flexDirection: "column"
}

function TaskCreationModal({
    app,
    isTaskCreationModalOpen,
    setIsTaskCreationModalOpen,
    setRefreshTasks
}) {
    const navigate = useNavigate();

    // store inputs to be sent on update to DB with associated app acronym
    const [inputs, setInputs] = useState({
        "Task_app_Acronym": app.App_Acronym,
        "Task_name" : "",
        "Task_description" : ""
    });

    // Handle input field changes
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    // Handle saving of task to DB
    const handleSubmit = async() => {
        try {
            let result = await Axios.post(
                'http://localhost:8000/createTask',
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
                setRefreshTasks(true);
                setIsTaskCreationModalOpen(false);
                setInputs({});
            }
        } catch (e) {
            try {
                if (e.response.status === 401) {
                    Cookies.remove('jwt-token');
                    navigate("/");
                }
                
                if (e.response.status === 403) {
                    setIsTaskCreationModalOpen(false);
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

    return (
        <Modal open={isTaskCreationModalOpen} onClose={() => setIsTaskCreationModalOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" align="center" mb={2}>
              Create Task for App {app.App_Acronym}
            </Typography>
            <TextField autoFocus margin="normal" label="Task Name" fullWidth name="Task_name" value={inputs.Task_name} onChange={handleChange} />
            <TextField margin="normal" label="Task Description" fullWidth multiline rows={10} name="Task_description" value={inputs.Task_description} onChange={handleChange} style={{flex:1}}/>
            <Box mt={2} style={{display:"flex", justifyContent:"space-between"}}>
              <Button onClick={() => setIsTaskCreationModalOpen(false)} color="primary">
                Close
              </Button>
              <Button onClick={handleSubmit} color="primary" style={{ marginLeft: "10px" }}>
                Create
              </Button>
            </Box>
          </Box>
        </Modal>
    )
}

export default TaskCreationModal;