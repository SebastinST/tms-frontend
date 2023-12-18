// Internal
import Navbar from '../components/Navbar';
import AddPlan from './AddPlan';
import EditPlan from './EditPlan';

// External
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";

function Plans() {
    const navigate = useNavigate();
    const [refreshPlans, setRefreshPlans] = useState(false);
    const [plans, setPlans] = useState([]);
    
    // Get app details from previous link here
    const app = useLocation().state;

    // getAllApps to display app details and refresh when changed, show latest on top
    useEffect(() => {
        // Check if app is valid, if not push to main page
        if (!app) {
            navigate("/main");
        }
        async function getPlansByApp() {
            try {
                let result = await Axios.get(`http://localhost:8000/getPlansByApp/${app.App_Acronym}`,{
                    headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                }).catch(()=>{});
                if (result.data) {
                    setPlans(result.data.data.reverse());
                }
            } catch (e) {
                try {
                    if (e.response.status === 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    let error = e.response.data
                    if (error) {
                        // Show error message
                        toast.error(error.message, {
                            autoClose: false,
                        });
                    }
                } catch (e) {
                    toast.error(e, {
                        autoClose: false,
                    });
                }
            }
        }
        getPlansByApp();
        setRefreshPlans(false);
    }, [refreshPlans]);

    // Render each plan as separate table with details in the row
    const planRows = plans.map(plan => {
        return (
            <EditPlan
                key={plan.Plan_MVP_name}
                plan={plan}
                setRefreshPlans={setRefreshPlans}
            />
        );
    });

    return (
        <>
        <Navbar />
        <Box sx={{width:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", marginBottom:"10px"}}>
            <Typography variant="h4" align="center">
                Plans for App {app && app.App_Acronym}
            </Typography>
            <Button className="back-button" type="button" size="small" variant="outlined" onClick={() => navigate(-1, { state : app })} style={{ marginLeft: 20, alignSelf:'flex-start'}}>Back</Button>
        </Box>
        <Box sx={{flex:1, display:"flex", flexDirection:"column", gap:"5px", overflow:"auto", width:"100%"}}>
            <AddPlan app={app} refreshPlans={refreshPlans} setRefreshPlans={setRefreshPlans}/>
            <Box sx={{flex:1, display:"flex", flexDirection:"column", gap:"5px"}}>
                {planRows}
            </Box>
        </Box>
        </>
    );
}

export default Plans;