/* eslint-disable @next/next/no-img-element */
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { formatoFecha } from '../../../../common/utils/fechas';
import { CategoriaCRUDType } from '../types/categoriasCRUDTypes';


interface CategoriaCardProps extends CategoriaCRUDType {
  onClick: () => void; // Agrega la propiedad onClick aquí
}

const CategoriaCard: React.FC<CategoriaCRUDType> = (categoria) => {
  const router = useRouter();
  const cartel = categoria.cartel;
  const handleCardClick = () => {
    router.push(`/gestion/evento/detalles/${categoria.id}`);
  };

  return (
    <Card className="col-span-12 sm:col-span-4 h-[400px]" sx={{
      position: 'relative',
      borderRadius: '12px',
      boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.5)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      overflow: 'visible',
      backgroundImage: `url(${cartel})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <CardContent className="absolute bottom-0 left-0 p-4 text-white">
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
          {categoria.categoria}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: 'white' }}>
          {categoria.descripcion}
        </Typography>
      </CardContent>
    </Card>  
  );
}

export default CategoriaCard;
