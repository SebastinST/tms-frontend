import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Cookies from "js-cookie";
import * as React from "react";
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();
export default function SignIn() {
  const navigate = useNavigate();

  //error message ui
  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  //Authorization
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token"),
    },
  };

  //Check for when user is already logged in
  async function checkLogin() {
    try {
      const isLogin = await axios.get("http://localhost:8080/controller/checkLogin", config);
      if (isLogin.data) {
        const admin = await axios.post(
          "http://localhost:8080/controller/checkGroup",
          { group: "admin" },
          config
        );
        if (admin.data) {
          navigate("/adminhome");
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      setErrorMessage(error.response.data.errMessage);
      setOpen(true);
    }
  }
  //on load
  React.useEffect(() => {
    if (Cookies.get("token")) {
      //check with server
      checkLogin();
    }
  }, []);

  //submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const user = {
      username: data.get("username"),
      password: data.get("password"),
    };
    //try and catch error
    try {
      //post login
      const res = await axios.post("http://localhost:8080/controller/login", user);

      //cookie
      Cookies.remove("token");
      Cookies.remove("username");
      Cookies.set("token", res.data.token, { expires: 7 });
      //Cookies.set("username", res.data.username, { expires: 7 });

      //check is admin for when user is trying to log in
      const groups = res.data.group_list.split(",");
      function isAdmin(group) {
        return group.toUpperCase() === "ADMIN";
      }
      if (groups.some(isAdmin)) {
        navigate("/adminhome");
      } else {
        navigate("/home");
      }
    } catch (error) {
      setErrorMessage(error.response.data.errMessage);
      setOpen(true);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h3">
            TMS
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
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
              autoComplete="current-password"
            />
            {/*error message*/}
            {open && <Alert severity="error">{errorMessage}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Grid container>
              <Grid item xs></Grid>
              <Grid item></Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
