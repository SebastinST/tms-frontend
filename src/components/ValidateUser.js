import Cookies from 'js-cookie';
import { Navigate, useNavigate } from "react-router-dom";

import Checkgroup from '../components/Checkgroup';

function ValidateUser({children, group}) {
    const navigate = useNavigate();
    const token = Cookies.get('jwt-token');

    // User not logged in
    if (!token) {
        return (<Navigate to="/" replace />);
    }
    
    // If group is defined, check user
    if (group) {
        Checkgroup(group).then(function(result) {
            if (!result) {
                // User is not authorised
                // FIX if got time
                navigate("/");
                // return (<Navigate to="/" replace />);
                return;
            }
        })
    }

    // Allow user to access
    return (<>{children}</>);
}

export default ValidateUser;