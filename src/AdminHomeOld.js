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
  const [users, setUsers] = useState({
    username: "",
    email: "",
    group_list: "",
    password: "",
    is_disabled: 0
  })
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

  async function fetchData() {
    const res = await axios.get("http://localhost:8080/controller/getUsers/", config)
    //set users to table default edit disabled
    setTable(
      res.data.data.map(user => {
        return { ...user, editDisabled: true, password: "" }
      })
    )
  }

  function getCreateValue(value) {
    return value.createValue
  }

  async function handleSubmit(e, row) {
    e.preventDefault()
    console.log(row)
    //strip the _button from the id
    const id = e.target.id.replace("_button", "")
    const disabled = table.find(row => row.username === id).editDisabled
    if (disabled) {
      //set edit disabled to false for the specific row
      setTable(
        table.map(row => {
          if (row.username === id) {
            row.editDisabled = false
          }
          return row
        })
      )
    } else if (!disabled) {
      //get the values for the row from the table state
      const email = table.find(row => row.username === id).email
      const password = table.find(row => row.username === id).password
      console.log(email)
      console.log(password)
      const body = {}
      if (email !== "" && email !== undefined) {
        body.email = email
      }
      if (password !== "" && password !== undefined) {
        body.password = password
      }
      try {
        const response = await axios.put("http://localhost:8080/controller/updateUser/" + row.username, body, config)
        toast.success(response.data.message)
        setTable(
          table.map(row => {
            if (row.username === id) {
              row.editDisabled = true
              row.password = ""
            }
            return row
          })
        )
      } catch (e) {
        toast.error(e.response.data.errMessage)
      }
    }
  }

  async function handleDisable(e, row) {
    e.preventDefault()
    const user = row.username
    try {
      const response = await axios.put("http://localhost:8080/controller/toggleUserStatus/" + user, {}, config)
      toast.success(response.data.message)
      setTable(
        table.map(row => {
          if (row.username === user) {
            row.is_disabled = row.is_disabled === 0 ? 1 : 0
          }
          return row
        })
      )
    } catch (e) {
      toast.error(e.response.data.errMessage)
    }
  }

  function createUser(e) {
    e.preventDefault()
    const body = {
      username: users.username,
      email: users.email,
      group_list: users.group_list,
      password: users.password
    }
    try {
      axios.post("http://localhost:8080/controller/register", body, config)
      toast.success("User created")
      setUsers({
        username: "",
        email: "",
        group_list: "",
        password: "",
        is_disabled: 0
      })
      fetchData()
    } catch (e) {
      toast.error(e.response.data.errMessage)
    }
  }

  function getGroupsValue(value) {
    return { value: value.group_name, label: value.group_name }
  }

  //Authorization
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token")
    }
  }
  const createGroup = async event => {
    event.preventDefault()
    try {
      const creGrp = { group_name: createValue.map(getCreateValue).join(",") }
      const res = await axios.post("http://localhost:8080/controller/createGroup/", creGrp, config)
      toast.success(res.data.message)
      setCreateValue([])
      getGroups()
    } catch (error) {
      toast.error(error.response.data.errMessage)
    }
  }

  //Run once on page load
  //use Axios to get all users

  useEffect(() => {
    fetchData()
  }, [])
  const getGroups = async () => {
    const groupsList = await axios.get("http://localhost:8080/controller/getGroups", config)
    setGroupOptions(groupsList.data.data.map(getGroupsValue))
  }
  //get groups
  useEffect(() => {
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
                    <TextField
                      onChange={event =>
                        setUsers({
                          ...users,
                          username: event.target.value
                        })
                      }
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoFocus
                      value={users.username}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      onChange={event =>
                        setUsers({
                          ...users,
                          email: event.target.value
                        })
                      }
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      autoFocus
                      value={users.email}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      onChange={event =>
                        setUsers({
                          ...users,
                          password: event.target.value
                        })
                      }
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      value={users.password}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Select
                      onChange={event =>
                        //combine the values into a comma separated string
                        setUsers({
                          ...users,
                          group_list: event.map(group => group.value).join(",")
                        })
                      }
                      isMulti
                      name="colors"
                      options={groupOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      //read from users.group_list and match exactly
                      value={groupOptions.filter(option => users.group_list.split(",").includes(option.value))}
                    />
                  </TableCell>
                  <TableCell align="center">Active</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" onClick={createUser}>
                      Create
                    </Button>
                  </TableCell>
                </TableRow>
                {table.map(row => (
                  <TableRow key={row.username} noValidate>
                    <TableCell align="center">{row.username}</TableCell>
                    <TableCell align="center">
                      <TextField
                        margin="normal"
                        onChange={e =>
                          setTable(
                            table.map(row => {
                              if (row.username === e.target.id.replace("_email", "")) {
                                row.email = e.target.value
                              }
                              return row
                            })
                          )
                        }
                        value={row.email}
                        fullWidth
                        id={row.username + "_email"}
                        name={row.username + "_email"}
                        disabled={row.editDisabled}
                      ></TextField>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        margin="normal"
                        value={row.password}
                        onChange={e =>
                          setTable(
                            table.map(row => {
                              if (row.username === e.target.id.replace("_password", "")) {
                                row.password = e.target.value
                              }
                              return row
                            })
                          )
                        }
                        fullWidth
                        id={row.username + "_password"}
                        type="password"
                        name={row.username + "_password"}
                        disabled={row.editDisabled}
                      ></TextField>
                    </TableCell>
                    <TableCell align="center">
                      <TextField margin="normal" defaultValue={row.group_list} fullWidth id={row.username + "_group_list"} name={row.username + "_group_list"} disabled={row.editDisabled}></TextField>
                    </TableCell>
                    <TableCell align="center">{row.is_disabled === 0 ? "Active" : "Disabled "}</TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" onClick={event => handleSubmit(event, row)} id={row.username + "_button"}>
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
          </Box>
        </Container>
      </main>
    </ThemeProvider>
  )
}
