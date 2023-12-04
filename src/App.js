import Login from "./Login.js"
import Home from "./Home.js"
import { Routes, Route } from "react-router-dom"
import AdminHome from "./AdminHome.js"
import MyAccount from "./MyAccount.js"
import { useReducer } from "react"
import DispatchContext from "./DispatchContext.js"
import { BrowserRouter } from "react-router-dom"
import Appbar from "./Appbar.js"
import StateContext from "./StateContext.js"
import React from "react"
import Toast from "./Toast.js"
import CheckLogin from "./CheckLogin.js"

function App() {
  const initialState = {
    messages: [],
    isLogged: null,
    isAdmin: null
  }

  //Using a reducer, manage the navigation of any error response depending on the status code
  function reducer(state, action) {
    switch (action.type) {
      case "messages":
        return { ...state, messages: [...state.messages, action.payload] }
      case "isLogged":
        //modify the state only if the value is different from the previous one
        if (state.isLogged !== action.payload) {
          return { ...state, isLogged: action.payload }
        } else {
          return state
        }
      case "isAdmin":
        //modify the state only if the value is different from the previous one
        if (state.isAdmin !== action.payload) {
          return { ...state, isAdmin: action.payload }
        } else {
          return state
        }
      default:
        console.log(action)
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Toast messages={state.messages} />
          <Appbar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/home"
              element={
                <CheckLogin>
                  <Home />
                </CheckLogin>
              }
            />
            <Route
              path="/adminhome"
              element={
                <CheckLogin>
                  <AdminHome />
                </CheckLogin>
              }
            />
            <Route
              path="/myaccount"
              element={
                <CheckLogin>
                  <MyAccount />
                </CheckLogin>
              }
            />
            {/*@TODO: Add a catch all route.*/}
          </Routes>
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export default App
