/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardMedia, Divider, Modal, Typography } from '@mui/material';
import { EventoCRUDType } from '../types/eventosCRUDTypes';
import { useRouter } from 'next/router';
import { Servicios } from '../../../../common/services';
import { Constantes } from '../../../../config/Constantes';
import { imprimir } from '../../../../common/utils/imprimir';


const EventoCard: React.FC<EventoCRUDType> = (evento) => {
  const router = useRouter();
  const cartel = evento.cartel;
  const [eventosData, setEventosData] = useState<EventoCRUDType[]>([])
  const [errorEventosData, setErrorEventosData] = useState<any>()
  const [modalDetalle, setModalDetalle] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)

  const [eventoDetalle, setEventoDetalle] = useState<
    EventoCRUDType | undefined | null
  >()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { peticionHTTP } = Servicios

  const detalleEventoModal = (Evento: EventoCRUDType) => {
    setEventoDetalle(Evento)
    setModalDetalle(true)
  }

  const cerrarModalDetalle = async () => {
    setModalDetalle(false)
    setEventoDetalle(undefined)
  }

  const obtenerEventosPeticion = async () => {
    try {
      const respuesta = await peticionHTTP({
        url: `${Constantes.baseUrl}/eventos`,
      })
      setEventosData(respuesta.data.datos?.filas)
      setErrorEventosData(null)
    } catch (e) {
      imprimir(`Error al obtener Eventos`, e)
      setErrorEventosData(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    obtenerEventosPeticion()
      .catch(() => { })
      .finally(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formattedDate = new Date(evento.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',

  });
  return (
    <>
      <Card className="py-4" sx={{
        backgroundColor: '#F0F0F0', // Color de fondo
        borderRadius: '12px',
        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)', // Sombra
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', width: '100%', height: '270px' }}>
          {evento.cartel && (
            <img
              alt="Card background"
              className="object-cover rounded-t-xl"
              src={evento.cartel}
              style={{ width: '100%', height: '100%' }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo oscuro para el contenido
              color: 'white',
              borderRadius: '0 0 12px 12px',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {evento.nombre}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {evento.descripcion}
            </Typography>
            <Typography variant="body2">
              {evento.lugar}
            </Typography>
            <Button onClick={() => detalleEventoModal(evento)}>Mostrar Más</Button>
          </div>
        </div>
      </Card>
      {/* Modal */}

      <Modal open={modalDetalle} onClose={cerrarModalDetalle}>
  <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%', // Tamaño del modal
      maxWidth: '600px', // Máximo ancho del modal
      backgroundColor: '#f8f8f8', // Fondo gris claro
      padding: '1rem',
      borderRadius: '12px',
      outline: 'none',
      boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column', // Distribución vertical
    }}
  >
    {eventoDetalle && (
      <>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {eventoDetalle.nombre}
        </Typography>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <img
            alt="Card background"
            className="object-cover rounded-t-xl"
            src={evento.cartel}
            style={{ width: '100%', height: '100%' }}
          />
          <Typography variant="body2" sx={{ mt: 2 }}>
            {eventoDetalle.descripcion}
          </Typography>
        </div>
        <div>
          <Typography variant="body2">Lugar: {eventoDetalle.lugar}</Typography>
          <Typography variant="body2">Fecha: {formattedDate}</Typography>
          <Typography variant="body2">Enlace: {eventoDetalle.enlace}</Typography>
          <Typography variant="body2">Estado: {eventoDetalle.estado}</Typography>
        </div>
        <Button onClick={cerrarModalDetalle}>Cerrar</Button>
      </>
    )}
  </div>
</Modal>










    </>
  );
};

export default EventoCard;