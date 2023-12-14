// Internal
import './Tasks.css';
import Navbar from '../components/Navbar';
import Checkgroup from '../components/Checkgroup';
import TaskCreationModal from './TaskCreationModal';

// External
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";

function Tasks() {
    const navigate = useNavigate();
    const token = Cookies.get("jwt-token");
    const [isPM, setIsPM] = useState(false);
    const [isPL, setIsPL] = useState(false);
    const [refreshTasks, setRefreshTasks] = useState(false);
    const [tasks, setTasks] = useState({
        Open: [],
        ToDo: [],
        Doing: [],
        Done: [],
        Close: []
    });

    // Get app details from previous link here
    const app = useLocation().state;
    
    // State variables for modals
    const [isTaskCreationModalOpen, setIsTaskCreationModalOpen] = useState(false);
    
    useEffect(() => {
        // Check if app is valid, if not push to main page
        if (!app) {
            toast.error("Error: No application selected", {
                autoClose: false,
            });
            navigate("/main");
        }

        // Check if current user is Project Manager to show 'manage plans' button
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
        
        // Check if current user is Project Lead to show create task button
        async function checkPL() {
            try {
                await Checkgroup("pl").then(function(result){
                    if (result.response && result.response.status == 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    if (result === true) {
                        setIsPL(true);
                    }
                })
            } catch (e) {
                setIsPL(false);
            }   
        }
        
        checkPM();
        checkPL();
        setRefreshTasks(false);

    }, [token, app])

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

    const taskLists = Object.keys(tasks).map((status, index, array) => (
        <Grid item key={index} xs={12 / array.length} style={{ height: "70vh", padding : "0"}}>
            <Paper elevation={3} style={{ padding: "16px", height: "100%", overflow: "auto", margin : "0px 10px"}}>
                <Typography variant="h6" gutterBottom align="center" style={{ borderBottom: "2px solid #ccc", padding: "8px", borderRadius: "4px"}}>
                    {status}
                </Typography>
                {tasks[status].length > 0 
                && (tasks[status].map(task => (
                    <Paper key={task.Task_id} onClick={() => alert(task.Task_id)} elevation={1} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px",
                        marginBottom: "8px",
                        wordWrap: "break-word",
                        borderLeft: `6px solid ${task.Plan_color}`,
                        backgroundColor: "#fff"
                    }}>
                        <Box style={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center"
                        }}>
                            <Typography variant="body1">
                                {task.Task_name}
                            </Typography>
                            <Typography variant="body2" style={{ fontSize: "0.8em", color: "gray" }}>
                                {task.Task_id}
                            </Typography>
                        </Box>
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
            {isPL && 
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
        </>
    );
}

export default Tasks;