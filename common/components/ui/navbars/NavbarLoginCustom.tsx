import React, { useState } from 'react';
import {
  AppBar,
  Button,
  ButtonGroup,
  DialogContent,
  Toolbar,
  Typography,
  useTheme,
  ThemeProvider,
} from '@mui/material';
import Box from '@mui/material/Box';
import { CustomDialog } from '../modales/CustomDialog';
import ThemeSwitcherButton from '../botones/ThemeSwitcherButton';
import { IconoTooltip } from '../botones/IconoTooltip';
import { alpha, createTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { VistaModalRegistro } from '../../../../modules/admin/usuarios/ui/ModalRegistro';
import LoginRegistroContainer from '../../../../modules/login/ui/LoginRegistroContainer';
import LoginRegistroCustom from '../../../../modules/login/ui/LoginRegistroCustom';
import RegistroContainer from '../../../../modules/login/ui/RegistroContainer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

export interface LoginRegistroCustom {

  accionCorrecta: () => void
  accionCancelar: () => void
}

export const NavbarLoginCustom = () => {
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [modalInicioSesion, setModalInicioSesion] = useState(false);

  const abrirModalAyuda = () => {
    setModalAyuda(true);
  };

  const cerrarModalAyuda = () => {
    setModalAyuda(false);
  };

  const abrirModalRegistro = () => {
    setModalRegistro(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistro(false);
  };

  const abrirModalInicioSesion = () => {
    setModalInicioSesion(true);
  };

  const cerrarModalInicioSesion = () => {
    setModalInicioSesion(false);
  };

  // Resto de las funciones...

  return (
    <ThemeProvider theme={theme}>
      <CustomDialog isOpen={modalAyuda} handleClose={cerrarModalAyuda} title={'Información'}>
        <DialogContent>
          <Typography variant={'body2'}>
            Propuesta de Frontend Base Login creado con NextJS y Typescript
          </Typography>
        </DialogContent>
      </CustomDialog>
      {/* Resto de los CustomDialogs */}
      <CustomDialog
        isOpen={modalRegistro}
        handleClose={cerrarModalRegistro}
        title={'Nuevo usuario'}
      >
        <RegistroContainer
          accionCorrecta={() => {
            cerrarModalRegistro().finally()
          }}
          accionCancelar={cerrarModalRegistro}
        />
      </CustomDialog>
      <CustomDialog
        isOpen={modalInicioSesion}
        handleClose={cerrarModalInicioSesion}
        title={'Iniciar sesion'}
      >
        <LoginRegistroCustom
          accionCorrecta={() => {
            cerrarModalRegistro().finally()
          }}
          accionCancelar={cerrarModalRegistro}
        />
      </CustomDialog>

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976D2', // Color azul
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', // Sombras sutiles
          color: 'white', // Cambiar el color del texto a blanco
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            padding: '0 20px', // Espaciado horizontal
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'white', marginRight: '1rem' }}>
              EVENTWAVE
            </Typography>
            {/* ... IconoTooltip y ThemeSwitcherButton */}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* ... IconoTooltip y ThemeSwitcherButton */}
          </Box>
          <ButtonGroup variant="text" color="inherit" aria-label="text button group">
            {/* 
        Los botones usarán el color "inherit" para heredar el color del tema,
        que en este caso es el color del AppBar.
      */}
            <Button onClick={abrirModalRegistro}>REGISTRARSE</Button>
            <Button onClick={abrirModalInicioSesion}>INICIAR SESION</Button>
          </ButtonGroup>
        </Toolbar>
      </AppBar>

    </ThemeProvider>
  );
};
