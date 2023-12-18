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
import StateContext from "./StateContext.js"
import Modal from "@mui/material/Modal"
import Select from "react-select"
import Checkgroup from "./Checkgroup"

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
  const [plansOptions, setPlansOptions] = useState([])
  const [openedByArrow, setOpenedByArrow] = useState(false)
  const [arrowDirection, setArrowDirection] = useState("none")
  const location = useLocation()
  const navigate = useNavigate()
  const appDispatch = React.useContext(DispatchContext)
  const appState = React.useContext(StateContext)

  //Permission states
  const [isUserPL, setIsUserPL] = useState(false)
  const [isUserPM, setIsUserPM] = useState(false)
  const [permitCreate, setPermitCreate] = useState(false)
  const [permitOpen, setPermitOpen] = useState(false)
  const [permitToDo, setPermitToDo] = useState(false)
  const [permitDoing, setPermitDoing] = useState(false)
  const [permitDone, setPermitDone] = useState(false)

  useEffect(() => {
    const checkUserGroup = async () => {
      //we need to retrieve the latest application permit from the database
      let res
      try {
        res = await axios.get("http://localhost:8080/controller/getApplication/" + location.state.application.App_Acronym, {
          headers: {
            Authorization: "Bearer " + Cookies.get("token")
          }
        })
      } catch (err) {
        if (err.response) {
          appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "info" } })
        } else {
          appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
        }
      }
      const isPL = await Checkgroup.Checkgroup("PL")
      const isPM = await Checkgroup.Checkgroup("PM")
      setPermitCreate(await Checkgroup.Checkgroup(res.data.data.App_permit_Create))
      setPermitOpen(await Checkgroup.Checkgroup(res.data.data.App_permit_Open))
      setPermitToDo(await Checkgroup.Checkgroup(res.data.data.App_permit_toDoList))
      setPermitDoing(await Checkgroup.Checkgroup(res.data.data.App_permit_Doing))
      setPermitDone(await Checkgroup.Checkgroup(res.data.data.App_permit_Done))
      setIsUserPL(isPL)
      setIsUserPM(isPM)
    }

    checkUserGroup()
    if (appState.isLogged === false) {
      navigate("/")
    }
  }, [location, appState.isLogged])

  useEffect(() => {
    return () => {
      //reset all the permit states
      setPermitCreate(false)
      setPermitOpen(false)
      setPermitToDo(false)
      setPermitDoing(false)
      setPermitDone(false)
      setIsUserPL(false)
      setIsUserPM(false)
    }
  }, [])

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
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "info" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/controller/getPlanByApp/${location.state.application.App_Acronym}`, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      const options = response.data.data.map(plan => ({ value: plan.Plan_MVP_name, label: plan.Plan_MVP_name }))
      setPlansOptions(options)
    } catch (error) {
      if (error.response) {
        //appDispatch({ type: "messages", payload: { message: error.response.data.errMessage, type: "error" } })
        //This returns no plans found, but it's not an error
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
      taskStates[state].push({
        id: task.Task_id,
        name: task.Task_name,
        Plan_color: task.Plan_color
      })
    })

    return taskStates
  }

  useEffect(() => {
    fetchData()
    fetchPlans()
  }, [location.state.application.App_Acronym, isUserPM])

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
    width: "95%",
    height: "95%",
    maxHeight: "90vh", // Limit the maximum height
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    outline: "none",
    overflowY: "auto"
  }

  const canDemoteTask = status => {
    return status === "Doing" || status === "Done"
  }

  const handleMoveTask = async (event, task, nextState, direction) => {
    event.stopPropagation()
    // Fetch the task details again if necessary
    try {
      const res = await axios.get(`http://localhost:8080/controller/getTask/${task.id}`, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      setSelectedTask({ ...res.data.data, nextState })
      setOpenedByArrow(true)
      setArrowDirection(direction) // Set the direction of the arrow clicked
      setOpenTaskDetailsModal(true)
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
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
        if (err.response.data.errMessage === "You are not authorised") {
          fetchData()
          //Close the modal
          setOpenTaskDetailsModal(false)
        }
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

    handleCloseCreateTaskModal()
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
    const [initialNotes, setInitialNotes] = useState("") // Add this state to store the initial notes
    const [updatedNotes, setUpdatedNotes] = useState("")
    const [initialPlan, setInitialPlan] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)

    useEffect(() => {
      if (selectedTask) {
        const currentNotes = selectedTask.Task_notes || ""
        setInitialNotes(currentNotes)
        const currentPlan = selectedTask.Task_plan ? { value: selectedTask.Task_plan, label: selectedTask.Task_plan } : null
        setSelectedPlan(currentPlan)
        setInitialPlan(currentPlan) // Store the initial plan when a task is selected
      }
    }, [selectedTask])

    const handlePlanChange = selectedOption => {
      setSelectedPlan(selectedOption)
    }

    const renderActionButton = () => {
      if (arrowDirection === "left") {
        return (
          <Button onClick={handlePromoteDemote} color="secondary" style={{ marginRight: "8px", marginTop: "16px" }}>
            Demote
          </Button>
        )
      } else if (arrowDirection === "right") {
        return (
          <Button onClick={handlePromoteDemote} color="secondary" style={{ marginRight: "8px", marginTop: "16px" }}>
            Promote
          </Button>
        )
      }
      return null
    }

    const handleEditSave = async () => {
      //check if updatenotes is empty, if it is, set it to null
      if (updatedNotes === "") {
        setUpdatedNotes(null)
      }
      if (isEditMode) {
        // Save the changes
        try {
          let res, res2
          // Prepare the data for saving including the plan if it's editable
          if (updatedNotes !== null && updatedNotes !== undefined) {
            res = await axios.put(
              `http://localhost:8080/controller/updateNotes/${selectedTask.Task_id}`,
              {
                Task_notes: updatedNotes
              },
              {
                headers: {
                  Authorization: "Bearer " + Cookies.get("token")
                }
              }
            )
          }

          if (selectedTask.Task_state === "Open" && selectedPlan?.value !== initialPlan?.value) {
            res2 = await axios.put(
              `http://localhost:8080/controller/assignTaskToPlan/${selectedTask.Task_id}`,
              {
                Plan_MVP_name: selectedPlan?.value || null,
                Plan_app_Acronym: location.state.application.App_Acronym
              },
              {
                headers: {
                  Authorization: "Bearer " + Cookies.get("token")
                }
              }
            )
          }

          if (res) {
            appDispatch({ type: "messages", payload: { message: res.data.message, type: "success" } })
          }
          if (res2 && !res) {
            appDispatch({ type: "messages", payload: { message: res2.data.message, type: "success" } })
          }
          //appDispatch({ type: "messages", payload: { message: res.data.message, type: "success" } })
          fetchData() // Refresh data
          //Close the modal
          setOpenTaskDetailsModal(false)
        } catch (err) {
          if (err.response) {
            appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
            if (err.response.data.errMessage === "You are not authorised") {
              fetchData()
              //Close the modal
              setOpenTaskDetailsModal(false)
            }
          } else {
            console.log(err)
            //appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
          }
        }
        setIsEditMode(!isEditMode)
      } else {
        setIsEditMode(true) // Enter edit mode
      }
    }

    const handlePromoteDemote = async () => {
      if (!selectedTask || !selectedTask.nextState) {
        console.error("Selected task or nextState is not defined.")
        return
      }
      if (updatedNotes === "") {
        setUpdatedNotes(null)
      }

      let url
      switch (arrowDirection) {
        case "right": // Promote
          url = `http://localhost:8080/controller/promoteTask/${selectedTask.Task_id}`
          break
        case "left": // Demote
          if (selectedTask.Task_state === "Done") {
            url = `http://localhost:8080/controller/rejectTask/${selectedTask.Task_id}`
          } else if (selectedTask.Task_state === "Doing") {
            url = `http://localhost:8080/controller/returnTask/${selectedTask.Task_id}`
          }
          break
        default:
          console.error("Invalid arrow direction for task movement.")
          return
      }

      if (!url) {
        console.error("No URL defined for task movement.")
        return
      }

      //if demoting, we want to check if the project lead reassigned a new task plan

      try {
        const res = await axios.put(
          url,
          { Task_notes: updatedNotes, Task_plan: selectedPlan?.value || null },
          {
            headers: {
              Authorization: "Bearer " + Cookies.get("token")
            }
          }
        )
        appDispatch({ type: "messages", payload: { message: res.data.message, type: "success" } })
        fetchData() // Refresh data
        setOpenTaskDetailsModal(false)
      } catch (err) {
        if (err.response) {
          appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
          if (err.response.data.errMessage === "You are not authorised") {
            fetchData()
            //Close the modal
            setOpenTaskDetailsModal(false)
          }
        } else {
          appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
        }
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
              {(isEditMode && selectedTask?.Task_state === "Open" && permitOpen && <Select options={plansOptions} onChange={handlePlanChange} />) ||
                // If demoting and task is in Done state, allow for selecting a plan
                (openedByArrow && arrowDirection === "left" && selectedTask?.Task_state === "Done" && <Select options={plansOptions} onChange={handlePlanChange} />) || <Typography>{selectedTask?.Task_plan || "N/A"}</Typography>}

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
              <Typography>{selectedTask?.Task_createDate.split("T")[0] || "N/A"}</Typography>
            </Grid>
            <Grid item xs={8} style={{ display: "flex", flexDirection: "column" }}>
              {/* Right side: Description and Notes */}
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                Description
              </Typography>
              <TextField
                variant="outlined"
                multiline
                disabled={true}
                style={{
                  overflowY: "auto"
                }}
                fullWidth
                rows={4}
                value={selectedTask?.Task_description || "No description provided."}
              />

              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "16px" }}>
                Notes
              </Typography>
              <TextField
                variant="outlined"
                multiline
                InputProps={{
                  readOnly: true
                }}
                style={{
                  overflowY: "auto"
                }}
                fullWidth
                rows={10}
                value={selectedTask?.Task_notes ?? ""}
              />
              <TextField
                label="Notes"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                onChange={e => setUpdatedNotes(e.target.value)}
                disabled={
                  // !isEditMode || opened by arrow
                  !isEditMode && !openedByArrow
                }
              />
            </Grid>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} style={{ width: "100%" }}>
              <Button
                onClick={() => {
                  setOpenTaskDetailsModal(false)
                  setOpenedByArrow(false)
                }}
                color="primary"
                style={{ marginTop: "16px" }}
              >
                Close
              </Button>
              <Box>
                {!openedByArrow && selectedTask && selectedTask.Task_state !== "Close" && (
                  <Button onClick={handleEditSave} color="primary" style={{ marginRight: "8px", marginTop: "16px" }}>
                    {isEditMode ? "Save" : "Edit"}
                  </Button>
                )}
                {selectedTask && selectedTask.nextState && renderActionButton()}
              </Box>
            </Box>
          </Grid>
        </Box>
      </Modal>
    )
  }

  const renderArrowBack = (status, task, index) => {
    if (canDemoteTask(status) && checkPermitForLane(status)) {
      return (
        <IconButton key={permitCreate} onClick={event => handleMoveTask(event, task, Object.keys(tasks)[index - 1], "left")}>
          <ArrowBackIcon />
        </IconButton>
      )
    }
    return null
  }

  const checkPermitForLane = lane => {
    switch (lane) {
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

  const renderArrowForward = (status, task, index, arrayLength) => {
    if (index < arrayLength - 1 && checkPermitForLane(status)) {
      return (
        <IconButton onClick={event => handleMoveTask(event, task, Object.keys(tasks)[index + 1], "right")}>
          <ArrowForwardIcon />
        </IconButton>
      )
    }
    return null
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="false">
        {/* Container for typography and buttons */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2}>
          {/* Buttons Container */}
          <Box>
            {isUserPM && (
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: 8 }}
                onClick={() => {
                  navigate("/PlanManagement", { state: { application: location.state.application } })
                }}
              >
                Manage Plans
              </Button>
            )}
            {isUserPL && (
              <Button variant="contained" color="primary" onClick={handleOpenCreateTaskModal}>
                Create Task
              </Button>
            )}
          </Box>
          {/* Typography aligned with the buttons */}
          <Typography variant="h4" sx={{ margin: "0 auto" }}>
            Kanban Board
          </Typography>
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
                        flexWrap: "wrap", // Enable wrapping
                        padding: "8px",
                        marginBottom: "8px",
                        wordWrap: "break-word",
                        borderTop: `6px solid ${task.Plan_color}`,
                        backgroundColor: "#fff"
                      }}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {renderArrowBack(status, task, index, array.length)}
                      {/* Task Name and ID */}
                      <Box
                        style={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          wordBreak: "break-all" // Break long words
                        }}
                      >
                        <Typography variant="body1" style={{ maxWidth: "100%" }}>
                          {task.name}
                        </Typography>
                        <Typography variant="body2" style={{ fontSize: "0.8em", color: "gray" }}>
                          {task.id}
                        </Typography>
                      </Box>
                      {renderArrowForward(status, task, index, array.length)}
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
