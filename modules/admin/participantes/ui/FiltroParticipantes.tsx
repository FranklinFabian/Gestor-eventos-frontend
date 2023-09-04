import { Box, Grid } from '@mui/material'
import { FormInputText } from '../../../../common/components/ui/form'
import { useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import { useEffect } from 'react'

export interface FiltroType {
  participante: string
}

export interface FiltroParticipantesType {
  filtroParticipante: string
  accionCorrecta: (filtros: FiltroType) => void
  accionCerrar: () => void
}

export const FiltroParticipantes = ({
  filtroParticipante,
  accionCorrecta,
}: FiltroParticipantesType) => {
  const { control, watch } = useForm<FiltroType>({
    defaultValues: {
      participante: filtroParticipante,
    },
  })

  const participanteFiltro: string | undefined = watch('participante')

  useEffect(() => {
    actualizacionFiltros({
      participante: participanteFiltro,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participanteFiltro])

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
            id={'participante'}
            name={'participante'}
            control={control}
            label={'Buscar parámetro'}
            bgcolor={'background.paper'}
            clearable
          />
        </Grid>
      </Grid>
    </Box>
  )
}
