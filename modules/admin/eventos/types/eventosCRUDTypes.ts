

export interface EventoCRUDType {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  lugar: string
  fecha: Date
  enlace: string
  cartel: string | null | Buffer 
  maxparticipantes: string
  estado: string
  idcategoria: string
  categoria: CategoriaType
}

export interface CrearEditarEventoCRUDType {
  id?: string
  codigo: string
  nombre: string
  descripcion: string
  lugar: string
  fecha: Date
  enlace: string
  cartel: string | null | Buffer 
  maxparticipantes: string
  idcategoria: string
  categoriaEvento: EventoCRUDType
}

export interface DetallesEventoType {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  lugar: string
  fecha: Date
  enlace: string
  imagen: string
  maxparticipantes: string
  estado: string
  idcategoria: string
}

export interface CategoriaType {
  id: string
  categoria: string
  descripcion: string
  cartel: string | null | Buffer 
}

export interface CategoriaCRUDType {
  id: string
  categoria: string
  descripcion: string
  cartel: string | null | Buffer 
}

export interface optionType {
  nombre: any
  key: string
  value: string
  label: string
}

