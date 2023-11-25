import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import CameraIcon from "@mui/icons-material/PhotoCamera";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { type } from "@testing-library/user-event/dist/type";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function AdminHome() {
  const navigate = useNavigate();
  //Check Login
  useEffect(() => {
    const checkLogin = async () => {
      const token = { token: Cookies.get("token") }.token;
      //const token = { token: "123" }
      console.log(token);
      const isLogin = await axios.get("http://localhost:8080/controller/checkLogin", { params: { token: token } }).then((res) => {
        //console.log(res)
        return res.data;
      });
      if (!isLogin) {
        console.log("navigate to login page");
      }
    };
    const checkGroup = async (group) => {
      const username = { username: Cookies.get("username") }.username;
      console.log(username);
      const isInGroup = await axios.get("http://localhost:8080/controller/checkGroup", { params: { username: username, group: group } }).then((res) => {
        //console.log(res)
        return res.data;
      });
      console.log(isInGroup);
    };
    checkGroup("admin");
    checkLogin();
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Button variant="Contained">
            <Typography variant="h3" color="inherit" noWrap>
              TMS
            </Typography>
          </Button>
          <Typography variant="h6" color="inherit" noWrap>
            Admin Home
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm"></Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md"></Container>
      </main>
    </ThemeProvider>
  );
}
