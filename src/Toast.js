import React, { useEffect } from "react"
import { ToastContainer, toast } from "react-toastify"
import StateContext from "./StateContext"

function Toast(props) {
  const appState = React.useContext(StateContext)

  useEffect(() => {
    if (props.messages === undefined) return
    //display message, then remove it from state
    props.messages.map(message => {
      toast(message.message, {
        type: message.type
      })
      appState.messages.shift()
    })
  }, [props.messages])

  return <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
}

export default Toast
