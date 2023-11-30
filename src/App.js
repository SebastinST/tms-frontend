import Login from "./Login.js"
import Home from "./Home.js"
import { Routes, Route } from "react-router-dom"
import AdminHome from "./AdminHome.js"
import MyAccount from "./MyAccount.js"
import { useReducer } from "react"
import DispatchContext from "./DispatchContext.js"
import { useNavigate } from "react-router-dom"

function App() {
  const navigate = useNavigate()
  //Using a reducer, manage the navigation of any error response depending on the status code
  function reducer(state, action) {
    switch (action.type) {
      case "401":
        navigate("/")
      case "403":
        navigate("/home")
      case "404":
        navigate("/home")
      case "500":
        console.log("500")
      default:
        console.log(action)
    }
  }

  const [state, dispatch] = useReducer(reducer, { error: null })

  return (
    <DispatchContext.Provider value={dispatch}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/myaccount" element={<MyAccount />} />
      </Routes>
    </DispatchContext.Provider>
  )
}

export default App
