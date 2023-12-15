// Internal
import Checkgroup from '../components/Checkgroup';

// External
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "react-select";
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

function TaskActionModal({
    currentTaskId,
    isPromoting,
    app,
    isTaskActionModalOpen,
    setIsTaskActionModalOpen,
    setRefreshTasks
}) {
    // Style for the modal
    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%", // Adjust the width as per your requirement
        height: "80vh", // Adjust the height as needed
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 6,
        outline: "none",
        display: "flex",
        flexDirection: "column"
    }
    const navigate = useNavigate();

    const initialInputs = {
        'Task_id': "",
        'Task_plan' : null,
        'New_notes' : ""
    }
    
    // store inputs to be sent on update to DB with associated app acronym
    const [inputs, setInputs] = useState(initialInputs);

    // store current task details
    const [task, setTask] = useState({});

    // store permit to edit plan
    const [permitDone, setPermitDone] = useState(false);

    // store all available plans
    const [planOptions, setPlanOptions] = useState([]);

    // get task details refresh when changed
    useEffect(() => {
        // Check if app is valid, if not push to main page
        if (!app) {
            toast.error("Error: No application selected", {
                autoClose: false,
            });
            navigate("/main");
        }

        // Check if permit result returns unauthorised access else return result
        function checkPermitResult(result) {
            if (result.response && result.response.status == 401) {
                Cookies.remove('jwt-token');
                navigate("/");
            }
            if (result === true) {
                return true;
            } else {
                return false;
            }
        } 

        // Check permit here if user can edit task_plan in open state
        const checkPermits = async () => {
            setPermitDone(await Checkgroup(app.App_permit_Done).then(checkPermitResult))
        }
        checkPermits();

        if (currentTaskId != "") {
            async function getTaskById() {
                try {
                    let result = await Axios.get(`http://localhost:8000/getTaskById/${currentTaskId}`,{
                        headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                    }).catch((e)=>{
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
                    if (result.data) {
                        let task = result.data.data[0];
                        setTask(task);
                        setInputs(values => ({...values,
                            'Task_id': task.Task_id,
                            'Task_plan' : task.Task_plan,
                        }))
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
            getTaskById();
        }
    }, [isTaskActionModalOpen]);

    // Get plans once on render if user can change task plan
    useEffect(() => {
        if (permitDone) {
            async function getPlansByApp() {
                try {
                    let result = await Axios.get(`http://localhost:8000/getPlansByApp/${app.App_Acronym}`,{
                        headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                    }).catch(()=>{});
                    if (result.data.data.length > 0) {
                        setPlanOptions(result.data.data.map(plan => (
                            { value: plan.Plan_MVP_name, label: plan.Plan_MVP_name }
                        )))
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
            getPlansByApp();
        }
    }, [permitDone]) 

    // Handle input field changes
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    }

    // Handle action on task
    const handleSubmit = async() => {
        // Check if task is and can be demoted
        if (!isPromoting) {
            if (permitDone && task.Task_state == "Done") {
                // Task is being rejected by PL
                console.log("Rejecting Task");
                try {
                    let result = await Axios.post(
                        'http://localhost:8000/rejectTask',
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
                        handleCloseModal();
                    }
                } catch (e) {
                    try {
                        if (e.response.status === 401) {
                            Cookies.remove('jwt-token');
                            navigate("/");
                        }
                        
                        if (e.response.status === 403) {
                            setIsTaskActionModalOpen(false);
                            setInputs(initialInputs);
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
            } else {
                // Task is being returned to toDo by Devs
                console.log("Returning Task");
                try {
                    let result = await Axios.post(
                        'http://localhost:8000/returnTask',
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
                        handleCloseModal();
                    }
                } catch (e) {
                    try {
                        if (e.response.status === 401) {
                            Cookies.remove('jwt-token');
                            navigate("/");
                        }
                        
                        if (e.response.status === 403) {
                            setIsTaskActionModalOpen(false);
                            setInputs(initialInputs);
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
        // Else promoting task
        } else {
            console.log("Promoting task");
            try {
                let result = await Axios.post(
                    'http://localhost:8000/promoteTask',
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
                    handleCloseModal();
                }
            } catch (e) {
                try {
                    if (e.response.status === 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    
                    if (e.response.status === 403) {
                        setIsTaskActionModalOpen(false);
                        setInputs(initialInputs);
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
    }

    const handleCloseModal = () => {
        setIsTaskActionModalOpen(false);
        setRefreshTasks(true);
        setInputs(initialInputs);
    }

    return (
    <Modal open={isTaskActionModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
            <Box style={{display:"flex", gap:"70px", flex:1}}>
                <Box style={{display:"flex", flexDirection:"column", gap:2}}>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        App Acronym
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        App {app.App_Acronym}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task Name
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        {task.Task_name}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task ID
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        {task.Task_id}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task State
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        {task.Task_state}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task Plan
                    </Typography>
                    {(task.Task_state == "Done" && !isPromoting)
                        ? <Select
                        name="Task_plan"
                        options={planOptions}
                        className="basic-single"
                        onChange={event => handleChange({target:{name :"Task_plan", value : event ? event.value : ""}})}
                        value={{
                            value : inputs.Task_plan,
                            label : inputs.Task_plan
                        }}
                        placeholder="Plan"
                        classNames="group-select"
                        menuPortalTarget={document.body} 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 })}}
                        />
                        : 
                        <Typography variant="body1" mb={2}>
                            {task.Task_plan ? task.Task_plan : ""}
                        </Typography>
                    }
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task Owner
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        {task.Task_owner}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task Creator
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        {task.Task_creator}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task Create Date
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        {task.Task_createDate && task.Task_createDate.split("T")[0]}
                    </Typography>
                </Box>
                <Box style={{flex:1, display:"flex", flexDirection:"column"}}>
                    <TextField margin="normal" label="Task Description" multiline rows={2} name="Task_description" value={task.Task_description ? task.Task_description : "No Description"} disabled/>
                    <TextField disabled margin="normal" label="Task Notes" multiline maxRows={8} name="Task_notes" value={task.Task_notes ? task.Task_notes : ""}/>
                    <TextField margin="normal" label="New Notes" multiline maxRows={3} name="New_notes" value={inputs.New_notes ? inputs.New_notes : ""} onChange={handleChange}/>
                </Box>
            </Box>
            <Box mt={2} style={{display:"flex", justifyContent:"space-between"}}>
                <Button onClick={handleCloseModal} color="primary">
                    Close
                </Button>
                <Button onClick={handleSubmit} variant="contained" 
                    color={isPromoting ? "success" : "error"}
                >
                    {isPromoting ? "Promote" : "Demote"}
                </Button>
            </Box>
        </Box>
    </Modal>
    )
}

export default TaskActionModal;