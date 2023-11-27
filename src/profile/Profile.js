import './Profile.css';
import Navbar from '../components/Navbar';

function Profile() {
    return (
        <>
        <Navbar />
        <div className="profile-container">
            <span className="title">My Account</span>
            <div className="profile-form">
                <div>
                    <div>Username: User1</div>
                    <div>
                        Email: User1@gmail.com
                    </div>
                    <div>Password: ***********</div>
                </div>
                <div>
                    <div>User Groups: dev, admin</div>
                    <input className="profile-submit" type="submit" value="Edit"/>
                </div>
            </div>
        </div>
        </>
    );
}

export default Profile;