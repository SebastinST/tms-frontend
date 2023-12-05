import Axios from 'axios';
import Cookies from 'js-cookie';

async function Checkgroup(groupname) {
    try {
        let result = await Axios.post('http://localhost:8000/Checkgroup',
            {"groupname" : groupname},
            {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }}
        ).catch((e)=>{
            return e;
        });
        if (result.data) {
            return result.data.result;
        } else {
            return result;
        }
    } catch (e) {
        return e;
    } 
}

export default Checkgroup;