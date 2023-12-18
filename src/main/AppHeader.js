// External
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function AppHeader() {
    return(
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell align="center" sx={{width:"10%", padding:0}}>App*</TableCell>
                        <TableCell align="center" sx={{width:"15%", padding:0}}>Date</TableCell>
                        <TableCell align="center" sx={{width:"5%", padding:0}}>Rnum*</TableCell>
                        <TableCell align="center" sx={{width:"20%", padding:0}}>Description*</TableCell>
                        <TableCell align="center" sx={{width:"8%", padding:0}}>Create</TableCell>
                        <TableCell align="center" sx={{width:"8%", padding:0}}>Open</TableCell>
                        <TableCell align="center" sx={{width:"8%", padding:0}}>ToDo</TableCell>
                        <TableCell align="center" sx={{width:"8%", padding:0}}>Doing</TableCell>
                        <TableCell align="center" sx={{width:"8%", padding:0}}>Done</TableCell>
                        <TableCell align="center" sx={{width:"10%", padding:0}}>Actions</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default AppHeader;