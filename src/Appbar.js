import * as React from "react"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"

export default function Appbar(props) {
  const navigate = useNavigate()
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token")
    }
  }

  function OnLoad() {
    const [isLogged, setIsLogged] = useState(null)
    const [isGroup, setIsGroup] = useState(null)

    useEffect(() => {
      const getLogin = async () => {
        try {
          const login = await axios.get("http://localhost:8080/controller/checkLogin", config)
          setIsLogged(login.data)
        } catch (err) {
          if (err.response.status === 401) {
            navigate("/")
          }
        }
      }

      const getGroup = async group => {
        if (group !== undefined && group !== null && group !== "") {
          try {
            const res = await axios.post("http://localhost:8080/controller/checkGroup", { group: group }, config)
            setIsGroup(res.data)
          } catch (err) {
            if (err.response.status === 401) {
              navigate("/")
            }
          }
        }
      }

      getLogin().then(getGroup(props.group))
    }, [])

    useEffect(() => {
      if (isLogged === false) {
        console.log("not logged")
        navigate("/")
      }
    }, [isLogged])

    useEffect(() => {
      if (isGroup === false) {
        console.log("not admin")
        navigate("/home")
      }
    }, [isGroup])
  }

  OnLoad()

  //home
  const homePage = () => {
    if (props.group === "admin") {
      navigate("/adminhome")
    } else {
      navigate("/home")
    }
  }

  //myaccount
  const myAccount = () => {
    navigate("/myaccount", { state: { group: props.group } })
  }

  //logout
  const logOut = () => {
    axios.get("http://localhost:8080/controller/_logout", config)
    Cookies.remove("token")
    navigate("/")
  }

  return (
    <AppBar position="relative">
      <Toolbar>
        <Button variant="Contained" onClick={homePage}>
          <Typography variant="h3" color="inherit" noWrap>
            TMS
          </Typography>
        </Button>
        <Typography variant="h6" color="inherit" noWrap component="div" sx={{ flexGrow: 1 }}>
          {props.title}
        </Typography>
        <Button color="inherit" onClick={myAccount}>
          My Account
        </Button>
        <Button color="inherit" onClick={logOut}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}
