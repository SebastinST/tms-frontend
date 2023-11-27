import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Cookies from "js-cookie";

const defaultTheme = createTheme();
export default function SignIn() {
  const navigate = useNavigate();

  //error message ui
  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

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
      const res = await axios.post(
        "http://localhost:8080/controller/login",
        user
      );

      //cookie
      Cookies.remove("token");
      Cookies.remove("username");
      Cookies.set("token", res.data.token, { expires: 7 });
      Cookies.set("username", res.data.username, { expires: 7 });

      //check is admin
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
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
