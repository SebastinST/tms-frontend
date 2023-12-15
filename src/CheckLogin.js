import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import DispatchContext from "./DispatchContext"
import Cookies from "js-cookie"
import { useEffect } from "react"
import axios from "axios"

export const CheckLogin = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = React.useState(Cookies.get("token"))
  const appDispatch = React.useContext(DispatchContext)

  const getLogin = async () => {
    if (token) {
      const config = {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      }
      try {
        const login = await axios.get("http://localhost:8080/controller/checkLogin", config)
        console.log("Proper token")
        appDispatch({ type: "isLogged", payload: login.data })
      } catch (err) {
        const errorMessage = err.response?.status === 401 ? "You are not authorised" : "Server is down"
        console.log("Improper token")
        appDispatch({ type: "isLogged", payload: false })
        appDispatch({ type: "messages", payload: { message: errorMessage, type: "error" } })
        Cookies.remove("token")
        navigate("/")
      }
    } else {
      console.log("No token logged out")
      appDispatch({ type: "isLogged", payload: false })
      navigate("/")
    }
  }

  useEffect(() => {
    const checkToken = async () => {
      setToken(Cookies.get("token"))
      await getLogin()
    }
    checkToken()
  }, [location])

  return <>{children}</>
}

export default CheckLogin
