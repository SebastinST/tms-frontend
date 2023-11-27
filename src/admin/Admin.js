import './Admin.css';
import Navbar from '../components/Navbar';

function User() {
    return (
        <>
        <Navbar />
        <div className="admin-ui">
            <div className="add-group">
                <input type="text" placeholder='Group Name'/>
                <input type="submit" value="Create New Group"/>
            </div>
            <div className='users-container'>
                <table className="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Password</th>
                                <th>Group</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <input type="text" placeholder='Username'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='Email'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='Password'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='dev, admin'/>
                                </td>
                                <td>
                                    Active
                                </td>
                                <td>
                                    <input type="submit" value="Create New User"/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <input type="text" placeholder='User'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='test@test.com'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='**********'/>
                                </td>
                                <td>
                                    <input type="text" placeholder='dev, admin'/>
                                </td>
                                <td>
                                    Active
                                </td>
                                <td>
                                    <div className="users-buttons">
                                        <input type="submit" value="Save"/>
                                        <input type="submit" value="Disable"/>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    User2
                                </td>
                                <td>
                                    test@test.com
                                </td>
                                <td>
                                    **********
                                </td>
                                <td>
                                    dev, admin
                                </td>
                                <td>
                                    Active
                                </td>
                                <td>
                                    <div className="users-buttons">
                                        <input type="submit" value="Edit"/>
                                        <input type="submit" value="Disable"/>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    User3
                                </td>
                                <td>
                                    test@test.com
                                </td>
                                <td>
                                    **********
                                </td>
                                <td>
                                    dev, admin
                                </td>
                                <td>
                                    Disabled
                                </td>
                                <td>
                                    <div className="users-buttons">
                                        <input type="submit" value="Edit"/>
                                        <input type="submit" value="Disable"/>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    User4
                                </td>
                                <td>
                                    test@test.com
                                </td>
                                <td>
                                    **********
                                </td>
                                <td>
                                    dev, admin
                                </td>
                                <td>
                                    Active
                                </td>
                                <td>
                                    <div className="users-buttons">
                                        <input type="submit" value="Edit"/>
                                        <input type="submit" value="Disable"/>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                </table>
            </div>
        </div>
        </>
    );
}

export default User;
