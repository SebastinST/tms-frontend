import Cookies from 'js-cookie';
import { Navigate } from "react-router-dom";

function CatchAll() {

    // Check if user is logged in
    const token = Cookies.get('jwt-token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    const group_list = Cookies.get('group_list');

    if (group_list.includes('admin')) {
        return <Navigate to="/admin" replace />;
    } else {
        return <Navigate to="/user" replace />;
    }
    
}

export default CatchAll;