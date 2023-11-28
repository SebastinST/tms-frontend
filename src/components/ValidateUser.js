import Cookies from 'js-cookie';
import { Navigate, navigate } from "react-router-dom";

import Checkgroup from '../components/Checkgroup';

function ValidateUser({children, group}) {

    const token = Cookies.get('jwt-token');

    // User not logged in
    if (!token) {
        return (<Navigate to="/" replace />);
    }
    
    // FIX HERE FOR ADMIN PAGE
    // If group is defined, check user
    if (group) {
        Checkgroup(group)
        .then(function(result) {
            if (result) {
                return (<>{children}</>);
            } else {        
                // User is not authorised
                alert("rejecting");
                return (<Navigate to="/" replace />);
            }
        })
    }

    // Allow user to access
    return (
        <>{children}</>
    );
}

export default ValidateUser;