/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { Avatar, AvatarGroup, Button, Card, CardContent, CardHeader, CardMedia, Divider, Modal, Typography } from '@mui/material';

import { Servicios } from '../../../../common/services';
import { Constantes } from '../../../../config/Constantes';
import { imprimir } from '../../../../common/utils/imprimir';
import { ParticipanteCRUDType } from '../types/participantesCRUDTypes';
import { useAlerts, useSession } from '../../../../common/hooks';
import { useAuth } from '../../../../context/auth';
import { InterpreteMensajes } from '../../../../common/utils';

const ParticipanteCard: React.FC<ParticipanteCRUDType> = (participante) => {

  const [errorParticipantesData, setErrorParticipantesData] = useState<any>()
  const [modalDetalle, setModalDetalle] = useState(false)

  const { sesionPeticion } = useSession()
  const { estaAutenticado, permisoUsuario } = useAuth()

  const [participantesData, setParticipantesData] = useState<ParticipanteCRUDType[]>([])

  const { peticionHTTP } = Servicios

  const [openModal, setOpenModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);


  const { Alerta } = useAlerts()

  const obtenerParticipantesPeticion = async () => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/participantes`,

      })
      setParticipantesData(respuesta.datos?.filas)
    } catch (e) {
      imprimir(`Error al obtener participantes`, e)
      setErrorParticipantesData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {

    }
  }

  useEffect(() => {
    obtenerParticipantesPeticion()
      .catch(() => { })
      .finally(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          {/*
            {evento.cartel && (
              <img
                alt="Card background"
                className="object-cover rounded-t-xl"
                src={evento.cartel}
                style={{ width: '100%', height: '100%' }}
              />
            )}
            */}
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
              {participante.nombre}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {participante.correo}
            </Typography>
            <Typography variant="body2">
              {participante.evento}
            </Typography>
            <Typography variant="body2">
              {participante.idevento}
            </Typography>
            <Button onClick={}>
              mostar lista de participantes
            </Button>


            <AvatarGroup
              isBordered
              max={3}
              total={participantesData.length} // ¡Asegúrate de proporcionar el número correcto de participantes!
              renderCount={(count) => (
                <p className="text-small text-foreground font-medium ml-2">+{count} others</p>
              )}
            >
              <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
              <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
              {/* Agregar más avatares aquí */}
            </AvatarGroup>
            {/*<Button onClick={() => detalleEventoModal(evento)}>Mostrar Más</Button>*/}
          </div>
        </div>
      </Card>
      {/* Modal */}
    </>
  );
};

export default ParticipanteCard;