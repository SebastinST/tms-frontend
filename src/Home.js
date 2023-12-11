import * as React from "react"
import CssBaseline from "@mui/material/CssBaseline"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import axios from "axios"
import Cookies from "js-cookie"
import { useEffect } from "react"
import DispatchContext from "./DispatchContext"

const defaultTheme = createTheme()

export default function Home() {
  const [applications, setApplications] = React.useState([])
  const appDispatch = React.useContext(DispatchContext)

  async function fetchData() {
    try {
      const res = await axios.get("http://localhost:8080/controller/getApplications/", {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      })
      setApplications(res.data)
    } catch (err) {
      if (err.response) {
        appDispatch({ type: "messages", payload: { message: err.response.data.errMessage, type: "error" } })
      } else {
        appDispatch({ type: "messages", payload: { message: "Server is down", type: "error" } })
      }
    }
  }
  useEffect(() => {
    console.log("hello world")
    fetchData()
  }, [])

  useEffect(() => {
    console.log(applications)
  }, [applications])

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <main>
        <Container maxWidth="lg">
          <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Grid container spacing={2}>
              <Grid item xs={10}></Grid>
              <Grid item xs={2}>
                {/*There should be a button to display a create app button here if you have project lead perms*/}
                <Button variant="outlined">Create app</Button>
              </Grid>
            </Grid>
            {/*This is where we will put our table that will display a list of applications in our database*/}
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">App Name</TableCell>
                  <TableCell align="center">App Date</TableCell>
                  <TableCell align="center">App Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody></TableBody>
            </Table>
          </Box>
        </Container>
      </main>
    </ThemeProvider>
  )
}
