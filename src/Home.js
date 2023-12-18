import React, { useState, useEffect, useContext } from "react"
import Select from "react-select"
import axios from "axios"
import Cookies from "js-cookie"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { CssBaseline, Container, Box, Grid, Button, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from "@mui/material"
import DispatchContext from "./DispatchContext"
import StateContext from "./StateContext"
import TextField from "@mui/material/TextField"
import { useNavigate, useLocation } from "react-router-dom"
import Checkgroup from "./Checkgroup"

const defaultTheme = createTheme()

export default function Home() {
  const [applications, setApplications] = useState([])
  const [editRow, setEditRow] = useState(null)
  const [groupOptions, setGroupOptions] = React.useState([])
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const [editedApplications, setEditedApplications] = useState({})
  const [newApplication, setNewApplication] = useState({
    App_Acronym: "",
    App_Description: "",
    App_startDate: "",
    App_endDate: "",
    App_Rnumber: "",
    App_permit_create: null,
    App_permit_Open: null,
    App_permit_toDoList: null,
    App_permit_Doing: null,
    App_permit_Done: null
  })
  const navigate = useNavigate()
  const location = useLocation()
  const [isUserPL, setIsUserPL] = useState(false)

  useEffect(() => {
    const checkUserGroup = async () => {
      const isPL = await Checkgroup.Checkgroup("PL")
      setIsUserPL(isPL)
    }

    if (appState.isLogged) {
      checkUserGroup()
    }
  }, [location, appState.isLogged])

  useEffect(() => {
    // This code will run only on updates, not the initial render
    if (appState.isLogged === false) {
      navigate("/")
    }
    if (appState.isLogged) {
      fetchData()
      getGroups()
    }
  }, [appState.isLogged])

  const customSelectStyles = {
    control: provided => ({
      ...provided,
      minWidth: 100, // Adjust the minimum width
      margin: "5px"
    }),
    menu: provided => ({
      ...provided,
      zIndex: 9999
    })
    // Additional style customizations can be added here
  }

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/controller/getApplications", {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      setApplications(res.data.data)
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  const getGroups = async () => {
    try {
      const res = await axios.get("http://localhost:8080/controller/getGroups", {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      setGroupOptions(res.data.data.map(getGroupsValue))
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  function getGroupsValue(value) {
    return { value: value.group_name, label: value.group_name }
  }

  const handleEdit = index => {
    setEditRow(editRow === index ? null : index)
  }

  const handleSelectChange = (index, state, selectedOptions) => {
    const selectedValuesString = selectedOptions
    const updatedApp = { ...editedApplications[index], [state]: selectedValuesString }
    setEditedApplications({ ...editedApplications, [index]: updatedApp })
  }

  const handleNewApplicationChange = (field, value) => {
    setNewApplication({ ...newApplication, [field]: value })
  }

  const handleCreateApplication = async () => {
    try {
      // Make POST request to create a new application
      // Adjust the API endpoint and request body as per your backend
      const res = await axios.post("http://localhost:8080/controller/createApplication", newApplication, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      // Fetch the updated list of applications
      fetchData()
      // Reset the new application form
      setNewApplication({
        App_Acronym: "",
        App_Description: "",
        App_startDate: "",
        App_endDate: "",
        App_Rnumber: "",
        App_permit_create: "",
        App_permit_Open: "",
        App_permit_toDoList: "",
        App_permit_Doing: "",
        App_permit_Done: ""
      })
      appDispatch({ type: "messages", payload: { message: res.data.message, type: "success" } })
    } catch (error) {
      appDispatch({ type: "messages", payload: { message: error.response.data.errMessage, type: "error" } })
    }
  }

  const handleSave = updatedApp => {
    try {
      axios.put("http://localhost:8080/controller/updateApplication/", updatedApp, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      const newApplications = applications.map(app => (app.App_Acronym === updatedApp.App_Acronym ? updatedApp : app))
      setApplications(newApplications)
      setEditRow(null)
      appDispatch({ type: "messages", payload: { message: "Application updated successfully", type: "success" } })
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  const formatDate = dateString => {
    //check if dateString is empty
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    return formattedDate
  }

  const parsePermitValues = permitString => {
    if (!permitString) return
    return permitString.split(",").map(value => ({
      value: value.trim(),
      label: value.trim()
    }))
  }

  const handleView = index => {
    navigate("/board", { state: { application: applications[index] } })
  }

  const EditableRow = ({ app, onSave, onCancel, groupOptions, customSelectStyles, handleFieldChange, handleSelectChange }) => {
    const [localApp, setLocalApp] = useState({ ...app })

    const handleLocalFieldChange = (e, field) => {
      setLocalApp({ ...localApp, [field]: e.target.value })
    }

    const handleLocalSelectChange = (selectedOptions, field) => {
      setLocalApp({ ...localApp, [field]: selectedOptions.value })
    }

    return (
      <TableRow key={app.App_Acronym}>
        {/* Render editable fields */}
        <TableCell align="center">
          {/* App_Acronym is the primary key and can't be edited */}
          {app.App_Acronym}
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <TextField type="date" value={localApp.App_startDate} onChange={e => handleLocalFieldChange(e, "App_startDate")} />
            <TextField type="date" value={localApp.App_endDate} onChange={e => handleLocalFieldChange(e, "App_endDate")} />
          </Box>
        </TableCell>
        <TableCell align="center">{localApp.App_Rnumber}</TableCell>
        <TableCell align="center">
          <TextField
            value={localApp.App_Description}
            onChange={e => handleLocalFieldChange(e, "App_Description")}
            fullWidth
            multiline
            rows={6} // Adjust the number of rows as needed
          />
        </TableCell>
        {/* Add other editable fields similar to above */}
        {["App_permit_create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map(state => (
          <TableCell key={state} align="center" style={{ minWidth: "100px" }}>
            <Select defaultValue={parsePermitValues(localApp[state])} name={state} options={groupOptions} className="basic-multi-select" classNamePrefix="select" styles={customSelectStyles} onChange={selectedOptions => handleLocalSelectChange(selectedOptions, state)} />
          </TableCell>
        ))}
        <TableCell align="center">
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Button variant="outlined" onClick={() => onSave(localApp)}>
              Save
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    )
  }

  const renderRow = (app, index) => {
    if (editRow === index) {
      return <EditableRow app={app} onSave={handleSave} onCancel={() => setEditRow(null)} groupOptions={groupOptions} customSelectStyles={customSelectStyles} />
    }
    return (
      <TableRow key={app.App_Acronym}>
        <TableCell align="center">{app.App_Acronym}</TableCell>
        {/* Render other non-editable fields */}
        {/* ... */}
        <TableCell align="center">
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <TextField
              type="date"
              value={app.App_startDate}
              sx={{ width: "150px" }} // Standard width for date fields
              disabled
            />
            <TextField
              type="date"
              value={app.App_endDate}
              sx={{ width: "150px" }} // Standard width for date fields
              disabled
            />
          </Box>
        </TableCell>
        <TableCell align="center" sx={{ width: "50px" }}>
          {app.App_Rnumber}
        </TableCell>

        <TableCell align="center">
          <TextField
            value={app.App_Description}
            fullWidth
            multiline
            disabled
            rows={6} // Adjust the number of rows as needed
            sx={{ minWidth: "200px" }}
          />
        </TableCell>
        {["App_permit_create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map(state => (
          <TableCell key={state} align="center" style={{ minWidth: "100px" }}>
            <Select defaultValue={parsePermitValues(app[state])} name={state} isDisabled={true} options={groupOptions} className="basic-multi-select" classNamePrefix="select" styles={customSelectStyles} onChange={selectedOptions => handleSelectChange(index, state, selectedOptions)} />
          </TableCell>
        ))}
        {/* Add other non-editable fields similar to above */}
        {/* ... */}
        <TableCell align="center">
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isUserPL && (
              <Button variant="outlined" onClick={() => handleEdit(index)}>
                Edit
              </Button>
            )}
            <Button variant="outlined" onClick={() => handleView(index)}>
              Go
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    )
  }

  // Render function for new application row
  const renderNewApplicationRow = () => (
    <TableRow>
      <TableCell align="center">
        <TextField value={newApplication.App_Acronym} onChange={e => handleNewApplicationChange("App_Acronym", e.target.value)} />
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <TextField type="date" value={newApplication.App_startDate} onChange={e => handleNewApplicationChange("App_startDate", e.target.value)} />
          <TextField type="date" value={newApplication.App_endDate} onChange={e => handleNewApplicationChange("App_endDate", e.target.value)} />
        </Box>
      </TableCell>
      <TableCell align="center" sx={{ width: "50px" }}>
        <TextField value={newApplication.App_Rnumber} onChange={e => handleNewApplicationChange("App_Rnumber", e.target.value)} />
      </TableCell>
      <TableCell align="center">
        <TextField value={newApplication.App_Description} onChange={e => handleNewApplicationChange("App_Description", e.target.value)} />
      </TableCell>
      {/* ... Select fields for permit values */}
      {["App_permit_create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map(state => (
        <TableCell key={state} align="center" style={{ minWidth: "100px" }}>
          <Select
            value={groupOptions.filter(option => newApplication[state]?.includes(option.value))}
            name={state}
            options={groupOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            styles={customSelectStyles}
            onChange={event =>
              //combine the values into a comma separated string
              setNewApplication({ ...newApplication, [state]: event.value })
            }
          />
        </TableCell>
      ))}
      <TableCell align="center">
        <Button variant="outlined" onClick={handleCreateApplication}>
          Create
        </Button>
      </TableCell>
    </TableRow>
  )

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="false">
        <Box sx={{ marginTop: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <TableContainer
            component={Paper}
            sx={{
              marginTop: "16px",
              maxWidth: "100%",
              minHeight: "50vh", // Set the minimum height here
              overflowX: "auto",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "10px",
                height: "10px"
              },
              "&::-webkit-scrollbar-track": {
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
                borderRadius: "10px"
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "darkgrey",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#b30000"
                }
              }
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                {/* Table head rows */}
                <TableRow>
                  <TableCell align="center">App Name</TableCell>
                  <TableCell align="center">App Date</TableCell>
                  <TableCell align="center">App Rnumber</TableCell>
                  <TableCell align="center">App Description</TableCell>
                  <TableCell align="center">Create</TableCell>
                  <TableCell align="center">Open</TableCell>
                  <TableCell align="center">ToDo</TableCell>
                  <TableCell align="center">Doing</TableCell>
                  <TableCell align="center">Done</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Render the new application row */}
                {isUserPL && renderNewApplicationRow()}
                {/* Table body rows */}
                {applications.length > 0 ? (
                  applications.map((app, index) => renderRow(app, index))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
