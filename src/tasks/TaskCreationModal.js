
// External
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";


function TaskCreationModal({
    app,
    isTaskCreationModalOpen,
    setIsTaskCreationModalOpen
}) {
    const navigate = useNavigate();
    
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

    const initialInputs = {
        "Task_app_Acronym": app.App_Acronym,
        "Task_name" : "",
        "Task_description" : ""
    }

    // store inputs to be sent on update to DB with associated app acronym
    const [inputs, setInputs] = useState(initialInputs);

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

                if (e.response.status === 403) {
                    handleCloseModal();
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
                handleCloseModal();
            }
        } catch (e) {
            try {
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

    const handleCloseModal = () => {
        setIsTaskCreationModalOpen(false);
        setInputs(initialInputs);
    }

    return (
        <Modal open={isTaskCreationModalOpen} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" align="center" mb={2}>
              Create Task for App {app.App_Acronym}
            </Typography>
            <TextField autoFocus margin="normal" label="Task Name*" name="Task_name" value={inputs.Task_name} onChange={handleChange} />
            <TextField margin="normal" label="Task Description" multiline rows={10} name="Task_description" value={inputs.Task_description} onChange={handleChange} style={{flex:1}}/>
            <Box mt={2} style={{display:"flex", justifyContent:"space-between"}}>
              <Button onClick={handleCloseModal} color="primary">
                Close
              </Button>
              <Button onClick={handleSubmit} variant="contained" color="success" style={{ marginLeft: "10px" }}>
                Create
              </Button>
            </Box>
          </Box>
        </Modal>
    )
}

export default TaskCreationModal;