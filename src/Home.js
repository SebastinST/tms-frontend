import * as React from "react"
import CssBaseline from "@mui/material/CssBaseline"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useEffect } from "react"

const defaultTheme = createTheme()

export default function Home() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6
          }}
        >
          <Container maxWidth="sm"></Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Typography variant="h1" align="center">
            [List of Apps]
          </Typography>
        </Container>
      </main>
    </ThemeProvider>
  )
}
