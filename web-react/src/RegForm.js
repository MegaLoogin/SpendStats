import { useContext } from "react";
import { Context } from ".";
import { observer } from "mobx-react";
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { api } from "./service/api";
import { SelectInput } from "./Components";
import { useNavigate } from "react-router-dom";


const defaultTheme = createTheme();
const TYPES = [["admin", "Администратор"], ["buyer", "Баер"], ["aff", "Рекламодатель"]];

function RegForm() {
  const [ type, setType ] = React.useState("");
  const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username'), password = data.get('password'), tgId = data.get("tgId"), btag = data.get("btag");
        api.post("/registration", {username, password, tgId, type, btag}).then((v) => alert(v));
    };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Button sx={{backgroundColor: "white", margin: "5px", marginLeft: "10px"}} variant="outlined" color="inherit" onClick={() => navigate(`/`)}>Меню</Button>
      <Container component="main" maxWidth="xs" >
        {/* <CssBaseline /> */}
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Регистрация
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="new-password"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="tgId"
              label="Telegram ID"
              type="tgId"
              id="tgId"
              // autoComplete="current-password"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="btag"
              label="Buyer Tag (btag)"
              type="text"
              id="btag"
            />
            <SelectInput labelName="Тип аккаунта" value={type} setValue={setType} array={TYPES} callback={setType} required/>
            <Button
              type="submit"
              fullWidth
              variant="outlined"
              sx={{ mt: 3, mb: 2 }}
            >
              Регистрация
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default observer(RegForm);