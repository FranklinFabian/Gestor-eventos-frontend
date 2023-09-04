import { Box, Grid } from '@mui/material'
import { FormInputText } from '../../../../common/components/ui/form'
import { useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import { useEffect } from 'react'

export interface FiltroType {
  evento: string
}

export interface FiltroEventosType {
  filtroEvento: string
  accionCorrecta: (filtros: FiltroType) => void
  accionCerrar: () => void
}

export const FiltroEventos = ({
  filtroEvento,
  accionCorrecta,
}: FiltroEventosType) => {
  const { control, watch } = useForm<FiltroType>({
    defaultValues: {
      evento: filtroEvento,
    },
  })

  const eventoFiltro: string | undefined = watch('evento')

  useEffect(() => {
    actualizacionFiltros({
      evento: eventoFiltro,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoFiltro])

  const debounced = useDebouncedCallback((filtros: FiltroType) => {
    accionCorrecta(filtros)
  }, 1000)

  const actualizacionFiltros = (filtros: FiltroType) => {
    debounced(filtros)
  }

  return (
    <Box sx={{ pl: 1, pr: 1, pt: 1 }}>
      <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
        <Grid item xs={12} sm={12} md={6}>
          <FormInputText
            id={'evento'}
            name={'evento'}
            control={control}
            label={'Buscar evento'}
            bgcolor={'background.paper'}
            clearable
          />
        </Grid>
      </Grid>
    </Box>
  )
}
