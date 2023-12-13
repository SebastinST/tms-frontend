// Internal
import './Main.css';
import Navbar from '../components/Navbar';
import AppHeader from './AppHeader';
import AddApp from './AddApp';
import EditApp from './EditApp';
import Checkgroup from '../components/Checkgroup';

// External
import { useState, useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

function Main() {
    const navigate = useNavigate();
    const [refreshApps, setRefreshApps] = useState(false);
    const [apps, setApps] = useState([]);
    const [isPL, setIsPL] = useState(false);
    const token = Cookies.get("jwt-token");

    // getAllApps to display app details and refresh when changed, show latest on top
    useEffect(() => {
        async function getAllApps() {
            try {
                let result = await Axios.get('http://localhost:8000/getAllApps',{
                    headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }
                }).catch(()=>{});
                if (result.data) {
                    setApps(result.data.data.reverse());
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
        getAllApps();
        setRefreshApps(false);
    }, [refreshApps]);

    // Render each app as separate table with details in the row
    const appRows = apps.map(app => {
        return (
            <EditApp
                key={app.App_Acronym}
                app={app}
                setRefreshApps={setRefreshApps}
                isPL={isPL}
            />        
        );
    });

    // Check if current user is Project Lead to show create or edit app options
    useEffect(() => {
        async function checkPL() {
            try {
                await Checkgroup("pl").then(function(result){
                    if (result.response && result.response.status == 401) {
                        Cookies.remove('jwt-token');
                        navigate("/");
                    }
                    if (result === true) {
                        setIsPL(true);
                    }
                })
            } catch (e) {
                setIsPL(false);
            }   
        }
        checkPL();
        setRefreshApps(false);
    }, [token])

    return (
        <>
        <Navbar />
        <h1>Application List</h1>
        <div className="main-ui">
            <AppHeader />
            {isPL && <AddApp setRefreshApps={setRefreshApps}/>}
            <div className="apps-container">
                {appRows}
            </div>  
        </div>
        </>
    );
}

export default Main;