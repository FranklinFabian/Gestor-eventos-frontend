/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import { titleCase } from '../../../../common/utils'


import { Box, Button, Card, CardContent, DialogActions, DialogContent, Grid, Typography } from '@mui/material'
import { FormInputDate, FormInputText } from '../../../../common/components/ui/form'
import ProgresoLineal from '../../../../common/components/ui/progreso/ProgresoLineal'
import { useAlerts, useSession } from '../../../../common/hooks'
import { imprimir } from '../../../../common/utils/imprimir'
import {
  CrearEditarEventoCRUDType,
  EventoCRUDType
} from '../types/eventosCRUDTypes'
import { LayoutUser } from '../../../../common/components/layouts'
import { Icono } from '../../../../common/components/ui'
import { formatoFecha } from '../../../../common/utils/fechas'

export interface ModalEventoType {
  detalle?: EventoCRUDType | null
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalDetalle = ({
  detalle,
  accionCorrecta,
  accionCancelar,
}: ModalEventoType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            sx={{
              p: 2,
              flex: 1,
              backgroundColor: '#F5F5F5', // Fondo del card
              borderRadius: '12px',
              boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)', // Sombra
              transition: 'all 0.2s ease-out !important',
              textAlign: 'center',
            }}
          >
            <img
              alt="Evento"
              src={detalle?.cartel}
              style={{ width: '80%', borderRadius: '50%' }}
            />
            <Typography variant="h6" sx={{ mt: 1 }}>
              {titleCase(detalle.nombre)}
            </Typography>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Detalles del Evento
            </Typography>
            <Typography variant="subtitle1">{detalle?.descripcion}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Lugar:</strong> {detalle?.lugar}
              </Typography>
              <Typography variant={'body1'}>
                <strong>Fecha:</strong>
                {formatoFecha(
                  detalle?.fecha,
                  'DD/MM/YYYY'
                )}
              </Typography>
              <Typography variant="body1">
                <strong>Enlace:</strong> {detalle?.enlace}
              </Typography>
              <Typography variant="body1">
                <strong>Max. Asistentes:</strong> {detalle?.maxparticipantes}
              </Typography>
            </Box>
          </CardContent>
          <DialogActions>
            <Button onClick={accionCancelar} color="primary">
              Cerrar
            </Button>

          </DialogActions>
        </Card>
      </Grid>
    </Grid>
  )
}
