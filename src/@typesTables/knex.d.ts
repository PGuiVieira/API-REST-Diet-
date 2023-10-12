// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      session_id?: string
    }
    meals: {
      id: string
      name: string
      description: string
      created_at: Date
      includedInDiet: boolean
      userId: string
    }
  }
}
