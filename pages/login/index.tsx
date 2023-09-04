import type { NextPage } from 'next'
import { LayoutLogin } from '../../common/components/layouts'
import Grid from '@mui/material/Grid'
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, MenuItem, Select, useMediaQuery, useTheme } from '@mui/material'
import Typography from '@mui/material/Typography'
import { delay, InterpreteMensajes, siteName } from '../../common/utils'
import { Constantes } from '../../config'
import { Servicios } from '../../common/services'
import { useFullScreenLoading } from '../../context/ui'
import { SetStateAction, useEffect, useState } from 'react'
import { useAlerts } from '../../common/hooks'
import { imprimir } from '../../common/utils/imprimir'
import LoginRegistroTabContainer from '../../modules/login/ui/LoginRegistroContainer'
import EventoCard from '../../modules/admin/eventos/ui/EventoCard'
import { CategoriaCRUDType, EventoCRUDType } from '../../modules/admin/eventos/types/eventosCRUDTypes'
import CategoriaCard from '../../modules/admin/categorias/ui/CategoriaCard'
import DatePicker from '@mui/lab/DatePicker'

const Index: NextPage = () => {
  const theme = useTheme()
  const sm = useMediaQuery(theme.breakpoints.only('sm'))
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  const { Alerta } = useAlerts()
  const { mostrarFullScreen, ocultarFullScreen } = useFullScreenLoading()
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  const [filtroFecha, setFiltroFecha] = useState<Date | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null);

  const [eventosData, setEventosData] = useState<EventoCRUDType[]>([]);

  const [categoriasData, setCategoriasData] = useState<CategoriaCRUDType[]>([])
  const [errorEventosData, setErrorEventosData] = useState<any>()
  const [errorCategoriasData, setErrorCategoriasData] = useState<any>()

  const { peticionHTTP } = Servicios

  const obtenerEstado = async () => {
    try {
      mostrarFullScreen()
      await delay(1000)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/estado`,
        body: {},
        headers: {
          accept: 'application/json',
        },
      })
      imprimir(`Se obtuvo el estado 🙌`, respuesta)
    } catch (e) {
      imprimir(`Error al obtener estado`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      ocultarFullScreen()
    }
  }

  const obtenerEventosPeticion = async () => {
    try {
      const respuesta = await peticionHTTP({
        url: `${Constantes.baseUrl}/principal/eventos`,
        body: {},
        headers: {
          accept: 'application/json',
        },
      });
      // Aplicar filtros si están activos
      let eventosFiltrados = respuesta.data?.datos.filas;
      if (filtroFecha) {
        eventosFiltrados = eventosFiltrados.filter((evento: { fecha: Date }) => evento.fecha === filtroFecha);
      }
      if (filtroCategoria) {
        eventosFiltrados = eventosFiltrados.filter((evento: { idcategoria: number }) => evento.idcategoria === filtroCategoria);
      }

      setEventosData(eventosFiltrados);
      setErrorEventosData(null);
    } catch (e) {
      imprimir(`Error al obtener Eventos`, e);
      setErrorEventosData(e);
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' });
    }
  };

  const obtenerCategoriasPeticion = async () => {
    try {
      const respuesta = await peticionHTTP({
        url: `${Constantes.baseUrl}/principal/categorias`,
        body: {},
        headers: {
          accept: 'application/json',
        },
      })
      setCategoriasData(respuesta.data?.datos.filas)
      setErrorEventosData(null)
    } catch (e) {
      imprimir(`Error al obtener categorias`, e)
      setErrorCategoriasData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    }
  }

  useEffect(() => {
    Promise.all([obtenerEstado(), obtenerEventosPeticion(), obtenerCategoriasPeticion()])
      .catch(() => { })
      .finally(() => { });
  }, [filtroFecha, filtroCategoria]);


  return (
    <LayoutLogin title={siteName()}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {/* Categorías */}
          <Accordion>
            <AccordionSummary>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography variant="h4" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                  Categorías
                </Typography>
                <Typography variant="body2" style={{ textAlign: 'center' }}>
                  Toca para ver todas las categorías
                </Typography>
              </div>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {categoriasData.map((categoria) => (
                  <Grid item xs={12} sm={6} md={3} key={categoria.id}>
                    <CategoriaCard
                      id={categoria.id}
                      categoria={categoria.categoria}
                      descripcion={categoria.descripcion}
                      cartel={categoria.cartel} estado={''}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12} style={{ height: '2rem' }} />

        <Grid item xs={12}>
          {/* Filtro de Fecha */}
          <DatePicker
            label="Filtrar por Fecha"
            value={filtroFecha}
            onChange={(date: SetStateAction<Date | null>) => setFiltroFecha(date)}
            format="dd/MM/yyyy"
            clearable
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          {/* Filtro de Categoría */}
          <Accordion>
            <AccordionSummary >
              Filtrar por Categoría
            </AccordionSummary>
            <AccordionDetails>
              <Select
                fullWidth
                value={filtroCategoria || ''}
                onChange={(event) => setFiltroCategoria(event.target.value as number)}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categoriasData.map((categoria) => (
                  <MenuItem value={categoria.id} key={categoria.id}>
                    {categoria.categoria}
                  </MenuItem>
                ))}
              </Select>
            </AccordionDetails>
          </Accordion>
        </Grid>


      {/* Espacio de separación */}
      <Grid item xs={12} style={{ height: '2rem' }} />

      {/* Eventos */}
      <Grid item xs={12}>
        <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
          Eventos
        </Typography>
      </Grid>
      {eventosData.map((evento) => (
        <Grid item xs={12} sm={6} md={4} key={evento.id}>
          <EventoCard
            id={evento.id}
            codigo={evento.codigo}
            nombre={evento.nombre}
            descripcion={evento.descripcion}
            lugar={evento.lugar}
            fecha={evento.fecha}
            enlace={evento.enlace}
            cartel={evento.cartel}
            maxparticipantes={evento.maxparticipantes}
            estado={evento.estado}
            idcategoria={evento.idcategoria}
            categoria={evento.categoria}
          />
        </Grid>
      ))}
    </Grid>
    </LayoutLogin >
  )
}

export default Index
