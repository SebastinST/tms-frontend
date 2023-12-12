import * as React from "react"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import Appbar from "./Appbar"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { TextField } from "@mui/material"
import CreatableSelect from "react-select/creatable"
import "react-toastify/dist/ReactToastify.css"
import Select from "react-select"
import DispatchContext from "./DispatchContext"
import StateContext from "./StateContext"
import { useNavigate } from "react-router-dom"

const defaultTheme = createTheme()
const components = {
  DropdownIndicator: null
}

const createOption = label => ({
  label,
  createValue: label
})

export default function AdminHome() {
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
  const appDispatch = React.useContext(DispatchContext)
  const appState = React.useContext(StateContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (appState.isLogged === false) {
      navigate("/")
    }
  }, [appState.isLogged])

  useEffect(() => {
    if (appState.isAdmin === false) {
      navigate("/home")
    }
  }, [appState.isAdmin])

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
    try {
      const res = await axios.get("http://localhost:8080/controller/getUsers/", config)
      //set users to table default edit disabled
      setTable(
        res.data.data.map(user => {
          return { ...user, editDisabled: true, password: "" }
        })
      )
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  function getCreateValue(value) {
    return value.createValue
  }

  async function handleSubmit(e, row) {
    e.preventDefault()
    config.headers.Authorization = "Bearer " + Cookies.get("token")
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
      const group_list = table.find(row => row.username === id).group_list
      const body = {}
      if (email !== "" && email !== undefined) {
        body.email = email
      }
      if (password !== "" && password !== undefined) {
        body.password = password
      }
      /*if (group_list !== "" && group_list !== undefined) {
        body.group = group_list
      }*/
      body.group = group_list
      try {
        const response = await axios.put("http://localhost:8080/controller/updateUser/" + row.username, body, config)
        appDispatch({ type: "messages", payload: { message: response.data.message, type: "success" } })
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
        if (e.response) {
          appDispatch({ type: "messages", payload: { message: e.response.data.errMessage, type: "error" } })
        } else {
          appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
        }
      }
    }
  }

  async function handleDisable(e, row) {
    e.preventDefault()
    config.headers.Authorization = "Bearer " + Cookies.get("token")
    const user = row.username
    try {
      const response = await axios.put("http://localhost:8080/controller/toggleUserStatus/" + user, {}, config)
      appDispatch({ type: "messages", payload: { message: response.data.message, type: "success" } })
      setTable(
        table.map(row => {
          if (row.username === user) {
            row.is_disabled = row.is_disabled === 0 ? 1 : 0
          }
          return row
        })
      )
    } catch (e) {
      appDispatch({ type: "isLogged", payload: false })
      if (e.response) {
        appDispatch({ type: "messages", payload: { message: e.response.data.errMessage, type: "error" } })
        if (e.response.status === 403) {
          navigate("/home")
        }
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  async function createUser(e) {
    //we need to reinit the config incase the token has changed
    config.headers.Authorization = "Bearer " + Cookies.get("token")
    e.preventDefault()
    const body = {
      username: users.username,
      email: users.email,
      group_list: users.group_list,
      password: users.password
    }
    try {
      const res = await axios.post("http://localhost:8080/controller/register", body, config)
      appDispatch({ type: "messages", payload: { message: res.data.message, type: "success" } })
      setUsers({
        username: "",
        email: "",
        group_list: "",
        password: "",
        is_disabled: 0
      })
      fetchData()
    } catch (error) {
      //appDispatch({ type: "isLogged", payload: false })
      if (error.response) {
        appDispatch({ type: "messages", payload: { message: error.response.data.errMessage, type: "error" } })
        if (error.response.status === 403) {
          navigate("/home")
        }
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
      //appDispatch({ type: err.response.status.toString() })
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
    config.headers.Authorization = "Bearer " + Cookies.get("token")
    try {
      const creGrp = { group_name: createValue.map(getCreateValue).join(",") }
      const res = await axios.post("http://localhost:8080/controller/createGroup/", creGrp, config)
      appDispatch({ type: "messages", payload: { message: res.data.message, type: "success" } })
      setCreateValue([])
      getGroups()
    } catch (error) {
      if (error.response) {
        appDispatch({ type: "messages", payload: { message: error.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  //Run once on page load
  //use Axios to get all users
  useEffect(() => {
    fetchData()
    getGroups()
  }, [])

  const getGroups = async () => {
    try {
      const res = await axios.get("http://localhost:8080/controller/getGroups", config)
      setGroupOptions(res.data.data.map(getGroupsValue))
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }

  function Child(props) {
    useEffect(() => {})
    const [item, setItem] = useState(props.item)

    const onChange = event => {
      let newValue = event.target.value
      setItem(prevState => {
        let newItem = { type: props.id, content: newValue }

        props.onChange(props.index, newItem)

        return newValue
      })
    }
    return <TextField value={item} onChange={onChange} margin="normal" fullWidth disabled={props.disabled} type={props.id}></TextField>
  }
  function CreateRow(props) {
    const [state, setState] = useState(users, [])

    useEffect(() => {})

    const onInputChange = (index, item) => {
      state[item.type] = item.content
    }

    return (
      <>
        <TableRow key={state.username} noValidate>
          <TableCell align="center">
            <Child id={"username"} item={state.username} onChange={onInputChange} disabled={false} />
          </TableCell>
          <TableCell align="center">
            <Child id={"email"} item={state.email} onChange={onInputChange} disabled={false} />
          </TableCell>
          <TableCell align="center">
            <Child id={"password"} item={state.password} onChange={onInputChange} disabled={false} />
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
      </>
    )
  }

  function Parent(props) {
    const [state, setState] = useState(table, [])

    useEffect(() => {})

    const onInputChange = (index, item) => {
      state[index][item.type] = item.content
    }

    return (
      <>
        {state.map((item, index) => (
          <TableRow key={item.username} noValidate>
            <TableCell align="center">{item.username}</TableCell>
            <TableCell align="center">
              <Child id={"email"} item={item.email} index={index} onChange={onInputChange} disabled={item.editDisabled} />
            </TableCell>
            <TableCell align="center">
              <Child id={"password"} item={item.password} index={index} onChange={onInputChange} disabled={item.editDisabled} />
            </TableCell>
            <TableCell align="center">
              <Select
                isDisabled={item.editDisabled}
                onChange={event =>
                  //combine the values into a comma separated string
                  setTable(
                    table.map(row => {
                      if (row.username === item.username) {
                        row.group_list = event.map(group => group.value).join(",")
                      }
                      return row
                    })
                  )
                }
                isMulti
                name="colors"
                options={groupOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                //read from users.group_list and match exactly
                value={groupOptions.filter(option => item.group_list.split(",").includes(option.value))}
              />
            </TableCell>
            <TableCell align="center">{item.is_disabled === 0 ? "Active" : "Disabled"}</TableCell>
            <TableCell align="center">
              <Button id={item.username + "_button"} variant="outlined" onClick={e => handleSubmit(e, item)}>
                {item.editDisabled ? "Edit" : "Save"}
              </Button>
              <Button id={item.username + "_button"} variant="outlined" onClick={e => handleDisable(e, item)}>
                {item.is_disabled === 0 ? "Disable" : "Enable"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </>
    )
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />

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
            <Grid container spacing={2}>
              <Grid item xs={8}></Grid>
              <Grid item xs={2}>
                <CreatableSelect placeholder={"Type group name here..."} components={components} inputValue={inputValue} isClearable isMulti menuIsOpen={false} onChange={newValue => setCreateValue(newValue)} onInputChange={newValue => setInputValue(newValue)} onKeyDown={handleKeyDown} value={createValue} />
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
                {appState.isAdmin && <CreateRow />}
                {appState.isAdmin && <Parent />}
              </TableBody>
            </Table>
          </Box>
        </Container>
      </main>
    </ThemeProvider>
  )
}
