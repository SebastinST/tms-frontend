// External
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function AppHeader() {
    return(
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" style={{ width: "5%" }}>App*</TableCell>
                        <TableCell align="center" style={{ width: "5%" }}>Date</TableCell>
                        <TableCell align="center" style={{ width: "5%" }}>Rnum*</TableCell>
                        <TableCell align="center" style={{ width: "25%" }}>Description*</TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>Create</TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>Open</TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>ToDo</TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>Doing</TableCell>
                        <TableCell align="center" style={{ width: "8%" }}>Done</TableCell>
                        <TableCell align="center" style={{ width: "10%" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
            </Table>
        </TableContainer>
    )
}

export default AppHeader;