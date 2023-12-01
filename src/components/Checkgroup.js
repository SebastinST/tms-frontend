import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

async function Checkgroup(groupname) {
    const navigate = useNavigate();
    try {
        let authorised = await Axios.post('http://localhost:8000/Checkgroup',
            {"groupname" : groupname},
            {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }}
        )
        return authorised.data.result;
    } catch (e) {
        if (e.response.status === 401) {
            navigate("/");
        }

        let error = e.response.data
        if (error) {
            // Show error message
            toast.error(error.message, {
                autoClose: false,
            });
        }
    } 
}

export default Checkgroup;