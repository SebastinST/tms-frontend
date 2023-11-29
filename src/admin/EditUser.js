function EditUser(props) {
    const user = props.user;
    return(
        <form>
            <table className="users-table">
                <tr>
                    <td>
                        {user.username}
                    </td>
                    <td>
                        {user.email}
                    </td>
                    <td>
                        **********
                    </td>
                    <td>
                        {user.group_list}
                    </td>
                    <td>
                        {user.is_disabled ? 'Disabled' : 'Active'}
                    </td>
                    <td>
                        <div className="users-table-buttons">
                            <input type="submit" value="Edit"/>
                            <input type="submit" value="Disable"/>
                        </div>
                    </td>
                </tr>
            </table>
        </form>
    )
}

export default EditUser;