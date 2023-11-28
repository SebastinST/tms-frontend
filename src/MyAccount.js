import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Appbar from "./Appbar";
import { useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Alert from "@mui/material/Alert";

const defaultTheme = createTheme();

export default function MyAccount() {
  const [defAccInfo, setDefAccInfo] = useState({
    username: "",
    email: "",
    group_list: "",
    password: "",
  });
  const [fieldDisabled, setFieldDisabled] = useState(true);
  const [editButton, setEditButton] = useState("Edit");
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = React.useState(false);
  const { state } = useLocation();
  //Authorization
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token"),
    },
  };
  //get default account values
  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        "http://localhost:8080/controller/getUser/" + Cookies.get("username"),
        config
      );
      //set password in response to empty
      response.data.data.password = "";
      setDefAccInfo(response.data.data);
    }
    fetchData();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (fieldDisabled) {
      setFieldDisabled(false);
      setEditButton("Save");
    } else {
      const data = new FormData(event.currentTarget);
      const updateEmail = { email: data.get("email") };
      try {
        const res = await axios.put(
          "http://localhost:8080/controller/updateUserEmail/",
          updateEmail,
          config
        );
        if (data.get("password") !== null && data.get("password") !== "") {
          const updatePassword = { password: data.get("password") };

          await axios.put(
            "http://localhost:8080/controller/updateUserPassword/",
            updatePassword,
            config
          );
        }
        setFieldDisabled(true);
        setEditButton("Edit");
        //if password field is not empty, set it to empty
        setDefAccInfo({
          ...defAccInfo,
          password: "",
        });
        setOpen(false);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error.response.data.errMessage);
        setOpen(true);
      }
    }
  };
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Appbar title="My Account" group={state.group} />
      <main>
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h4">
            Username: {defAccInfo.username}
          </Typography>
          <Typography component="h1" variant="h4">
            Groups: {defAccInfo.group_list}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={defAccInfo.email}
              onChange={(e) =>
                setDefAccInfo({
                  ...defAccInfo,
                  email: e.target.value,
                })
              }
              disabled={fieldDisabled}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={defAccInfo.password}
              disabled={fieldDisabled}
              onChange={(e) =>
                setDefAccInfo({
                  ...defAccInfo,
                  password: e.target.value,
                })
              }
            />
            {/*error message*/}
            {open && <Alert severity="error">{errorMessage}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              {editButton}
            </Button>
            <Grid container>
              <Grid item xs></Grid>
              <Grid item></Grid>
            </Grid>
          </Box>
        </Box>
      </main>
    </ThemeProvider>
  );
}
