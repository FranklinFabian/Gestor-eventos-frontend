/// CRUD de parametros

export interface CategoriaCRUDType {
  id: string
  categoria: string
  descripcion: string
  cartel: string | null | Buffer 
  estado: string
}

export interface CrearEditarCategoriaCRUDType {
  id?: string
  categoria: string
  descripcion: string
  cartel: string | null | Buffer 
}
