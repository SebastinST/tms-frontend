import * as React from "react"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Link from "@mui/material/Link"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import Appbar from "./Appbar"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { TextField } from "@mui/material"
import { KeyboardEventHandler } from "react"
import CreatableSelect from "react-select/creatable"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Select from "react-select"

const defaultTheme = createTheme()
const components = {
  DropdownIndicator: null
}

const createOption = label => ({
  label,
  createValue: label
})

export default function AdminHome() {
  const navigate = useNavigate()

  const [inputValue, setInputValue] = React.useState("")
  const [createValue, setCreateValue] = React.useState([])
  const [users, setUsers] = useState([])
  const [table, setTable] = useState([])
  const [groupOptions, setGroupOptions] = React.useState([])

  const handleKeyDown = event => {
    if (!inputValue) return
    switch (event.key) {
      case "Enter":
      case "Tab":
        setCreateValue(prev => [...prev, createOption(inputValue)])
        setInputValue("")
        event.preventDefault()
    }
  }

  function getCreateValue(value) {
    return value.createValue
  }

  async function handleSubmit(e, row) {
    e.preventDefault()
    //strip the _button from the id
    const username = row.username
    if (row.editDisabled) {
      //set edit disabled to false for the specific row
      setTable(
        table.map(row => {
          if (row.username === username) {
            row.editDisabled = false
          }
          return row
        })
      )
    } else if (row.editDisabled === false) {
      //set edit disabled to true for the specific row
      setTable(
        table.map(row => {
          if (row.username === username) {
            row.editDisabled = true
          }
          return row
        })
      )
      try {
        //build the body dynamically based on if the row is empty or not
        const body = {}
        /*const response = await axios.put(`http://localhost:8080/controller/updateUser/${username}`, body, config)
        toast.success(response.data.message)
        //need to update the table
        setTable(
          table.map(row => {
            if (row.username === username) {
              row.editDisabled = true
            }
            return row
          })
        )*/
      } catch (error) {
        toast.error(error.response.data.errMessage)
      }
    }
  }

  //Authorization
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token")
    }
  }

  async function handleDisable(e, row) {
    e.preventDefault()
    const username = row.username
    try {
      const response = await axios.put(`http://localhost:8080/controller/toggleUserStatus/${username}`, {}, config)
      toast.success(response.data.message)
      //need to update the table
      setTable(
        table.map(row => {
          if (row.username === username) {
            row.is_disabled = row.is_disabled === 0 ? 1 : 0
          }
          return row
        })
      )
    } catch (error) {
      toast.error(error.response.data.errMessage)
    }
  }

  async function testFunction(event) {
    console.log("hi")
    event.preventDefault()
    //get data from a field called test
    const data = new FormData(event.currentTarget)
    const test = data.get("test_email")
    console.log(test)
  }

  function getGroupsValue(value) {
    return { value: value.group_name, label: value.group_name }
  }

  const createGroup = async event => {
    event.preventDefault()
    try {
      const creGrp = { group_name: createValue.map(getCreateValue).join(",") }
      const res = await axios.post("http://localhost:8080/controller/createGroup/", creGrp, config)
      toast.success(res.data.message)
      setCreateValue([])
    } catch (error) {
      toast.error(error.response.data.errMessage)
    }
  }

  //Run once on page load
  //use Axios to get all users
  useEffect(() => {
    async function fetchData() {
      const res = await axios.get("http://localhost:8080/controller/getUsers/", config)
      setUsers(res.data.data)
      //set users to table default edit disabled
      setTable(
        res.data.data.map(user => {
          return { ...user, editDisabled: true }
        })
      )
    }
    fetchData()
  }, [])

  //get groups
  useEffect(() => {
    const getGroups = async () => {
      const groupsList = await axios.get("http://localhost:8080/controller/getGroups", config)
      setGroupOptions(groupsList.data.data.map(getGroupsValue))
    }
    getGroups()
  }, [])

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Appbar title="Admin Home" group="admin" />
      <main>
        <Container maxWidth="lg">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Grid container spacing={2}>
              <Grid item xs={8}></Grid>
              <Grid item xs={2}>
                <CreatableSelect components={components} inputValue={inputValue} isClearable isMulti menuIsOpen={false} onChange={newValue => setCreateValue(newValue)} onInputChange={newValue => setInputValue(newValue)} onKeyDown={handleKeyDown} placeholder="" value={createValue} />
              </Grid>
              <Grid item xs={2}>
                <Button variant="outlined" onClick={createGroup}>
                  Create Group
                </Button>
              </Grid>
            </Grid>
            <form onSubmit={testFunction}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Username</TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">Password</TableCell>
                    <TableCell align="center">Group</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Management</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell align="center">
                      <TextField margin="normal" required fullWidth id="username" label="Username" name="username" autoFocus />
                    </TableCell>
                    <TableCell align="center">
                      <TextField margin="normal" required fullWidth id="email" label="Email" name="email" autoFocus />
                    </TableCell>
                    <TableCell align="center">
                      <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" />
                    </TableCell>
                    <TableCell align="center">
                      <Select isMulti name="colors" options={groupOptions} className="basic-multi-select" classNamePrefix="select" />
                    </TableCell>
                    <TableCell align="center">Active</TableCell>
                  </TableRow>
                  {table.map(row => (
                    <TableRow key={row.username} noValidate>
                      <TableCell align="center">{row.username}</TableCell>
                      <TableCell align="center">
                        <TextField margin="normal" defaultValue={row.email} fullWidth id={row.username + "_email"} name={row.username + "_email"} disabled={row.editDisabled}></TextField>
                      </TableCell>
                      <TableCell align="center">
                        <TextField margin="normal" fullWidth id={row.username + "_password"} name={row.username + "_password"} disabled={row.editDisabled}></TextField>
                      </TableCell>
                      <TableCell align="center">
                        <TextField margin="normal" defaultValue={row.group_list} fullWidth id={row.username + "_group_list"} name={row.username + "_group_list"} disabled={row.editDisabled}></TextField>
                      </TableCell>
                      <TableCell align="center">{row.is_disabled === 0 ? "Active" : "Disabled "}</TableCell>
                      <TableCell align="center">
                        <Button variant="outlined" type="submit" onClick={event => handleSubmit(event, row)} id={row.username + "_button"}>
                          {row.editDisabled === true ? "Edit" : "Save"}
                        </Button>
                        <Button variant="outlined" onClick={event => handleDisable(event, row)}>
                          {row.is_disabled === 0 ? "Disable" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </form>
          </Box>
        </Container>
      </main>
    </ThemeProvider>
  )
}
