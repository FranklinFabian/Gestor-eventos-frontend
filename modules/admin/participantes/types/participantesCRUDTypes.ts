/// CRUD de parametros

export interface ParticipanteCRUDType {
  id: string
  nombre: string
  correo: string
  evento: string
  idevento: string
  estado: string
}

export interface CrearEditarParticipanteCRUDType {
  id?: string
  nombre: string
  evento: string
  idevento: string
  correo: string
}
