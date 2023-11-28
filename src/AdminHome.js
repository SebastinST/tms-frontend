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
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Appbar from "./Appbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { KeyboardEventHandler } from "react";
import CreatableSelect from "react-select/creatable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultTheme = createTheme();
function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}
const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

const components = {
  DropdownIndicator: null,
};

const createOption = (label) => ({
  label,
  createValue: label,
});

export default function AdminHome() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = React.useState("");
  const [createValue, setCreateValue] = React.useState([]);

  const handleKeyDown = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setCreateValue((prev) => [...prev, createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
    }
  };
  function getCreateValue(value) {
    return value.createValue;
  }

  //Authorization
  const config = {
    headers: {
      Authorization: "Bearer " + Cookies.get("token"),
    },
  };
  const createGroup = async (event) => {
    event.preventDefault();
    try {
      const creGrp = { group_name: createValue.map(getCreateValue).join(",") };
      const res = await axios.post("http://localhost:8080/controller/createGroup/", creGrp, config);
      toast.success(res.data.message);
      setCreateValue([]);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Appbar title="Admin Home" group="admin" />
      <main>
        <Container maxWidth="lg">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Grid container spacing={2}>
              <Grid item xs={8}></Grid>
              <Grid item xs={2}>
                <CreatableSelect
                  components={components}
                  inputValue={inputValue}
                  isClearable
                  isMulti
                  menuIsOpen={false}
                  onChange={(newValue) => setCreateValue(newValue)}
                  onInputChange={(newValue) => setInputValue(newValue)}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  value={createValue}
                />
              </Grid>
              <Grid item xs={2}>
                <Button variant="outlined" onClick={createGroup}>
                  Create Group
                </Button>
              </Grid>
            </Grid>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Username</TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Password</TableCell>
                  <TableCell align="center">Group</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">{row.calories}</TableCell>
                    <TableCell align="center">{row.fat}</TableCell>
                    <TableCell align="center">{row.carbs}</TableCell>
                    <TableCell align="center">{row.protein}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Container>
      </main>
    </ThemeProvider>
  );
}
