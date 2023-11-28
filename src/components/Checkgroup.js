import Axios from 'axios';
import Cookies from 'js-cookie';

async function Checkgroup(groupname) {

    let authorised = await Axios.post('http://localhost:8000/Checkgroup',
        {"groupname" : groupname},
        {headers: { Authorization: `Bearer ${Cookies.get('jwt-token')}` }}
    )
    return authorised.data.result;
}

export default Checkgroup;