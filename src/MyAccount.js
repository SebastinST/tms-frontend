import * as React from "react"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import TextField from "@mui/material/TextField"
import Cookies from "js-cookie"
import { useState, useEffect } from "react"
import axios from "axios"
import Alert from "@mui/material/Alert"
import DispatchContext from "./DispatchContext"

const defaultTheme = createTheme()

export default function MyAccount() {
  const [defAccInfo, setDefAccInfo] = useState({
    username: "",
    email: "",
    group_list: ""
  })
  const [fieldDisabled, setFieldDisabled] = useState(true)
  const [editButton, setEditButton] = useState("Edit")
  const [errorMessage, setErrorMessage] = useState("")
  const [open, setOpen] = React.useState(false)
  const appDispatch = React.useContext(DispatchContext)
  //Authorization
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token")
    }
  }
  //get default account values
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("http://localhost:8080/controller/getUser/", config)
        //set password in response to empty
        response.data.data.password = ""
        setDefAccInfo(response.data.data)
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            appDispatch({ type: "messages", payload: { message: "You are not authorised", type: "error" } })
          }
        } else {
          appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
        }
      }
    }
    fetchData()
  }, [])
  const handleSubmit = async event => {
    event.preventDefault()
    if (fieldDisabled) {
      setFieldDisabled(false)
      setEditButton("Save")
    } else {
      const data = new FormData(event.currentTarget)
      const updateEmail = { email: data.get("email") }
      try {
        const res = await axios.put("http://localhost:8080/controller/updateUserEmail/", updateEmail, config)
        if (data.get("password") !== null && data.get("password") !== "") {
          const updatePassword = { password: data.get("password") }
          await axios.put("http://localhost:8080/controller/updateUserPassword/", updatePassword, config)
        }
        setFieldDisabled(true)
        setEditButton("Edit")
        //if password field is not empty, set it to empty
        setDefAccInfo({
          ...defAccInfo,
          password: ""
        })
        setOpen(false)
        setErrorMessage("")
        appDispatch({ type: "messages", payload: { message: "Account updated", type: "success" } })
      } catch (error) {
        setErrorMessage(error.response.data.errMessage)
        setOpen(true)
      }
    }
  }
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <main>
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Box sx={{ border: 1, align: "left", p: 1 }}>
              <Typography component="h1" variant="h5">
                Username: {defAccInfo.username}
              </Typography>
              <Typography component="h1" variant="h5">
                Groups: {defAccInfo.group_list}
              </Typography>
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={defAccInfo.email}
              onChange={e =>
                setDefAccInfo({
                  ...defAccInfo,
                  email: e.target.value
                })
              }
              disabled={fieldDisabled}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={defAccInfo.password}
              disabled={fieldDisabled}
              onChange={e =>
                setDefAccInfo({
                  ...defAccInfo,
                  password: e.target.value
                })
              }
            />
            {/*error message*/}
            {open && <Alert severity="error">{errorMessage}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              {editButton}
            </Button>
            <Grid container>
              <Grid item xs></Grid>
              <Grid item></Grid>
            </Grid>
          </Box>
        </Box>
      </main>
    </ThemeProvider>
  )
}
