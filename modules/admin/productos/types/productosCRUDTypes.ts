/// CRUD de parametros

export interface ProductoCRUDType {
  id: string
  nombre: string
  cantidad: string
  precio: string
  estado: string
}

export interface CrearEditarProductoCRUDType {
  id?: string
  nombre: string
  cantidad: string
  precio: string
}
