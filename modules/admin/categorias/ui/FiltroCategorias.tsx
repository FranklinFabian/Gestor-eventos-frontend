import { Box, Grid } from '@mui/material'
import { FormInputText } from '../../../../common/components/ui/form'
import { useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import { useEffect } from 'react'

export interface FiltroType {
  categoria: string
}

export interface FiltroCategoriasType {
  filtroCategoria: string
  accionCorrecta: (filtros: FiltroType) => void
  accionCerrar: () => void
}

export const FiltroCategorias = ({
  filtroCategoria,
  accionCorrecta,
}: FiltroCategoriasType) => {
  const { control, watch } = useForm<FiltroType>({
    defaultValues: {
      categoria: filtroCategoria,
    },
  })

  const categoriaFiltro: string | undefined = watch('categoria')

  useEffect(() => {
    actualizacionFiltros({
      categoria: categoriaFiltro,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaFiltro])

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
            id={'categoria'}
            name={'categoria'}
            control={control}
            label={'Buscar categoria'}
            bgcolor={'background.paper'}
            clearable
          />
        </Grid>
      </Grid>
    </Box>
  )
}
