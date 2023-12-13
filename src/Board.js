import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import { Container, Grid, Paper, Typography, IconButton } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import TextField from "@mui/material/TextField"
import axios from "axios"
import Cookies from "js-cookie"
import DispatchContext from "./DispatchContext.js"
import Modal from "@mui/material/Modal"

const defaultTheme = createTheme()

export default function Board({ route, navigation }) {
  const initialTaskStates = {
    Open: [],
    ToDo: [],
    Doing: [],
    Done: [],
    Close: []
  }
  const [tasks, setTasks] = useState(initialTaskStates)
  const [newTask, setNewTask] = useState("")
  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false)
  const [openTaskDetailsModal, setOpenTaskDetailsModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newTaskDetails, setNewTaskDetails] = useState({
    Task_name: "",
    Task_description: ""
  })
  const [openedByArrow, setOpenedByArrow] = useState(false)
  const location = useLocation()
  const appDispatch = React.useContext(DispatchContext)

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/controller/getTasksByApp/" + location.state.application.App_Acronym, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      if (res.data && res.data.data) {
        const processedTasks = processData(res.data.data)
        setTasks(processedTasks)
      }
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  //Function to process the tasks retrieved from the database into the format required by the board
  const processData = data => {
    const taskStates = {
      Open: [],
      ToDo: [],
      Doing: [],
      Done: [],
      Close: []
    }

    data.forEach(task => {
      const state = task.Task_state
      if (taskStates[state]) {
        taskStates[state].push({
          id: task.Task_id,
          name: task.Task_name,
          Plan_color: task.Plan_color
        })
      }
    })

    return taskStates
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    console.log(tasks)
  }, [tasks])

  const handleOpenCreateTaskModal = () => setOpenCreateTaskModal(true)
  const handleCloseCreateTaskModal = () => setOpenCreateTaskModal(false)

  const handleInputChange = e => {
    setNewTaskDetails({
      ...newTaskDetails,
      [e.target.name]: e.target.value
    })
  }

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
    overflowY: "auto" // Add scroll if content is too long
  }

  const canDemoteTask = status => {
    return status === "Doing" || status === "Done"
  }

  const handleMoveTask = async (event, task, nextState) => {
    event.stopPropagation()
    setSelectedTask({ ...task, nextState }) // Include the nextState for promoting/demoting
    setOpenedByArrow(true) // Set to true when opened by arrow click
    setOpenTaskDetailsModal(true)

    // let endpoint = ""
    // if (currentState === "Done" && nextState === "Doing") {
    //   endpoint = "rejectTask"
    // } else if (currentState === "Doing" && nextState === "ToDo") {
    //   endpoint = "returnTask"
    // } else {
    //   endpoint = "promoteTask" // or another endpoint for promoting tasks
    // }

    // try {
    //   const res = await axios.put(
    //     `http://localhost:8080/controller/${endpoint}/${taskId}`,
    //     {}, // Add any required body data
    //     { headers: { Authorization: "Bearer " + Cookies.get("token") } }
    //   )
    //   console.log(res.data)
    //   fetchData() // Refetch data to reflect changes
    // } catch (err) {
    //   if (err.response) {
    //     appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
    //   } else {
    //     appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
    //   }
    // }
  }

  const handleCreateTask = async () => {
    const taskData = {
      ...newTaskDetails,
      Task_app_Acronym: location.state.application.App_Acronym // Auto-set from the app's acronym
    }

    try {
      const res = await axios.post("http://localhost:8080/controller/createTask", taskData, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      console.log(res.data)
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }

    setNewTaskDetails({
      Task_name: "",
      Task_description: ""
    })
    setNewTask("") // Clear the input field

    fetchData() // Refetch the data to update the board

    handleCloseModal() // Close the modal after task creation
  }

  const handleTaskClick = async taskId => {
    try {
      const res = await axios.get(`http://localhost:8080/controller/getTask/${taskId}`, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      setOpenedByArrow(false) // Set to false when opened by clicking on the task
      setSelectedTask(res.data.data)
      setOpenTaskDetailsModal(true)
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  const TaskDetailsModal = () => {
    const [isEditMode, setIsEditMode] = useState(false)
    const [updatedNotes, setUpdatedNotes] = useState("")

    useEffect(() => {
      if (selectedTask) {
        setUpdatedNotes(selectedTask.Task_notes || "")
      }
    }, [selectedTask])

    const handleEditSave = async () => {
      if (isEditMode) {
        // Implement save functionality here
        // For example, send the updated notes to the server
        // await axios.put(`your-api-endpoint/${selectedTask.Task_id}`, { updatedNotes }, { ...headers });
        console.log("Saved Notes:", updatedNotes)
      }
      setIsEditMode(!isEditMode)
    }

    const handlePromoteDemote = async () => {
      if (selectedTask && selectedTask.nextState) {
        console.log("Promoting/Demoting to:", selectedTask.nextState)
        // Add logic to promote/demote task
      }
    }

    return (
      <Modal open={openTaskDetailsModal} onClose={() => setOpenTaskDetailsModal(false)}>
        <Box sx={modalStyle}>
          <Grid container spacing={2} style={{ height: "100%" }}>
            <Grid item xs={4} style={{ display: "flex", flexDirection: "column" }}>
              {/* Left side: Shorter details */}
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                App Acronym
              </Typography>
              <Typography>{selectedTask?.Task_app_Acronym || "N/A"}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Task Name
              </Typography>
              <Typography>{selectedTask?.Task_name || "N/A"}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                ID
              </Typography>
              <Typography>{selectedTask?.Task_id || "N/A"}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Task State
              </Typography>
              <Typography>{selectedTask?.Task_state || "N/A"}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Task Plan
              </Typography>
              <Typography>{selectedTask?.Task_plan || "N/A"}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Task Owner
              </Typography>
              <Typography>{selectedTask?.Task_owner || "N/A"}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Task Creator
              </Typography>
              <Typography>{selectedTask?.Task_creator || "N/A"}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Created
              </Typography>
              <Typography>{selectedTask?.Task_createDate || "N/A"}</Typography>
            </Grid>
            <Grid item xs={8} style={{ display: "flex", flexDirection: "column" }}>
              {/* Right side: Description and Notes */}
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                Description
              </Typography>
              <Typography>{selectedTask?.Task_description || "No description provided."}</Typography>

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Notes
              </Typography>
              <Typography>{selectedTask?.Task_notes || "No notes added."}</Typography>

              {/* Additional notes field */}
              <TextField label="Notes" multiline rows={4} fullWidth margin="normal" onChange={e => setUpdatedNotes(e.target.value)} disabled={!isEditMode} />
            </Grid>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} style={{ width: "100%" }}>
              <Button onClick={() => setSelectedTask(null)} color="primary" style={{ marginTop: "16px" }}>
                Close
              </Button>
              <Box>
                {!openedByArrow && (
                  <Button onClick={handleEditSave} color="primary" style={{ marginRight: "8px", marginTop: "16px" }}>
                    {isEditMode ? "Save" : "Edit"}
                  </Button>
                )}
                {selectedTask && selectedTask.nextState && (
                  <Button onClick={handlePromoteDemote} color="secondary" style={{ marginRight: "8px", marginTop: "16px" }}>
                    Promote/Demote
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Box>
      </Modal>
    )
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="false">
        {/* Container for typography and buttons */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2}>
          {/* Buttons Container */}
          <Box>
            <Button variant="contained" color="primary" style={{ marginRight: 8 }}>
              Manage Plans
            </Button>
            <Button variant="contained" color="primary" onClick={handleOpenCreateTaskModal}>
              Create Task
            </Button>
          </Box>
          {/* Typography aligned with the buttons */}
          <Typography variant="h4">Kanban Board</Typography>
        </Box>
        <Modal open={openCreateTaskModal} onClose={handleCloseCreateTaskModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              Create New Task
            </Typography>
            <TextField autoFocus margin="normal" id="Task_name" label="Task Name" type="text" fullWidth name="Task_name" value={newTaskDetails.Task_name} onChange={handleInputChange} />
            <TextField margin="normal" id="Task_description" label="Task Description" type="text" fullWidth multiline rows={4} name="Task_description" value={newTaskDetails.Task_description} onChange={handleInputChange} />
            <Box mt={2}>
              <Button onClick={handleCloseCreateTaskModal} color="primary">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleCreateTask()
                }}
                color="primary"
                style={{ marginLeft: "10px" }}
              >
                Create
              </Button>
            </Box>
          </Box>
        </Modal>
        <Grid container spacing={3}>
          {Object.keys(tasks).map((status, index, array) => (
            <Grid item key={status} xs={12 / array.length} style={{ height: "80vh" }}>
              <Paper elevation={3} style={{ padding: "16px", height: "100%", overflow: "auto" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  align="center"
                  style={{
                    borderBottom: "2px solid #ccc",
                    padding: "8px",
                    borderRadius: "4px"
                  }}
                >
                  {status}
                </Typography>
                {tasks[status].length > 0 ? (
                  tasks[status].map(task => (
                    <Paper
                      key={task.id}
                      elevation={1}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px",
                        marginBottom: "8px",
                        wordWrap: "break-word",
                        borderLeft: `6px solid ${task.Plan_color}`,
                        backgroundColor: "#fff"
                      }}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {canDemoteTask(status) && (
                        <IconButton onClick={event => handleMoveTask(event, task, array[index - 1])}>
                          <ArrowBackIcon />
                        </IconButton>
                      )}
                      {/* Task Name and ID */}
                      <Box
                        style={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center"
                        }}
                      >
                        <Typography variant="body1">{task.name}</Typography>
                        <Typography variant="body2" style={{ fontSize: "0.8em", color: "gray" }}>
                          {task.id}
                        </Typography>
                      </Box>
                      {index < array.length - 1 && (
                        <IconButton onClick={event => handleMoveTask(event, task, array[index - 1])}>
                          <ArrowForwardIcon />
                        </IconButton>
                      )}
                    </Paper>
                  ))
                ) : (
                  <Typography style={{ textAlign: "center", marginTop: "20px" }}>No tasks in "{status}"</Typography>
                )}
                {status === "open" && (
                  <div style={{ marginTop: "16px" }}>
                    <TextField label="New Task" variant="outlined" fullWidth value={newTask} onChange={e => setNewTask(e.target.value)} />
                    <Button variant="contained" color="primary" style={{ marginTop: "8px" }} onClick={handleCreateTask}>
                      Create Task
                    </Button>
                  </div>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
        <TaskDetailsModal />
      </Container>
    </ThemeProvider>
  )
}
