/// Vista modal de usuario
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CrearEditarParticipanteType,
  CrearEditarUsuarioType,
  ParticipanteCRUDType,
  RolType,
  UsuarioCRUDType,
} from '../types/usuariosCRUDTypes'
import { delay, InterpreteMensajes } from '../../../../common/utils'
import { Constantes } from '../../../../config'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material'
import {
  FormInputDate,
  FormInputDropdownMultiple,
  FormInputText,
} from '../../../../common/components/ui/form'
import { isValidEmail } from '../../../../common/utils/validations'
import ProgresoLineal from '../../../../common/components/ui/progreso/ProgresoLineal'
import { useAlerts, useSession } from '../../../../common/hooks'
import { formatoFecha } from '../../../../common/utils/fechas'
import { imprimir } from '../../../../common/utils/imprimir'
import { EventoCRUDType } from '../../eventos/types/eventosCRUDTypes'

export interface ModalParticipanteType {
  participante?: ParticipanteCRUDType | undefined | null
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalUsuario2 = ({
  participante,
  accionCorrecta,
  accionCancelar,
}: ModalParticipanteType ) => {
  console.log('Esto es lo que se mostrara: ', participante);

  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

  const { handleSubmit, control, getValues} = useForm<CrearEditarParticipanteType>({
    defaultValues: {
      id: participante?.id,
      nombre: participante?.nombre,
      correo: participante?.correo,
    },
  }
  
  )

  const guardarActualizarUsuario = async (data: CrearEditarParticipanteType) => {
    await guardarActualizarUsuariosPeticion(data)
  }

  const guardarActualizarUsuariosPeticion = async (
    usuario: CrearEditarParticipanteType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/participantes${usuario.id ? `/${usuario.id}` : ''
          }`,
        tipo: !!usuario.id ? 'patch' : 'post',
        body: {
          ...usuario,

        },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar participante: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

  const onSubmit = (data: CrearEditarParticipanteType) => {
    console.log(data); // Los valores del formulario al ser enviado
  };
  
  console.log(getValues()); // Valores actuales del formulario
  

  return (
    <form onSubmit={handleSubmit(guardarActualizarUsuario)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Box height={'5px'} />
          <Typography sx={{ fontWeight: 'medium' }} variant={'subtitle2'}>
            Datos personales
          </Typography>
          <Box height={'20px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>

            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'nombre'}
                control={control}
                name="nombre"
                label="Nombre"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>
          <Grid>
            <Box height={'20px'} />
            <Typography sx={{ fontWeight: 'medium' }} variant={'subtitle2'}>
              Datos de usuario
            </Typography>
            <Box height={'10px'} />
            <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
              <Grid item xs={12} sm={12} md={12}>
                <FormInputText
                  id={'correo'}
                  control={control}
                  name="correo"
                  label="Correo electrónico"
                  disabled={loadingModal}
                  rules={{
                    required: 'Este campo es requerido',
                    validate: (value) => {
                      if (!isValidEmail(value)) return 'No es un correo válido'
                    },
                  }}
                />
              </Grid>
             
            </Grid>
          </Grid>
          <Box height={'20px'} />
          <ProgresoLineal mostrar={loadingModal} />
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          my: 1,
          mx: 2,
          justifyContent: {
            lg: 'flex-end',
            md: 'flex-end',
            xs: 'center',
            sm: 'center',
          },
        }}
      >
        <Button
          variant={'outlined'}
          disabled={loadingModal}
          onClick={accionCancelar}
        >
          Cancelar
        </Button>
        <Button variant={'contained'} disabled={loadingModal} type={'submit'}>
          Guardar
        </Button>
      </DialogActions>
    </form>
  )
}
