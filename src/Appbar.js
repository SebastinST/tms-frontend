import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Appbar(props) {
  const navigate = useNavigate();
  //Check Login
  useEffect(() => {
    const checkLogin = async () => {
      const token = { token: Cookies.get("token") }.token;
      const isLogin = await axios.get("http://localhost:8080/controller/checkLogin", { params: { token: token } });
      if (!isLogin.data) {
        navigate("/");
      }
    };
    checkLogin();
  }, []);

  //check Group
  useEffect(() => {
    const checkGroup = async (group) => {
      const username = { username: Cookies.get("username") }.username;
      const checkGroup = await axios.get("http://localhost:8080/controller/checkGroup", { params: { username: username, group: group } });
      if (!checkGroup.data) {
        navigate("/");
      }
    };
    if (props.group === "admin") {
      checkGroup("admin");
    }
  }, []);

  //home
  const homePage = () => {
    if (props.group === "admin") {
      navigate("/adminhome");
    } else {
      navigate("/home");
    }
  };

  //myaccount
  const myAccount = () => {
    navigate("/myaccount", { state: { group: props.group } });
  };

  //logout
  const logOut = () => {
    navigate("/");
  };

  return (
    <AppBar position="relative">
      <Toolbar>
        <Button variant="Contained" onClick={homePage}>
          <Typography variant="h3" color="inherit" noWrap>
            TMS
          </Typography>
        </Button>
        <Typography variant="h6" color="inherit" noWrap component="div" sx={{ flexGrow: 1 }}>
          {props.title}
        </Typography>
        <Button color="inherit" onClick={myAccount}>
          My Account
        </Button>
        <Button color="inherit" onClick={logOut}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
