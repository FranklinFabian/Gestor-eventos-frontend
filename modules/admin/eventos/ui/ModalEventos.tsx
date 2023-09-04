import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { delay, InterpreteMensajes } from '../../../../common/utils'
import { Constantes } from '../../../../config'

import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import { FormInputDate, FormInputDropdownMultiple, FormInputText } from '../../../../common/components/ui/form'
import ProgresoLineal from '../../../../common/components/ui/progreso/ProgresoLineal'
import { useAlerts, useSession } from '../../../../common/hooks'
import { imprimir } from '../../../../common/utils/imprimir'
import {
  CategoriaType,
  CrearEditarEventoCRUDType,
  EventoCRUDType
} from '../types/eventosCRUDTypes'
import { FormInputAutocomplete } from '../../../../common/components/ui/form/FormInputAutocomplete'
import Mapa from '../../../../common/components/ui/mapas/Mapa'

export interface ModalEventoType {
  evento?: EventoCRUDType | null
  categorias: CategoriaType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalEvento = ({
  evento,
  categorias,
  accionCorrecta,
  accionCancelar,
}: ModalEventoType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  console.log(evento, 'esto es lo qu enevia')
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  const [imageBase64, setImageBase64] = useState<string>('');
  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

  const { handleSubmit, control } = useForm<CrearEditarEventoCRUDType>({
    defaultValues: {
      id: evento?.id,
      codigo: evento?.codigo,
      descripcion: evento?.descripcion,
      nombre: evento?.nombre,
      lugar: evento?.lugar,
      fecha: evento?.fecha,
      enlace: evento?.enlace,
      cartel: null,
      maxparticipantes: evento?.maxparticipantes,
      idcategoria: evento?.idcategoria,
    },
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setImageBase64(base64Image);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const guardarActualizarEvento = async (
    data: CrearEditarEventoCRUDType
  ) => {
    data.cartel = imageBase64;
    await guardarActualizarEventosPeticion(data)
  }

  const guardarActualizarEventosPeticion = async (
    evento: CrearEditarEventoCRUDType
  ) => {
    console.log(evento, `asdse envia este evento`)
    const objetoEnviar = {
      ...evento,
      //@ts-ignore
      idcategoria: evento.idcategoria.key,
      //@ts-ignore
    }
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/eventos${evento.id ? `/${evento.id}` : ''
          }`,
        tipo: !!evento.id ? 'patch' : 'post',
        body: objetoEnviar,
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar evento`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }
  return (
    <form onSubmit={handleSubmit(guardarActualizarEvento)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'codigo'}
                control={control}
                name="codigo"
                label="Código"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
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
          <Box height={'15px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>

            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'descripcion'}
                control={control}
                name="descripcion"
                label="Decripción"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputDate
                id={'fecha'}
                control={control}
                name="fecha"
                label="Fecha del evento"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'lugar'}
                control={control}
                name="lugar"
                label="Lugar"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'enlace'}
                control={control}
                name="enlace"
                label="enlace"
                disabled={loadingModal}
              //rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'maxparticipantes'}
                control={control}
                name="maxparticipantes"
                label="Nro. de participantes"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  margin: '0',
                  maxWidth: '100%',
                }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Ingrese imagen de la categoría</p>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {imageBase64 && <img src={imageBase64} alt="Selected" />}
                </div>
              </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputAutocomplete
                id={'idcategotia'}
                name="idcategoria"
                control={control}
                label="Categorias"
                forcePopupIcon
                freeSolo
                newValues
                disabled={loadingModal}
                options={categorias.map((categoria) => ({
                  key: categoria.id,
                  value: categoria.id,
                  label: categoria.categoria,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>
          <Box height={'10px'} />
          <ProgresoLineal mostrar={loadingModal} />
          <Box height={'5px'} />
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
