import * as React from "react"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import DispatchContext from "./DispatchContext"
import StateContext from "./StateContext"
import Checkgroup from "./Checkgroup"

export default function Appbar(props) {
  const appDispatch = React.useContext(DispatchContext)
  const appState = React.useContext(StateContext)
  const navigate = useNavigate()
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token")
    }
  }

  useEffect(() => {
    checkAdmin()
  })

  const checkAdmin = () => {
    Checkgroup.Checkgroup("admin").then(res => {
      if (res) {
        appDispatch({ type: "isAdmin", payload: true })
      } else {
        appDispatch({ type: "isAdmin", payload: false })
      }
    })
  }

  useEffect(() => {
    if (appState.isLogged === false) {
      navigate("/")
    }
  }, [appState.isLogged])

  //home
  const homePage = () => {
    navigate("/home")
  }

  //myaccount
  const myAccount = () => {
    navigate("/myaccount", { state: { group: props.group } })
  }

  //logout
  const logOut = () => {
    axios.get("http://localhost:8080/controller/_logout", config).catch(() => {})
    Cookies.remove("token")
    appDispatch({ type: "isLogged", payload: false })
    navigate("/")
  }

  return (
    appState.isLogged && (
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
          {appState.isAdmin ? (
            <Button color="inherit" onClick={() => navigate("/adminhome")}>
              Account Management
            </Button>
          ) : null}
          <Button color="inherit" onClick={myAccount}>
            My Account
          </Button>
          <Button color="inherit" onClick={logOut}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    )
  )
}
