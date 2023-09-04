import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { delay, InterpreteMensajes } from '../../../../common/utils'
import { Constantes } from '../../../../config'

import { Box, Button, DialogActions, DialogContent, Divider, Grid } from '@mui/material'
import { FormInputText } from '../../../../common/components/ui/form'
import ProgresoLineal from '../../../../common/components/ui/progreso/ProgresoLineal'
import { useAlerts, useSession } from '../../../../common/hooks'
import { imprimir } from '../../../../common/utils/imprimir'
import {
  CategoriaCRUDType,
  CrearEditarCategoriaCRUDType
} from '../types/categoriasCRUDTypes'
import Mapa from '../../../../common/components/ui/mapas/Mapa'
import FormInputFile from '../../../../common/components/ui/form/FormInputFile'

export interface ModalCategoriaType {
  categoria?: CategoriaCRUDType | null
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalCategoria = ({
  categoria,
  accionCorrecta,
  accionCancelar,
}: ModalCategoriaType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  const [imageBase64, setImageBase64] = useState<string>('');

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

  const { handleSubmit, control } = useForm<CrearEditarCategoriaCRUDType>({
    defaultValues: {
      id: categoria?.id,
      descripcion: categoria?.descripcion,
      categoria: categoria?.categoria,
      cartel: null,
    },
  })

  const guardarActualizarCategoria = async (
    data: CrearEditarCategoriaCRUDType
  ) => {
    data.cartel = imageBase64;
    await guardarActualizarCategoriasPeticion(data)
  }

  const guardarActualizarCategoriasPeticion = async (
    categoria: CrearEditarCategoriaCRUDType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/categorias${categoria.id ? `/${categoria.id}` : ''
          }`,
        tipo: !!categoria.id ? 'patch' : 'post',
        body: categoria,
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar categoria`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

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

  return (
    <form onSubmit={handleSubmit(guardarActualizarCategoria)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'categoria'}
                control={control}
                name="categoria"
                label="Categoria"
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
                label="Descripcion sobre el evento"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>

          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
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
            </Grid>
            <Box height={'10px'} />
            <ProgresoLineal mostrar={loadingModal} />
            <Box height={'5px'} />
          </Grid>
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
