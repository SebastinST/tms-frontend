import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import { Container, Grid, Paper, Typography, IconButton } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import TextField from "@mui/material/TextField"

const defaultTheme = createTheme()

export default function Board() {
  const [tasks, setTasks] = useState({
    open: ["Task 1"],
    todo: ["Task 2", "Task 3"],
    doing: ["Task 4", "Task 5"],
    done: ["Task 6"],
    close: ["Task 7"]
  })
  const [newTask, setNewTask] = useState("")

  const canDemoteTask = status => status === "doing" || status === "done"

  const handleMoveTask = (task, currentState, nextState) => {
    const updatedTasks = { ...tasks }
    const taskIndex = updatedTasks[currentState].indexOf(task)
    updatedTasks[currentState].splice(taskIndex, 1)
    updatedTasks[nextState] = [...updatedTasks[nextState], task]
    setTasks(updatedTasks)
  }

  const handleCreateTask = () => {
    if (newTask.trim() !== "") {
      setTasks({ ...tasks, open: [...tasks.open, newTask] })
      setNewTask("")
    }
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Kanban Board
      </Typography>
      <Grid container spacing={3}>
        {Object.keys(tasks).map((status, index, array) => (
          <Grid item key={status} xs={12 / array.length}>
            <Paper elevation={3} style={{ padding: "16px", height: "100%", overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>
                {status}
              </Typography>
              {tasks[status].map(task => (
                <Paper
                  key={task}
                  elevation={1}
                  style={{
                    padding: "8px",
                    marginBottom: "8px",
                    wordWrap: "break-word"
                  }}
                >
                  {task}
                  <div style={{ marginTop: "8px", display: "flex" }}>
                    {canDemoteTask(status) && (
                      <IconButton onClick={() => handleMoveTask(task, status, array[index - 1])}>
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    {index < array.length - 1 && (
                      <IconButton onClick={() => handleMoveTask(task, status, array[index + 1])}>
                        <ArrowForwardIcon />
                      </IconButton>
                    )}
                  </div>
                </Paper>
              ))}
              {status === "open" && (
                <div style={{ marginTop: "16px" }}>
                  <TextField label="New Task" variant="outlined" fullWidth value={newTask} onChange={e => setNewTask(e.target.value)} />
                  <Button variant="contained" color="primary" style={{ marginTop: "8px" }} onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
