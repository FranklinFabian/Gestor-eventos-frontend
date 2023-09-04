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
import { VistaModalCategoria } from '../../modules/admin/categorias/ui'
import { useAlerts, useSession } from '../../common/hooks'
import { imprimir } from '../../common/utils/imprimir'
import { CategoriaCRUDType } from '../../modules/admin/categorias/types/categoriasCRUDTypes'
import { FiltroCategorias } from '../../modules/admin/categorias/ui/FiltroCategorias'
import { BotonBuscar } from '../../common/components/ui/botones/BotonBuscar'
import CustomMensajeEstado from '../../common/components/ui/estados/CustomMensajeEstado'
import { CriterioOrdenType } from '../../common/types/ordenTypes'
import { ordenFiltrado } from '../../common/utils/orden'
import { BotonOrdenar } from '../../common/components/ui/botones/BotonOrdenar'
import { IconoBoton } from '../../common/components/ui/botones/IconoBoton'

const Categorias: NextPage = () => {
  const [categoriasData, setCategoriasData] = useState<CategoriaCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorCategoriasData, setErrorCategoriasData] = useState<any>()

  const [modalCategoria, setModalCategoria] = useState(false)

  /// Indicador para mostrar una vista de alerta de cambio de estado
  const [mostrarAlertaEstadoCategoria, setMostrarAlertaEstadoCategoria] =
    useState(false)

  const [categoriaEdicion, setCategoriaEdicion] = useState<
    CategoriaCRUDType | undefined | null
  >()

  // Variables de páginado
  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const { sesionPeticion } = useSession()
  const { estaAutenticado, permisoUsuario } = useAuth()

  const [filtroCategoria, setFiltroCategoria] = useState<string>('')
  const [mostrarFiltroCategorias, setMostrarFiltroCategorias] = useState(false)
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

  const editarEstadoCategoriaModal = async (categoria: CategoriaCRUDType) => {
    setCategoriaEdicion(categoria) // para mostrar datos de modal en la alerta
    setMostrarAlertaEstadoCategoria(true) // para mostrar alerta de Categoria
  }

  const cancelarAlertaEstadoCategoria = async () => {
    setMostrarAlertaEstadoCategoria(false)
    await delay(500) // para no mostrar undefined mientras el modal se cierra
    setCategoriaEdicion(null)
  }

  /// Método que oculta la alerta de cambio de estado y procede
  const aceptarAlertaEstadoCategoria = async () => {
    setMostrarAlertaEstadoCategoria(false)
    if (categoriaEdicion) {
      await cambiarEstadoCategoriaPeticion(categoriaEdicion)
    }
    setCategoriaEdicion(null)
  }

  /// Petición que cambia el estado de un parámetro
  const cambiarEstadoCategoriaPeticion = async (
    categoria: CategoriaCRUDType
  ) => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/categorias/${categoria.id}/${
          categoria.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
        }`,
        tipo: 'patch',
      })
      imprimir(`respuesta estado categoria: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerCategoriasPeticion()
    } catch (e) {
      imprimir(`Error estado categoria`, e)
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
    { campo: 'categoria', nombre: 'Categoria', ordenar: true },
    { campo: 'descripcion', nombre: 'Descripción', ordenar: true },
    { campo: 'estado', nombre: 'Estado', ordenar: true },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  const contenidoTabla: Array<Array<ReactNode>> = categoriasData.map(
    (categoriaData, indexCategoria) => [
      <Typography
        key={`${categoriaData.id}-${indexCategoria}-categoria`}
        variant={'body2'}
      >
        {`${categoriaData.categoria}`}
      </Typography>,
      <Typography
        key={`${categoriaData.id}-${indexCategoria}-descripcion`}
        variant={'body2'}
      >{`${categoriaData.descripcion}`}</Typography>,
      <CustomMensajeEstado
        key={`${categoriaData.id}-${indexCategoria}-estado`}
        titulo={categoriaData.estado}
        descripcion={categoriaData.estado}
        color={
          categoriaData.estado == 'ACTIVO'
            ? 'success'
            : categoriaData.estado == 'INACTIVO'
            ? 'error'
            : 'info'
        }
      />,

      <Grid key={`${categoriaData.id}-${indexCategoria}-acciones`}>
        {permisos.update && (
          <IconoTooltip
            id={`cambiarEstadoCategoria-${categoriaData.id}`}
            titulo={categoriaData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
            color={categoriaData.estado == 'ACTIVO' ? 'success' : 'error'}
            accion={async () => {
              await editarEstadoCategoriaModal(categoriaData)
            }}
            desactivado={categoriaData.estado == 'PENDIENTE'}
            icono={
              categoriaData.estado == 'ACTIVO' ? 'toggle_on' : 'toggle_off'
            }
            name={
              categoriaData.estado == 'ACTIVO'
                ? 'Inactivar Parámetro'
                : 'Activar Parámetro'
            }
          />
        )}

        {permisos.update && (
          <IconoTooltip
            id={`editarCategorias-${categoriaData.id}`}
            name={'Categorias'}
            titulo={'Editar'}
            color={'primary'}
            accion={() => {
              imprimir(`Editaremos`, categoriaData)
              editarCategoriaModal(categoriaData)
            }}
            icono={'edit'}
          />
        )}
      </Grid>,
    ]
  )

  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarCategoriasToggle'}
      key={'accionFiltrarCategoriasToggle'}
      seleccionado={mostrarFiltroCategorias}
      cambiar={setMostrarFiltroCategorias}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarCategorias'}
        key={`ordenarCategorias`}
        label={'Ordenar categoria'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),
    <IconoTooltip
      id={'actualizarCategoria'}
      titulo={'Actualizar'}
      key={`accionActualizarCategoria`}
      accion={async () => {
        await obtenerCategoriasPeticion()
      }}
      icono={'refresh'}
      name={'Actualizar lista de categorias'}
    />,
    permisos.create && (
      <IconoBoton
        id={'agregarCategoria'}
        key={'agregarCategoria'}
        texto={'Agregar'}
        variante={xs ? 'icono' : 'boton'}
        icono={'add_circle_outline'}
        descripcion={'Agregar categoria'}
        accion={() => {
          agregarCategoriaModal()
        }}
      />
    ),
  ]

  const obtenerCategoriasPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/categorias`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroCategoria.length == 0 ? {} : { filtro: filtroCategoria }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
                orden: ordenFiltrado(ordenCriterios).join(','),
              }),
        },
      })
      setCategoriasData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorCategoriasData(null)
    } catch (e) {
      imprimir(`Error al obtener categoria`, e)
      setErrorCategoriasData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const agregarCategoriaModal = () => {
    setCategoriaEdicion(undefined)
    setModalCategoria(true)
  }
  const editarCategoriaModal = (Categoria: CategoriaCRUDType) => {
    setCategoriaEdicion(Categoria)
    setModalCategoria(true)
  }

  const cerrarModalCategoria = async () => {
    setModalCategoria(false)
    await delay(500)
    setCategoriaEdicion(undefined)
  }

  async function definirPermisos() {
    setPermisos(await permisoUsuario(router.pathname))
  }

  useEffect(() => {
    definirPermisos().finally()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaAutenticado])

  useEffect(() => {
    if (estaAutenticado) obtenerCategoriasPeticion().finally(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    estaAutenticado,
    pagina,
    limite,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(ordenCriterios),
    filtroCategoria,
  ])

  useEffect(() => {
    if (!mostrarFiltroCategorias) {
      setFiltroCategoria('')
    }
  }, [mostrarFiltroCategorias])

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
        isOpen={mostrarAlertaEstadoCategoria}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
          categoriaEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } el parámetro: ${titleCase(categoriaEdicion?.categoria ?? '')} ?`}
      >
        <Button onClick={cancelarAlertaEstadoCategoria}>Cancelar</Button>
        <Button onClick={aceptarAlertaEstadoCategoria}>Aceptar</Button>
      </AlertDialog>
      <CustomDialog
        isOpen={modalCategoria}
        handleClose={cerrarModalCategoria}
        title={categoriaEdicion ? 'Editar categoria' : 'Nueva categoria'}
      >
        <VistaModalCategoria
          categoria={categoriaEdicion}
          accionCorrecta={() => {
            cerrarModalCategoria().finally()
            obtenerCategoriasPeticion().finally()
          }}
          accionCancelar={cerrarModalCategoria}
        />
      </CustomDialog>
      <LayoutUser title={`Categorias - ${siteName()}`}>
        <CustomDataTable
          titulo={'Categorias'}
          error={!!errorCategoriasData}
          cargando={loading}
          acciones={acciones}
          columnas={ordenCriterios}
          cambioOrdenCriterios={setOrdenCriterios}
          paginacion={paginacion}
          contenidoTabla={contenidoTabla}
          filtros={
            mostrarFiltroCategorias && (
              <FiltroCategorias
                filtroCategoria={filtroCategoria}
                accionCorrecta={(filtros) => {
                  setPagina(1)
                  setLimite(10)
                  setFiltroCategoria(filtros.categoria)
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
export default Categorias
