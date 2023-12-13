const renderRow = (app, index) => (
  <TableRow key={index}>
    <TableCell align="center" style={{ minWidth: "200px" }}>
      {app.App_Acronym}
    </TableCell>
    <TableCell align="center">
      {editRow === index ? (
        <Box>
          <TextField type="date" value={editedApplications[index]?.App_startDate || app.App_startDate} onChange={e => handleFieldChange(e, index, "App_startDate")} />
          <TextField type="date" value={editedApplications[index]?.App_endDate || app.App_endDate} onChange={e => handleFieldChange(e, index, "App_endDate")} />
        </Box>
      ) : (
        `${formatDate(app.App_startDate)} - ${formatDate(app.App_endDate)}`
      )}
    </TableCell>
    <TableCell align="center">{app.App_Rnumber}</TableCell>
    <TableCell align="center">{editRow === index ? <TextField value={editedApplications[index]?.App_Description || app.App_Description} onChange={e => handleFieldChange(e, index, "App_Description")} /> : <TextField value={app.App_Description} disabled={true} />}</TableCell>
    {["App_permit_create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map(state => (
      <TableCell key={state} align="center" style={{ minWidth: "200px" }}>
        <Select defaultValue={parsePermitValues(app[state])} isDisabled={editRow !== index} name={state} options={groupOptions} className="basic-multi-select" classNamePrefix="select" styles={customSelectStyles} onChange={selectedOptions => handleSelectChange(index, state, selectedOptions)} />
      </TableCell>
    ))}
    <TableCell align="center">
      {editRow === index ? (
        <Button variant="outlined" onClick={() => handleSave(index)}>
          Save
        </Button>
      ) : (
        <Button variant="outlined" onClick={() => handleEdit(index)}>
          Edit
        </Button>
      )}
      <Button variant="outlined" onClick={() => handleView(index)}>
        Go
      </Button>
    </TableCell>
  </TableRow>
)

// Render function for new application row
const renderNewApplicationRow = () => (
  <TableRow>
    <TableCell align="center">
      <TextField value={newApplication.App_Acronym} onChange={e => handleNewApplicationChange("App_Acronym", e.target.value)} />
    </TableCell>
    <TableCell align="center">
      <Box>
        <TextField type="date" value={newApplication.App_startDate} onChange={e => handleNewApplicationChange("App_startDate", e.target.value)} />
        <TextField type="date" value={newApplication.App_endDate} onChange={e => handleNewApplicationChange("App_endDate", e.target.value)} />
      </Box>
    </TableCell>
    <TableCell align="center">
      <TextField value={newApplication.App_Rnumber} onChange={e => handleNewApplicationChange("App_Rnumber", e.target.value)} />
    </TableCell>
    <TableCell align="center">
      <TextField value={newApplication.App_Description} onChange={e => handleNewApplicationChange("App_Description", e.target.value)} />
    </TableCell>
    {/* ... Select fields for permit values */}
    {["App_permit_create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map(state => (
      <TableCell key={state} align="center" style={{ minWidth: "200px" }}>
        <Select
          value={groupOptions.filter(option => newApplication[state]?.includes(option.value))}
          name={state}
          options={groupOptions}
          className="basic-multi-select"
          classNamePrefix="select"
          styles={customSelectStyles}
          onChange={event =>
            //combine the values into a comma separated string
            setNewApplication({ ...newApplication, [state]: event.value })
          }
        />
      </TableCell>
    ))}
    <TableCell align="center">
      <Button variant="outlined" onClick={handleCreateApplication}>
        Create
      </Button>
    </TableCell>
  </TableRow>
)