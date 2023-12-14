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

function TaskDetailModal({
    currentTaskId,
    app,
    isTaskDetailModalOpen,
    setIsTaskDetailModalOpen,
    setRefreshTasks
}) {
    const navigate = useNavigate();
    
    // store current task details
    const [task, setTask] = useState({});
    const [refreshTask, setRefreshTask] = useState(false);

    // store permit to edit plan
    const [isPM, setIsPM] = useState(false);

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

        // Check permits here

        // Check if current user is Project Manager to edit task_plan
        async function checkPM() {
            try {
                await Checkgroup("pm").then(function(result){
                    if (result.response && result.response.status == 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    if (result === true) {
                        setIsPM(true);
                    }
                })
            } catch (e) {
                setIsPM(false);
            }   
        }
        checkPM();

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
                        setTask(result.data.data[0]);
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
            setRefreshTask(false);
        }
    }, [currentTaskId, refreshTask]);

    // Get plans once on render
    useEffect(() => {
        if (isPM) {
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
    }, [isPM]) 

    // store inputs to be sent on update to DB with associated app acronym
    const [inputs, setInputs] = useState({
        'Task_id': task.Task_id,
        'Task_plan' : task.Task_plan,
        'New_notes' : ""
    });

    // store whether users want to edit/have edited current task details
    const [editing, setEditing] = useState(false);
    const [changedInputs, setChangedInputs] = useState(false);

    // Handle starting/ending of editing
    const toggleEditing = () => {
        if (!editing) {
            setInputs({
                'Task_id': task.Task_id,
                'Task_plan' : task.Task_plan,
                'New_notes' : ""
            });
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

    // Handle plan select changes
    const handlePlanChange = (event) => {
        if (event != null) {
            setInputs(values => ({...values, "Task_plan": event.value}));
        } else {
            // User cleared plan
            setInputs(values => ({...values, "Task_plan": ""}));
        }
    }

    // Check if user changed current inputs from original
    useEffect(() => {
        if (inputs.New_notes === "" && inputs.Task_plan === task.Task_plan) {
            setChangedInputs(false);
        } else {
            setChangedInputs(true);
        }
    }, [task, inputs])

    // Handle saving of task to DB
    const handleSubmit = async() => {

        // Check if Project Manager is assigning plan
        if (isPM && inputs.Task_plan != task.Task_plan && task.Task_state == "Open") {
            console.log("assigning plan");
            try {
                let result = await Axios.post(
                    'http://localhost:8000/assignTaskToPlan',
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
                    setRefreshTask(true);
                    setRefreshTasks(true);
                    handleCloseModal();
                }
            } catch (e) {
                try {
                    if (e.response.status === 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    
                    if (e.response.status === 403) {
                        setIsTaskDetailModalOpen(false);
                        setInputs({
                            'Task_id': task.Task_id,
                            'Task_plan' : task.Task_plan,
                            'New_notes' : ""
                        });
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

        // Else just add notes
        } else {
            console.log("adding notes");
            try {
                let result = await Axios.post(
                    'http://localhost:8000/addTaskNotes',
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
                    setRefreshTask(true);
                    setEditing(false);
                    setInputs({
                        'Task_id': task.Task_id,
                        'Task_plan' : task.Task_plan,
                        'New_notes' : ""
                    });
                }
            } catch (e) {
                try {
                    if (e.response.status === 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    
                    if (e.response.status === 403) {
                        setIsTaskDetailModalOpen(false);
                        setInputs({
                            'Task_id': task.Task_id,
                            'Task_plan' : task.Task_plan,
                            'New_notes' : ""
                        });
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
        setIsTaskDetailModalOpen(false);
        setInputs({
            'Task_id': task.Task_id,
            'Task_plan' : task.Task_plan,
            'New_notes' : ""
        });
        setEditing(false);
    }

    const actionButton = () => {
        // if task is in close state, do not display edit button
        if (task.Task_state != "Close") {
            // if user is editing render either 'cancel' or 'save' depending on whether inputs have been changed
            if (editing) {
                if (changedInputs) {
                    return (<Button onClick={handleSubmit} variant="contained" color="success">Save</Button>)
                } else {
                    return (<Button type="button" variant="outlined" onClick={toggleEditing}>Cancel</Button>)
                }
            // show 'edit' button for user to start editing
            } else {
                return (<Button type="button" variant="outlined" onClick={toggleEditing}>Edit</Button>)
            }
        }
    }

    return (
    <Modal open={isTaskDetailModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
            <Box style={{display:"flex", gap:"70px"}}>
                <Box style={{display:"flex", flexDirection:"column"}}>
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
                        Task State
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        {task.Task_state}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Task Plan
                    </Typography>
                    {isPM && editing && task.Task_state == "Open"
                        ? <Select
                        name="Task_plan"
                        options={planOptions}
                        className="basic-single"
                        isClearable
                        onChange={handlePlanChange}
                        value={{
                            value : inputs.Task_plan,
                            label : inputs.Task_plan
                        }}
                        placeholder="Plan"
                        classNames="group-select"
                        menuPortalTarget={document.body} 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 })}}
                        />
                        : <Typography variant="body1" mb={2}>
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
                    {editing &&
                        <TextField margin="normal" label="New Notes" multiline maxRows={3} name="New_notes" value={inputs.New_notes ? inputs.New_notes : ""} onChange={handleChange}/>
                    }
                </Box>
            </Box>
            <Box mt={2} style={{display:"flex", justifyContent:"space-between"}}>
                <Button onClick={handleCloseModal} color="primary">
                    Close
                </Button>
                {actionButton()}
            </Box>
        </Box>
    </Modal>
    )
}

export default TaskDetailModal;