// Internal
import './Tasks.css';
import Navbar from '../components/Navbar';
import Checkgroup from '../components/Checkgroup';
import TaskCreationModal from './TaskCreationModal';
import TaskDetailModal from './TaskDetailModal';
import TaskActionModal from './TaskActionModal';

// External
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";

function Tasks() {
    const navigate = useNavigate();
    const token = Cookies.get("jwt-token");
    const [isPM, setIsPM] = useState(false);
    const [refreshTasks, setRefreshTasks] = useState(false);
    const [tasks, setTasks] = useState({
        Open: [],
        ToDo: [],
        Doing: [],
        Done: [],
        Close: []
    });

    // State variable for app details
    // Default value is application object given from 'app list' or 'manage plans' pages
    const [app, setApp] = useState(useLocation().state);
    
    // State variables for modals
    const [isTaskCreationModalOpen, setIsTaskCreationModalOpen] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState("");
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
    const [isTaskActionModalOpen, setIsTaskActionModalOpen] = useState(false);
    const [isPromoting, setIsPromoting] = useState(true);
    
    // States variables for permits
    const [permitCreate, setPermitCreate] = useState(false);
    const [permitOpen, setPermitOpen] = useState(false);
    const [permitToDo, setPermitToDo] = useState(false);
    const [permitDoing, setPermitDoing] = useState(false);
    const [permitDone, setPermitDone] = useState(false);
    
    // Get app details on render for permits
    useEffect(() => {
        async function getAppById() {
            try {
                let result = await Axios.get(`http://localhost:8000/getAppById/${app.App_Acronym}`,{
                    headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                }).catch(()=>{});
                
                // Check if app is valid, if not push to main page
                if (result.data) {
                    setApp(result.data.data)
                } else {
                    toast.error("Error: No application selected", {
                        autoClose: false,
                    });
                    navigate("/main");
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
        getAppById();
    },[])

    useEffect(() => {
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

        const checkPermits = async () => {
            setIsPM(await Checkgroup("pm").then(checkPermitResult));
            setPermitCreate(await Checkgroup(app.App_permit_create).then(checkPermitResult))
            setPermitOpen(await Checkgroup(app.App_permit_Open).then(checkPermitResult))
            setPermitToDo(await Checkgroup(app.App_permit_toDoList).then(checkPermitResult))
            setPermitDoing(await Checkgroup(app.App_permit_Doing).then(checkPermitResult))
            setPermitDone(await Checkgroup(app.App_permit_Done).then(checkPermitResult))
        }
        checkPermits();
    }, [token, app, refreshTasks])

    // getTasksByApp to display tasks details and refresh when changed, show latest on top
    useEffect(() => {
        async function getTasksByApp() {
            try {
                let result = await Axios.get(`http://localhost:8000/getTasksByApp/${app.App_Acronym}`,{
                    headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                }).catch(()=>{});
                if (result.data) {
                    let newTasks = {
                        Open: [],
                        ToDo: [],
                        Doing: [],
                        Done: [],
                        Close: []
                    }
                    result.data.data.forEach(task => {
                        const state = task.Task_state
                        if (newTasks[state]) {
                            newTasks[state].push({
                                Task_id: task.Task_id,
                                Task_name: task.Task_name,
                                Task_state: task.Task_state,
                                Plan_color: task.Plan_color
                            })
                        }
                    })
                    setTasks(newTasks)
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
        getTasksByApp();
        setRefreshTasks(false);
    }, [refreshTasks]);

    // Handling opening of task detail modal with corresponding task id
    const openTaskDetailModal = (Task_id) => {
        setCurrentTaskId(Task_id);
        setIsTaskDetailModalOpen(true);
    }
    
    // Handling opening of task detail modal with corresponding task id and whether promoting or not
    const openTaskActionModal = (isPromoting, Task_id) => {
        setCurrentTaskId(Task_id);
        setIsPromoting(isPromoting);
        setIsTaskActionModalOpen(true);
    }

    // Return appropriate state variable based on given state
    const checkPermitForState = state => {
        switch (state) {
            case "Open":
                return permitOpen
            case "ToDo":
                return permitToDo
            case "Doing":
                return permitDoing
            case "Done":
                return permitDone
            default:
                return false
        }
    }

    // show demote button for "doing" and "done" state if user got permit
    const demoteButton = (state, task) => {
        if ((state == "Doing" || state == "Done") && checkPermitForState(state)) {
            return (
                // Able to open modal with 'isPromoting' is false
                <IconButton onClick={() => openTaskActionModal(false,task.Task_id)}>
                    <ArrowBackIcon />
                </IconButton>
            )
        }
    };

    // show promote button for all state except "close" if user got permit
    const promoteButton = (state, task) => {
        if (checkPermitForState(state)) {
            return (
                // Able to open modal with 'isPromoting' is true
                <IconButton onClick={() => openTaskActionModal(true,task.Task_id)}>
                    <ArrowForwardIcon />
                </IconButton>
            )
        }
    };

    // Render column of tasks based on the tasks' state
    const taskLists = Object.keys(tasks).map((state, index, array) => (
        <Grid item key={index} xs={12 / array.length} style={{ height: "70vh", padding : "0"}}>
            <Paper elevation={3} style={{ padding: "16px", height: "100%", overflow: "auto", margin : "0px 10px"}} >
                <Typography variant="h6" gutterBottom align="center" style={{ borderBottom: "2px solid #ccc", padding: "8px", borderRadius: "4px"}}>
                    {state}
                </Typography>
                {tasks[state].length > 0 
                && (tasks[state].map(task => (
                    <Paper key={task.Task_id} elevation={1} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px",
                        marginBottom: "8px",
                        wordWrap: "break-word",
                        borderTop: `6px solid ${task.Plan_color}`,
                        backgroundColor: "#fff",
                    }}>
                        {demoteButton(state, task)}
                        <Box style={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center"
                        }}>
                            <Typography variant="body1" onClick={() => openTaskDetailModal(task.Task_id)} style={{cursor : "pointer"}}>
                                {task.Task_name}
                            </Typography>
                            <Typography variant="body2" style={{ fontSize: "0.8em", color: "gray" }}>
                                {task.Task_id}
                            </Typography>
                        </Box>
                        {promoteButton(state, task)}
                    </Paper>
                )))}
            </Paper>
        </Grid>
    ));

    return (
        <>
        <Navbar />
        <Grid container style={{ paddingBottom: "35px"}}>
            <Grid item xs={12}>
                <Typography variant="h6" align="center">
                    App {app && app.App_Acronym}
                </Typography>
            </Grid>
            {isPM && 
            <Grid item xs={2} style={{ paddingLeft: "20px"}}>
                <Button type="button" size="small" variant="contained" onClick={() => navigate('/plans', { state : app })}>
                    Manage Plans
                </Button>
            </Grid>
            }
            {permitCreate && 
            <Grid item xs={2} style={{ paddingLeft: "20px"}}>
                <Button type="button" size="small" variant="contained" onClick={() => setIsTaskCreationModalOpen(true)} color="success">
                    Create Task
                </Button>
            </Grid>
            }
        </Grid>
        <Grid container spacing={3} style={{overflowY: "auto", width: "100%", paddingLeft : "20px"}}>
            {taskLists}
        </Grid>
        <TaskCreationModal 
            app={app}
            isTaskCreationModalOpen={isTaskCreationModalOpen} 
            setIsTaskCreationModalOpen={setIsTaskCreationModalOpen}
            setRefreshTasks={setRefreshTasks}
        />
        <TaskDetailModal
            currentTaskId={currentTaskId}
            app={app}
            isTaskDetailModalOpen={isTaskDetailModalOpen}
            setIsTaskDetailModalOpen={setIsTaskDetailModalOpen}
            setRefreshTasks={setRefreshTasks}
        />
        <TaskActionModal
            currentTaskId={currentTaskId}
            isPromoting={isPromoting}
            app={app}
            isTaskActionModalOpen={isTaskActionModalOpen}
            setIsTaskActionModalOpen={setIsTaskActionModalOpen}
            setRefreshTasks={setRefreshTasks}
        />
        </>
    );
}

export default Tasks;