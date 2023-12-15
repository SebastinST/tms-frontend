import React, { useState, useEffect, useContext } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useLocation, useNavigate } from "react-router-dom"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { CssBaseline, Container, Box, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, TextField } from "@mui/material"
import DispatchContext from "./DispatchContext"

const defaultTheme = createTheme()

export default function PlanManagement() {
  const [plans, setPlans] = useState([])
  const [editRow, setEditRow] = useState(null)
  const [newPlan, setNewPlan] = useState({
    Plan_MVP_name: "",
    Plan_startDate: "",
    Plan_endDate: "",
    Plan_color: "#FFFFFF" // default color
  })

  const appDispatch = useContext(DispatchContext)
  const location = useLocation()
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/controller/getPlanByApp/" + location.state.application.App_Acronym, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      setPlans(res.data.data)
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "info" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }

    return color
  }

  useEffect(() => {
    //set new plan color
    setNewPlan({ ...newPlan, Plan_color: getRandomColor() })
    fetchData()
  }, [])

  const handleEdit = planId => {
    setEditRow(editRow === planId ? null : planId)
  }

  const handleSave = async (planId, index) => {
    console.log(location.state.application.App_Acronym, planId, plans[index].Plan_startDate, plans[index].Plan_endDate)
    try {
      await axios.put(
        "http://localhost:8080/controller/updatePlan/",
        {
          Plan_app_Acronym: location.state.application.App_Acronym,
          Plan_MVP_name: planId,
          Plan_startDate: plans[index].Plan_startDate,
          Plan_endDate: plans[index].Plan_endDate
        },
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("token")
          }
        }
      )
      setEditRow(null)
      appDispatch({ type: "messages", payload: { message: "Plan updated", type: "success" } })
      fetchData()
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  const handleFieldChange = (e, index, field) => {
    const newPlans = [...plans]
    newPlans[index][field] = e.target.value
    setPlans(newPlans)
  }

  const handleNewPlanFieldChange = (e, field) => {
    setNewPlan({ ...newPlan, [field]: e.target.value })
  }

  const handleCreateNewPlan = async () => {
    try {
      await axios.post(
        "http://localhost:8080/controller/createPlan",
        {
          ...newPlan,
          Plan_app_Acronym: location.state.application.App_Acronym
        },
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("token")
          }
        }
      )
      appDispatch({ type: "messages", payload: { message: "Plan created successfully", type: "success" } })
      //reset new plan
      setNewPlan({
        Plan_MVP_name: "",
        Plan_startDate: "",
        Plan_endDate: "",
        Plan_color: getRandomColor()
      })
      fetchData() // Refresh the list of plans
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  const handleBackToBoard = () => {
    navigate("/board", { state: { application: location.state.application } })
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ marginTop: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
          {/* Back to Kanban Board Button */}
          <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleBackToBoard}>
              Back to Kanban Board
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="plan table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Plan Name</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Color</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* New Plan Creation Row */}
                <TableRow>
                  <TableCell align="center">
                    <TextField value={newPlan.Plan_MVP_name} onChange={e => handleNewPlanFieldChange(e, "Plan_MVP_name")} />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <TextField type="date" value={newPlan.Plan_startDate} onChange={e => handleNewPlanFieldChange(e, "Plan_startDate")} />
                      <TextField type="date" value={newPlan.Plan_endDate} onChange={e => handleNewPlanFieldChange(e, "Plan_endDate")} />
                    </Box>
                  </TableCell>
                  <TableCell style={{ backgroundColor: newPlan.Plan_color }} align="center"></TableCell>
                  <TableCell align="center">
                    <Button onClick={handleCreateNewPlan}>Create</Button>
                  </TableCell>
                </TableRow>
                {Object.values(plans).map((plan, index) => (
                  <TableRow key={plan.Plan_MVP_name}>
                    <TableCell align="center">{plan.Plan_MVP_name}</TableCell>
                    <TableCell align="center">
                      {editRow === plan.Plan_MVP_name ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <TextField type="date" defaultValue={plan.Plan_startDate} onChange={e => handleFieldChange(e, index, "Plan_startDate")} />
                          <TextField type="date" defaultValue={plan.Plan_endDate} onChange={e => handleFieldChange(e, index, "Plan_endDate")} />
                        </Box>
                      ) : (
                        <span>{`${plan.Plan_startDate || "No start date"} - ${plan.Plan_endDate || "No end date"}`}</span>
                      )}
                    </TableCell>
                    <TableCell style={{ backgroundColor: plan.Plan_color }} align="center"></TableCell>
                    <TableCell align="center">{editRow === plan.Plan_MVP_name ? <Button onClick={() => handleSave(plan.Plan_MVP_name, index)}>Save</Button> : <Button onClick={() => handleEdit(plan.Plan_MVP_name)}>Edit</Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
