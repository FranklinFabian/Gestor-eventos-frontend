import type { NextPage } from 'next'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useAuth } from '../../context/auth'
import { LayoutLogin, LayoutUser } from '../../common/components/layouts'
import React, { ReactNode, useEffect, useState } from 'react'
import { CasbinTypes } from '../../common/types'
import {
  AlertDialog,
  CustomDataTable,
  CustomDialog,
  IconoTooltip,
} from '../../common/components/ui'
import {
  delay,
  InterpreteMensajes,
  siteName,
  titleCase,
} from '../../common/utils'
import { Constantes } from '../../config'

import { Paginacion } from '../../common/components/ui/datatable/Paginacion'
import { useRouter } from 'next/router'
import { VistaModalParticipante } from '../../modules/admin/participantes/ui/ModalParticipantes'
import { useAlerts, useSession } from '../../common/hooks'
import { imprimir } from '../../common/utils/imprimir'
import { ParticipanteCRUDType } from '../../modules/admin/participantes/types/participantesCRUDTypes'
import { FiltroParticipantes } from '../../modules/admin/participantes/ui/FiltroParticipantes'
import { BotonBuscar } from '../../common/components/ui/botones/BotonBuscar'
import CustomMensajeEstado from '../../common/components/ui/estados/CustomMensajeEstado'
import { CriterioOrdenType } from '../../common/types/ordenTypes'
import { ordenFiltrado } from '../../common/utils/orden'
import { BotonOrdenar } from '../../common/components/ui/botones/BotonOrdenar'
import { IconoBoton } from '../../common/components/ui/botones/IconoBoton'
import { DatePicker } from '@mui/x-date-pickers'
import ParticipanteCard from '../../modules/admin/participantes/ui/ParticipanteCard'

const Participantes: NextPage = () => {
  const [participantesData, setParticipantesData] = useState<ParticipanteCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorParticipantesData, setErrorParticipantesData] = useState<any>()

  const [modalParticipante, setModalParticipante] = useState(false)

  /// Indicador para mostrar una vista de alerta de cambio de estado
  const [mostrarAlertaEstadoParticipante, setMostrarAlertaEstadoParticipante] =
    useState(false)

  const [participanteEdicion, setParticipanteEdicion] = useState<
    ParticipanteCRUDType | undefined | null
  >()

  // Variables de páginado
  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const { sesionPeticion } = useSession()
  const { estaAutenticado, permisoUsuario } = useAuth()

  const [filtroParticipante, setFiltroParticipante] = useState<string>('')
  const [mostrarFiltroParticipantes, setMostrarFiltroParticipantes] = useState(false)
  // Permisos para acciones
  const [permisos, setPermisos] = useState<CasbinTypes>({
    read: false,
    create: false,
    update: false,
    delete: false,
  })

  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  /// Método que muestra alerta de cambio de estado

  const editarEstadoParticipanteModal = async (participante: ParticipanteCRUDType) => {
    setParticipanteEdicion(participante) // para mostrar datos de modal en la alerta
    setMostrarAlertaEstadoParticipante(true) // para mostrar alerta de participante
  }

  const cancelarAlertaEstadoParticipante = async () => {
    setMostrarAlertaEstadoParticipante(false)
    await delay(500) // para no mostrar undefined mientras el modal se cierra
    setParticipanteEdicion(null)
  }

  /// Método que oculta la alerta de cambio de estado y procede
  const aceptarAlertaEstadoParticipante = async () => {
    setMostrarAlertaEstadoParticipante(false)
    if (participanteEdicion) {
      await cambiarEstadoParticipantePeticion(participanteEdicion)
    }
    setParticipanteEdicion(null)
  }

  /// Petición que cambia el estado de un participantes
  const cambiarEstadoParticipantePeticion = async (
    participante: ParticipanteCRUDType
  ) => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/participantes/${participante.id}/${participante.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
          }`,
        tipo: 'patch',
      })
      imprimir(`respuesta estado participante: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerParticipantesPeticion()
    } catch (e) {
      imprimir(`Error estado participante`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // router para conocer la ruta actual
  const router = useRouter()

  /// Criterios de orden
  const [ordenCriterios, setOrdenCriterios] = useState<
    Array<CriterioOrdenType>
  >([
    { campo: 'nombre', nombre: 'Nombre', ordenar: true },
    { campo: 'correo', nombre: 'Correo', ordenar: true },
    { campo: 'estado', nombre: 'Estado', ordenar: true },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  const contenidoTabla: Array<Array<ReactNode>> = participantesData.map(
    (participanteData, indexParticipante) => [
      <Typography
        key={`${participanteData.id}-${indexParticipante}-nombre`}
        variant={'body2'}
      >
        {`${participanteData.nombre}`}
      </Typography>,
      <Typography
        key={`${participanteData.id}-${indexParticipante}-correo`}
        variant={'body2'}
      >{`${participanteData.correo}`}</Typography>,

      <CustomMensajeEstado
        key={`${participanteData.id}-${indexParticipante}-estado`}
        titulo={participanteData.estado}
        descripcion={participanteData.estado}
        color={
          participanteData.estado == 'ACTIVO'
            ? 'success'
            : participanteData.estado == 'INACTIVO'
              ? 'error'
              : 'info'
        }
      />,

      <Grid key={`${participanteData.id}-${indexParticipante}-acciones`}>
        {permisos.update && (
          <IconoTooltip
            id={`cambiarEstadoParticipante-${participanteData.id}`}
            titulo={participanteData.estado == 'ACTIVO' ? 'Registrado' : 'No Registrado'}
            color={participanteData.estado == 'ACTIVO' ? 'success' : 'error'}
            accion={async () => {
              await editarEstadoParticipanteModal(participanteData)
            }}
            desactivado={participanteData.estado == 'PENDIENTE'}
            icono={
              participanteData.estado == 'ACTIVO' ? 'toggle_on' : 'toggle_off'
            }
            name={
              participanteData.estado == 'ACTIVO'
                ? 'Inactivar participantes'
                : 'Activar participantes'
            }
          />
        )}

        {/*permisos.update && (
          <IconoTooltip
            id={`editarParticipantes-${participanteData.id}`}
            name={'Participante'}
            titulo={'Editar'}
            color={'primary'}
            accion={() => {
              imprimir(`Editaremos`, participanteData)
              editarParticipanteModal(participanteData)
            }}
            icono={'edit'}
          />
          )*/}
      </Grid>,
    ]
  )

  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarParticipantesToggle'}
      key={'accionFiltrarParticipantesToggle'}
      seleccionado={mostrarFiltroParticipantes}
      cambiar={setMostrarFiltroParticipantes}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarParticipantes'}
        key={`ordenarParticipantes`}
        label={'Ordenar Participante'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),
    <IconoTooltip
      id={'actualizarParticipante'}
      titulo={'Actualizar'}
      key={`accionActualizarParticipante`}
      accion={async () => {
        await obtenerParticipantesPeticion()
      }}
      icono={'refresh'}
      name={'Actualizar lista de Participante'}
    />,
    /*permisos.create && (
      <IconoBoton
        id={'agregarParticipante'}
        key={'agregarParticipante'}
        texto={'Agregar'}
        variante={xs ? 'icono' : 'boton'}
        icono={'add_circle_outline'}
        descripcion={'Agregar participantes'}
        accion={() => {
          agregarParticipanteModal()
        }}
      />
    ),*/
  ]

  const obtenerParticipantesPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/participantes`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroParticipante.length == 0 ? {} : { filtro: filtroParticipante }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
              orden: ordenFiltrado(ordenCriterios).join(','),
            }),
        },
      })
      setParticipantesData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorParticipantesData(null)
    } catch (e) {
      imprimir(`Error al obtener participantes`, e)
      setErrorParticipantesData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const agregarParticipanteModal = () => {
    setParticipanteEdicion(undefined)
    setModalParticipante(true)
  }
  const editarParticipanteModal = (participante: ParticipanteCRUDType) => {
    setParticipanteEdicion(participante)
    setModalParticipante(true)
  }

  const cerrarModalParticipante = async () => {
    setModalParticipante(false)
    await delay(500)
    setParticipanteEdicion(undefined)
  }

  async function definirPermisos() {
    setPermisos(await permisoUsuario(router.pathname))
  }

  useEffect(() => {
    definirPermisos().finally()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaAutenticado])

  useEffect(() => {
    if (estaAutenticado) obtenerParticipantesPeticion().finally(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    estaAutenticado,
    pagina,
    limite,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(ordenCriterios),
    filtroParticipante,
  ])

  useEffect(() => {
    if (!mostrarFiltroParticipantes) {
      setFiltroParticipante('')
    }
  }, [mostrarFiltroParticipantes])

  const paginacion = (
    <Paginacion
      pagina={pagina}
      limite={limite}
      total={total}
      cambioPagina={setPagina}
      cambioLimite={setLimite}
    />
  )

  return (
    <>
      <AlertDialog
        isOpen={mostrarAlertaEstadoParticipante}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${participanteEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
          } el participantes: ${titleCase(participanteEdicion?.nombre ?? '')} ?`}
      >
        <Button onClick={cancelarAlertaEstadoParticipante}>Cancelar</Button>
        <Button onClick={aceptarAlertaEstadoParticipante}>Aceptar</Button>
      </AlertDialog>
      <CustomDialog
        isOpen={modalParticipante}
        handleClose={cerrarModalParticipante}
        title={participanteEdicion ? 'Editar participantes' : 'Nuevo participantes'}
      >
        <VistaModalParticipante
          participante={participanteEdicion}
          accionCorrecta={() => {
            cerrarModalParticipante().finally()
            obtenerParticipantesPeticion().finally()
          }}
          accionCancelar={cerrarModalParticipante}
        />
      </CustomDialog>
      <LayoutUser title={`Participante - ${siteName()}`}>
        {/*<CustomDataTable
          titulo={'Participante'}
          error={!!errorParticipantesData}
          cargando={loading}
          acciones={acciones}
          columnas={ordenCriterios}
          cambioOrdenCriterios={setOrdenCriterios}
          paginacion={paginacion}
          contenidoTabla={contenidoTabla}
          filtros={
            mostrarFiltroParticipantes && (
              <FiltroParticipantes
                filtroParticipante={filtroParticipante}
                accionCorrecta={(filtros) => {
                  setPagina(1)
                  setLimite(10)
                  setFiltroParticipante(filtros.participante)
                }}
                accionCerrar={() => {
                  imprimir(`👀 cerrar`)
                }}
              />
            )
          }
        />*/}
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ marginBottom: '1rem' }}>
            Participantes
          </Typography>
        </Grid>
        <Grid container spacing={3}>
        {participantesData.map((participante) => (
          <Grid item xs={12} sm={6} md={3} key={participante.id}>
            <ParticipanteCard
              id={participante.id}
              evento={participante.evento}
              nombre={participante.nombre}
              correo={participante.correo}
              idevento={participante.idevento}
              estado={''}
            />
          </Grid>
        ))}
        </Grid>
      </LayoutUser>


    </>
  )
}
export default Participantes
