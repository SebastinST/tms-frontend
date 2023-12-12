import React, { useState, useEffect, useContext } from "react"
import Select from "react-select"
import axios from "axios"
import Cookies from "js-cookie"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { CssBaseline, Container, Box, Grid, Button, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from "@mui/material"
import DispatchContext from "./DispatchContext"
import TextField from "@mui/material/TextField"
import { useNavigate } from "react-router-dom"

const defaultTheme = createTheme()

export default function Home() {
  const [applications, setApplications] = useState([])
  const appDispatch = useContext(DispatchContext)
  const [editRow, setEditRow] = useState(null)
  const [groupOptions, setGroupOptions] = React.useState([])
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

  useEffect(() => {
    fetchData()
    getGroups()
  }, [])

  const handleEdit = index => {
    setEditRow(editRow === index ? null : index)
    if (editRow !== index) {
      setEditedApplications({ ...editedApplications, [index]: applications[index] })
    }
  }

  const handleSelectChange = (index, state, selectedOptions) => {
    const selectedValuesString = selectedOptions.map(option => option.value).join(",")
    const updatedApp = { ...editedApplications[index], [state]: selectedValuesString }
    setEditedApplications({ ...editedApplications, [index]: updatedApp })
  }

  const handleFieldChange = (e, index, field) => {
    const updatedApp = { ...editedApplications[index], [field]: e.target.value }
    setEditedApplications({ ...editedApplications, [index]: updatedApp })
  }

  const handleNewApplicationChange = (field, value) => {
    setNewApplication({ ...newApplication, [field]: value })
  }

  const handleCreateApplication = async () => {
    try {
      // Make POST request to create a new application
      // Adjust the API endpoint and request body as per your backend
      await axios.post("http://localhost:8080/controller/createApplication", newApplication, {
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
    } catch (error) {
      appDispatch({ type: "messages", payload: { message: error.response.data.errMessage, type: "error" } })
    }
  }

  const handleSave = async index => {
    try {
      const updatedApp = editedApplications[index]
      await axios.put("http://localhost:8080/controller/updateApplication/", updatedApp, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      const newApplications = [...applications]
      newApplications[index] = updatedApp
      setApplications(newApplications)
      setEditRow(null)
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  const formatDate = dateString => {
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

  const renderRow = (app, index) => (
    <TableRow key={index}>
      <TableCell align="center" style={{ minWidth: "200px" }}>
        {app.App_Acronym}
      </TableCell>
      <TableCell align="center">
        {editRow === index ? (
          <Box>
            <TextField type="date" value={editedApplications[index]?.App_startDate || app.App_startDate} onChange={e => handleFieldChange(e, index, "App_startDate")} />
            <TextField type="date" value={editedApplications[index]?.App_endDate || app.App_endDate} onChange={e => handleFieldChange(e, index, "App_endDate")} />
          </Box>
        ) : (
          `${formatDate(app.App_startDate)} - ${formatDate(app.App_endDate)}`
        )}
      </TableCell>
      <TableCell align="center">{app.App_Rnumber}</TableCell>
      <TableCell align="center">{editRow === index ? <TextField value={editedApplications[index]?.App_Description || app.App_Description} onChange={e => handleFieldChange(e, index, "App_Description")} /> : <TextField value={app.App_Description} disabled={true} />}</TableCell>
      {["App_permit_create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map(state => (
        <TableCell key={state} align="center" style={{ minWidth: "200px" }}>
          <Select defaultValue={parsePermitValues(app[state])} isDisabled={editRow !== index} name={state} options={groupOptions} className="basic-multi-select" classNamePrefix="select" styles={customSelectStyles} onChange={selectedOptions => handleSelectChange(index, state, selectedOptions)} />
        </TableCell>
      ))}
      <TableCell align="center">
        {editRow === index ? (
          <Button variant="outlined" onClick={() => handleSave(index)}>
            Save
          </Button>
        ) : (
          <Button variant="outlined" onClick={() => handleEdit(index)}>
            Edit
          </Button>
        )}
        <Button variant="outlined" onClick={() => handleView(index)}>
          Go
        </Button>
      </TableCell>
    </TableRow>
  )

  // Render function for new application row
  const renderNewApplicationRow = () => (
    <TableRow>
      <TableCell align="center">
        <TextField value={newApplication.App_Acronym} onChange={e => handleNewApplicationChange("App_Acronym", e.target.value)} />
      </TableCell>
      <TableCell align="center">
        <Box>
          <TextField type="date" value={newApplication.App_startDate} onChange={e => handleNewApplicationChange("App_startDate", e.target.value)} />
          <TextField type="date" value={newApplication.App_endDate} onChange={e => handleNewApplicationChange("App_endDate", e.target.value)} />
        </Box>
      </TableCell>
      <TableCell align="center">
        <TextField value={newApplication.App_Rnumber} onChange={e => handleNewApplicationChange("App_Rnumber", e.target.value)} />
      </TableCell>
      <TableCell align="center">
        <TextField value={newApplication.App_Description} onChange={e => handleNewApplicationChange("App_Description", e.target.value)} />
      </TableCell>
      {/* ... Select fields for permit values */}
      {["App_permit_create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map(state => (
        <TableCell key={state} align="center" style={{ minWidth: "200px" }}>
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
                {renderNewApplicationRow()}
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
