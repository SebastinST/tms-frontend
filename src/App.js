import Login from "./Login.js"
import Home from "./Home.js"
import Board from "./Board.js"
import { Routes, Route, BrowserRouter } from "react-router-dom"
import AdminHome from "./AdminHome.js"
import MyAccount from "./MyAccount.js"
import { useEffect, useReducer } from "react"
import DispatchContext from "./DispatchContext.js"
import Appbar from "./Appbar.js"
import StateContext from "./StateContext.js"
import React from "react"
import Toast from "./Toast.js"
import CheckLogin from "./CheckLogin.js"
import PlanManagement from "./PlanManagement.js"

function App() {
  const initialState = () => ({
    messages: [],
    isLogged: null,
    isAdmin: null,
  })

  //Using a reducer, manage the navigation of any error response depending on the status code
  function reducer(state, action) {
    switch (action.type) {
      case "messages":
        return { ...state, messages: [...state.messages, action.payload] }
      case "isLogged":
      case "isAdmin":
        return state[action.type] !== action.payload ? { ...state, [action.type]: action.payload } : state
      default:
        console.log(action)
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState())

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
            <Route
              path="/board"
              element={
                <CheckLogin>
                  <Board />
                </CheckLogin>
              }
            />
            <Route
              path="/PlanManagement"
              element={
                <CheckLogin>
                  <PlanManagement />
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
