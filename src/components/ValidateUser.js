// Internal
import Checkgroup from '../components/Checkgroup';

// External
import Cookies from 'js-cookie';
import { Navigate, useNavigate } from "react-router-dom";

function ValidateUser({children, group}) {
    const navigate = useNavigate();
    const token = Cookies.get('jwt-token');

    // User not logged in
    if (!token) {
        return (<Navigate to="/" replace />);
    }

    // Check if token is valid
    
    // If group is defined, check user
    if (group) {
        Checkgroup(group).then(function(result) {
            if (!result) {
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