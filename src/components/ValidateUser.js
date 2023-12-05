// Internal
import Checkgroup from '../components/Checkgroup';

// External
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

function ValidateUser({children, group}) {
    const [token, setToken] = useState(Cookies.get("jwt-token"));
    const navigate = useNavigate();
    
    const getValidity = () => {
        
        // check token if token is defined
        if (token) {
            // run checkgroup to check for validity and authorisation with specified group if any
            // Will return false for no group specified
            Checkgroup(group).then(function(result) {
                // if false and group specified
                // User is not authorised
                if (!result && group) {
                    Cookies.remove('jwt-token');
                    navigate("/");
                }
            })
        } else {
            Cookies.remove('jwt-token');
            navigate("/");
        }
    }

    useEffect(() => {
        setToken(Cookies.get("jwt-token"));
        getValidity();

    }, [{children}])
    
    return <>{children}</>;
}

export default ValidateUser;