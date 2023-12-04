import Axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

async function Checkgroup(groupname) {
    
    try {
        let authorised = await Axios.post('http://localhost:8000/Checkgroup',
            {"groupname" : groupname},
            {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }}
        ).catch(()=>{})
        return authorised.data.result;
    } catch (e) {
        if (e.response.status === 401) {
            Cookies.remove('jwt-token');
        }

        let error = e.response.data
        if (error) {
            // Show error message
            toast.error(error.message, {
                autoClose: false,
            });
        }
        return false;
    } 
}

export default Checkgroup;