import Cookies from 'js-cookie';
import { Navigate } from "react-router-dom";

function CheckLogin({ children, adminCheck }) {

    // Check if user is logged in
    const token = Cookies.get('jwt-token');

    return token ? children : <Navigate to="/" replace />;
    
}

export default CheckLogin;