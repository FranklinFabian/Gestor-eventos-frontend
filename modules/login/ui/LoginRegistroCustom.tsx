import { Box, Button, Card, Divider, Tab, Tabs } from '@mui/material'
import { TabPanel } from './TabPanel'
import { FormInputText } from '../../../common/components/ui/form'
import ProgresoLineal from '../../../common/components/ui/progreso/ProgresoLineal'
import Typography from '@mui/material/Typography'
import { BotonCiudadania } from './BotonCiudadania'
import { Constantes } from '../../../config'
import { useAuth } from '../../../context/auth'
import { SyntheticEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoginType } from '../types/loginTypes'
import RegistroContainer from './RegistroContainer'
import { useRouter } from 'next/router'
import { useFullScreenLoading } from '../../../context/ui'
import { delay } from '../../../common/utils'

const LoginRegistroContainer = () => {
  const { ingresar, progresoLogin } = useAuth()

  const [value, setValue] = useState<number>(1)

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const { mostrarFullScreen, ocultarFullScreen } = useFullScreenLoading()

  const router = useRouter()

  const a11yProps = (index: number) => ({
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  })

  const { handleSubmit, control } = useForm<LoginType>({
    defaultValues: {
      usuario: 'ADMINISTRADOR-TECNICO',
      contrasena: '123',
    },
  })

  const iniciarSesion = async ({ usuario, contrasena }: LoginType) => {
    await ingresar({ usuario, contrasena })
  }

  return (

    <Box
      justifyContent={'center'}
      alignItems={'center'}
      sx={{ borderRadius: 12 }}
    >
      <Divider>
        
      </Divider>
      <TabPanel value={value} index={1}>
        <form onSubmit={handleSubmit(iniciarSesion)}>
          <FormInputText
            id={'usuario'}
            control={control}
            name="usuario"
            label="Usuario"
            size={'medium'}
            labelVariant={'subtitle1'}
            disabled={progresoLogin}
            rules={{ required: 'Este campo es requerido' }}
          />
          <Box sx={{ mt: 1, mb: 1 }}></Box>
          <FormInputText
            id={'contrasena'}
            control={control}
            name="contrasena"
            label="Contraseña"
            size={'medium'}
            labelVariant={'subtitle1'}
            type={'password'}
            disabled={progresoLogin}
            rules={{
              required: 'Este campo es requerido',
              minLength: {
                value: 3,
                message: 'Mínimo 3 caracteres',
              },
            }}
          />
          <Box sx={{ mt: 1, mb: 1 }}>
            <ProgresoLineal mostrar={progresoLogin} />
          </Box>
          <Box sx={{ height: 0 }}></Box>
          <Box display="flex" flex="1" justifyContent="start">
            <Button
              onClick={async () => {
                mostrarFullScreen()
                await delay(500)
                await router.replace({
                  pathname: '/recuperacion',
                })
                ocultarFullScreen()
              }}
              size={'small'}
              variant={'text'}
              disabled={progresoLogin}
              color={'primary'}
            >

              <Typography fontSize={'small'} sx={{ fontWeight: 'medium' }}>
                ¿Olvidaste tu contraseña?
              </Typography>
            </Button>
          </Box>
          <Box sx={{ height: 15 }}></Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={progresoLogin}
          >
            <Typography sx={{ fontWeight: 'medium' }} >
              Iniciar sesión
            </Typography>
          </Button>

          <Box
            sx={{ pt: 2, pb: 2 }}>
            <Divider>
              <Typography color="text.secondary"></Typography>
            </Divider>
          </Box>
          
        </form>
      </TabPanel>
    </Box>
  )
}

export default LoginRegistroContainer
