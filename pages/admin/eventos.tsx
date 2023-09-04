
import type { NextPage } from 'next'
import {
  Button,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useAuth } from '../../context/auth'
import { LayoutUser } from '../../common/components/layouts'
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
import { VistaModalEvento } from '../../modules/admin/eventos/ui/ModalEventos'
import { useAlerts, useSession } from '../../common/hooks'
import { imprimir } from '../../common/utils/imprimir'
import { BotonBuscar } from '../../common/components/ui/botones/BotonBuscar'
import CustomMensajeEstado from '../../common/components/ui/estados/CustomMensajeEstado'
import { CriterioOrdenType } from '../../common/types/ordenTypes'
import { ordenFiltrado } from '../../common/utils/orden'
import { BotonOrdenar } from '../../common/components/ui/botones/BotonOrdenar'
import { IconoBoton } from '../../common/components/ui/botones/IconoBoton'
import { CategoriaType, EventoCRUDType } from '../../modules/admin/eventos/types/eventosCRUDTypes'
import { FiltroEventos } from '../../modules/admin/eventos/types/FiltroEventos'
import { RolType, UsuarioCRUDType } from '../../modules/admin/usuarios/types/usuariosCRUDTypes'
import { VistaModalUsuario2 } from '../../modules/admin/usuarios/ui/ModalUsuarios2'
import { VistaModalDetalle } from '../../modules/admin/eventos/ui/ModalDetalles'
import { FiltroCategorias } from '../../modules/admin/categorias/ui/FiltroCategorias'

const Eventos: NextPage = () => {
  const [eventosData, setEventosData] = useState<EventoCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorEventosData, setErrorEventosData] = useState<any>()

  const [modalEvento, setModalEvento] = useState(false)

  const [modalUsuario, setModalUsuario] = useState(false)

  const [modalDetalle, setModalDetalle] = useState(false)

  /// Indicador para mostrar una vista de alerta de cambio de estado
  const [mostrarAlertaEstadoEvento, setMostrarAlertaEstadoEvento] =
    useState(false)

  const [eventoEdicion, setEventoEdicion] = useState<
    EventoCRUDType | undefined | null
  >()

  const [eventoEnvio, setEventoEnvio] = useState<
    EventoCRUDType | undefined | null
  >()

  const [eventoDetalle, setEventoDetalle] = useState<
    EventoCRUDType | undefined | null
  >()

  //categorias de evento
  const [categoriasData, setCategoriasData] = useState<CategoriaType[]>([])

  const [usuarioEdicion, setUsuarioEdicion] = useState<
    UsuarioCRUDType | undefined | null
  >()

  // Variables de páginado
  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const { sesionPeticion } = useSession()
  const { estaAutenticado, permisoUsuario } = useAuth()

  const [filtroEvento, setFiltroEvento] = useState<string>('')
  const [mostrarFiltroEventos, setMostrarFiltroEventos] = useState(false)

  const [filtroUsuario, setFiltroUsuario] = useState<string>('')
  const [filtroRoles, setFiltroRoles] = useState<string[]>([])
  const [filtroCategorias, setFiltroCategorias] = useState<string[]>([])

  const [eventoNombre, setEventoNombre] = useState('');
  const [eventoId, setEventoId] = useState('');

  const [rolesData, setRolesData] = useState<RolType[]>([])

  /// Indicador para mostrar el filtro de usuarios
  const [mostrarFiltroUsuarios, setMostrarFiltroUsuarios] = useState(false)
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

  const editarEstadoEventoModal = async (evento: EventoCRUDType) => {
    setEventoEdicion(evento) // para mostrar datos de modal en la alerta
    setMostrarAlertaEstadoEvento(true) // para mostrar alerta de Evento
  }

  const cancelarAlertaEstadoEvento = async () => {
    setMostrarAlertaEstadoEvento(false)
    await delay(500) // para no mostrar undefined mientras el modal se cierra
    setEventoEdicion(null)
  }

  /// Método que oculta la alerta de cambio de estado y procede
  const aceptarAlertaEstadoEvento = async () => {
    setMostrarAlertaEstadoEvento(false)
    if (eventoEdicion) {
      await cambiarEstadoEventoPeticion(eventoEdicion)
    }
    setEventoEdicion(null)
  }


  /// Petición que cambia el estado de un evento
  const cambiarEstadoEventoPeticion = async (
    evento: EventoCRUDType
  ) => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/eventos/${evento.id}/${evento.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
          }`,
        tipo: 'patch',
      })
      imprimir(`respuesta estado evento: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerEventosPeticion()
    } catch (e) {
      imprimir(`Error estado evento`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // router para conocer la ruta actual
  const router = useRouter()

  const [registroConfirmado, setRegistroConfirmado] = useState(false);


  /// Criterios de orden
  const [ordenCriterios, setOrdenCriterios] = useState<
    Array<CriterioOrdenType>
  >([
    { campo: 'codigo', nombre: 'Código', ordenar: true },
    { campo: 'nombre', nombre: 'Nombre', ordenar: true },
    //{ campo: 'descripcion', nombre: 'Descripción', ordenar: true },
    { campo: 'lugar', nombre: 'Lugar', ordenar: true },
    // { campo: 'fecha', nombre: 'Fecha', ordenar: true },
    // { campo: 'enlace', nombre: 'Enlace Online', ordenar: true },
    //{ campo: 'maxparticipantes', nombre: 'maxparticipantes', ordenar: true },
    { campo: 'estado', nombre: 'Estado', ordenar: true },
    { campo: 'acciones', nombre: 'Acciones' },
    { campo: 'registro', nombre: 'Registro' },
    { campo: 'detalle', nombre: 'Detallle' },
  ])

  const contenidoTabla: Array<Array<ReactNode>> = eventosData.map(
    (eventoData, indexEvento) => [
      <Typography
        key={`${eventoData.id}-${indexEvento}-codigo`}
        variant={'body2'}
      >{`${eventoData.codigo}`}</Typography>,
      <Typography
        key={`${eventoData.id}-${indexEvento}-nombre`}
        variant={'body2'}
      >
        {`${eventoData.nombre}`}
      </Typography>,
      <Typography
        key={`${eventoData.id}-${indexEvento}-lugar`}
        variant={'body2'}
      >{`${eventoData.lugar}`}
      </Typography>,
      <CustomMensajeEstado
        key={`${eventoData.id}-${indexEvento}-estado`}
        titulo={eventoData.estado}
        descripcion={eventoData.estado}
        color={
          eventoData.estado == 'ACTIVO'
            ? 'success'
            : eventoData.estado == 'INACTIVO'
              ? 'error'
              : 'info'
        }
      />,
      <Grid key={`${eventoData.id}-${indexEvento}-acciones`}>
        {permisos.update && permisos.create && permisos.read && (
          <IconoTooltip
            id={`cambiarEstadoEvento-${eventoData.id}`}
            titulo={eventoData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
            color={eventoData.estado == 'ACTIVO' ? 'success' : 'error'}
            accion={async () => {
              await editarEstadoEventoModal(eventoData)
            }}
            desactivado={eventoData.estado == 'PENDIENTE'}
            icono={
              eventoData.estado == 'ACTIVO' ? 'toggle_on' : 'toggle_off'
            }
            name={
              eventoData.estado == 'ACTIVO'
                ? 'Inactivar Evento'
                : 'Activar Evento'
            }
          />
        )}
        {permisos.update && (
          <IconoTooltip
            id={`editarEventos-${eventoData.id}`}
            name={'Eventos'}
            titulo={'Editar'}
            color={'primary'}
            accion={() => {
              imprimir(`Editaremos`, eventoData)
              editarEventoModal(eventoData)
            }}
            icono={'edit'}
          />
        )}
      </Grid>,

      <Grid key={`${eventoData.id}-${indexEvento}-registro`}>
        {permisos.create && !registroConfirmado && (
          <IconoBoton
            id={'agregarParticipante'}
            key={'agregarParticipante'}
            texto={'Registro'}
            variante={xs ? 'icono' : 'boton'}
            icono={'add_circle_outline'}
            descripcion={'Agregar participante'}
            accion={() => {
              setRegistroConfirmado(false);
              agregarUsuarioModal();
            }}
          />
        )}
      </Grid>,

      <Grid key={`${eventoData.id}-${indexEvento}-detalle`}>
        <IconoBoton
          id={'detalle'}
          key={'detalle'}
          texto={'Detalle'}
          variante={xs ? 'icono' : 'boton'}
          icono={'add_circle_outline'}
          descripcion={'Ver detalle del evento'}
          accion={() => {
            detalleEventoModal(eventoData)
          }}
        />
      </Grid>,
    ]
  )

  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarEventosToggle'}
      key={'accionFiltrarEventosToggle'}
      seleccionado={mostrarFiltroEventos}
      cambiar={setMostrarFiltroEventos}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarEventos'}
        key={`ordenarEventos`}
        label={'Ordenar eventos'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),
    <IconoTooltip
      id={'actualizarEvento'}
      titulo={'Actualizar'}
      key={`accionActualizarEvento`}
      accion={async () => {
        await obtenerEventosPeticion()
      }}
      icono={'refresh'}
      name={'Actualizar lista de eventos'}
    />,
    permisos.create && (
      <IconoBoton
        id={'agregarEvento'}
        key={'agregarEvento'}
        texto={'Agregar'}
        variante={xs ? 'icono' : 'boton'}
        icono={'add_circle_outline'}
        descripcion={'Agregar evento'}
        accion={() => {
          agregarEventoModal()
        }}
      />
    ),
  ]

  const obtenerEventosPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/eventos`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroEvento.length == 0 ? {} : { filtro: filtroEvento }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
              orden: ordenFiltrado(ordenCriterios).join(','),
            }),
        },
      })
      setEventosData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorEventosData(null)
    } catch (e) {
      imprimir(`Error al obtener Eventos`, e)
      setErrorEventosData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  //obtner lista de categorias
  const obtenerCategoriasPeticion = async () => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/categorias`,
      })
      setCategoriasData(respuesta.datos?.filas)
      setErrorEventosData(null)
    } catch (e) {
      imprimir(`Error al obtener categorias`, e)
      setErrorEventosData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
    }
  }

  const obtenerUsuariosPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/usuarios`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroUsuario.length == 0 ? {} : { filtro: filtroUsuario }),
          ...(filtroRoles.length == 0 ? {} : { rol: filtroRoles.join(',') }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
              orden: ordenFiltrado(ordenCriterios).join(','),
            }),
        },
      })
      setUsuariosData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener usuarios`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const [usuariosData, setUsuariosData] = useState<UsuarioCRUDType[]>([])

  const [errorData, setErrorData] = useState<any>()

  const agregarEventoModal = () => {
    setEventoEdicion(undefined)
    setModalEvento(true)
  }

  const editarEventoModal = (Evento: EventoCRUDType) => {
    setEventoEdicion(Evento)
    setModalEvento(true)
  }

  const enviarEventoModal = (Evento: EventoCRUDType) => {
    setEventoEnvio(Evento)
  }

  const detalleEventoModal = (Evento: EventoCRUDType) => {
    setEventoDetalle(Evento)
    setModalDetalle(true)
  }

  const agregarUsuarioModal = () => {
    setUsuarioEdicion(null)
    setModalUsuario(true)
  };

  const cerrarModalEvento = async () => {
    setModalEvento(false)
    await delay(500)
    setEventoEdicion(undefined)
  }

  const cerrarModalDetalle = async () => {
    setModalDetalle(false)
    await delay(500)
    setEventoDetalle(undefined)
  }

  const cerrarModalUsuario = async () => {
    setModalUsuario(false)
    await delay(500)
    setUsuarioEdicion(null)
  }

  async function definirPermisos() {
    setPermisos(await permisoUsuario(router.pathname))
  }

  useEffect(() => {
    definirPermisos().finally()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaAutenticado])

  useEffect(() => {
    if (estaAutenticado)
      obtenerCategoriasPeticion()
        .then(() => {
          obtenerEventosPeticion()
            .catch(() => { })
            .finally(() => { })
        })
        .catch(() => { })
        .finally(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    estaAutenticado,
    pagina,
    limite,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(FiltroCategorias),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(ordenCriterios),
    filtroEvento,
  ])

  useEffect(() => {
    if (!mostrarFiltroEventos) {
      setFiltroEvento('')
      setFiltroCategorias([])
    }
  }, [mostrarFiltroEventos])

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
        isOpen={mostrarAlertaEstadoEvento}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${eventoEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
          } el evento: ${titleCase(eventoEdicion?.nombre ?? '')} ?`}
      >
        <Button onClick={cancelarAlertaEstadoEvento}>Cancelar</Button>
        <Button onClick={aceptarAlertaEstadoEvento}>Aceptar</Button>
      </AlertDialog>
      <CustomDialog
        isOpen={modalEvento}
        handleClose={cerrarModalEvento}
        title={eventoEdicion ? 'Editar evento' : 'Nuevo evento'}
      >
        <VistaModalEvento
          evento={eventoEdicion}
          categorias={categoriasData}
          accionCorrecta={() => {
            cerrarModalEvento().finally()
            obtenerEventosPeticion().finally()
          }}
          accionCancelar={cerrarModalEvento}
        />
      </CustomDialog>
      <CustomDialog
        isOpen={modalUsuario}
        handleClose={cerrarModalUsuario}
        title={usuarioEdicion ? 'Editar participante' : 'Nuevo participante'}
      >
        <VistaModalUsuario2
          usuario={usuarioEdicion}
          roles={rolesData}
          accionCorrecta={() => {
            cerrarModalUsuario().finally()
            obtenerUsuariosPeticion().finally()
            obtenerEventosPeticion().finally()
          }}
          accionCancelar={cerrarModalUsuario}
        />
      </CustomDialog>
      <CustomDialog
        isOpen={modalDetalle}
        handleClose={cerrarModalDetalle}
        title={eventoDetalle ? 'Detalles del evento' : 'Detalles del evento'}
      >
        <VistaModalDetalle
          detalle={eventoDetalle}
          accionCorrecta={() => {
            cerrarModalDetalle().finally()
            obtenerEventosPeticion().finally()
          }}
          accionCancelar={cerrarModalDetalle}
        />
      </CustomDialog>
      <LayoutUser title={`Eventos - ${siteName()}`}>
        <CustomDataTable
          titulo={'Eventos'}
          error={!!errorEventosData}
          cargando={loading}
          acciones={acciones}
          columnas={ordenCriterios}
          cambioOrdenCriterios={setOrdenCriterios}
          paginacion={paginacion}
          contenidoTabla={contenidoTabla}
          filtros={
            mostrarFiltroEventos && (
              <FiltroEventos
                filtroEvento={filtroEvento}
                accionCorrecta={(filtros) => {
                  setPagina(1)
                  setLimite(10)
                  setFiltroEvento(filtros.evento)
                }}
                accionCerrar={() => {
                  imprimir(`👀 cerrar`)
                }}
              />
            )
          }
        />
      </LayoutUser>
    </>
  )
}
export default Eventos
