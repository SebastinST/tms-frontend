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

const defaultTheme = createTheme();

export default function MyAccount() {
  const { state } = useLocation();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
  };
  //Authorization
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token"),
    },
  };
  //get default account values
  const [defAccInfo, setDefAccInfo] = React.useState("");
  useEffect(() => {
    const defaultAccount = async () => {
      const userDetails = await axios.get(
        "http://localhost:8080/controller/getUser/" + Cookies.get("username"),
        config
      );
      setDefAccInfo(userDetails.data.data);
    };
    defaultAccount();
  }, []);
  console.log(defAccInfo.email);
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
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              defaultValue={defAccInfo.email}
              disabled={true}
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
              disabled={true}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Edit
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
