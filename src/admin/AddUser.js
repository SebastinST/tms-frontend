function AddUser() {
    return (
        <form className="add-user-form">
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
                </tbody>
            </table>
        </form>
    )
};

export default AddUser;