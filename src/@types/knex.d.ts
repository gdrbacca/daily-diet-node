// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      created_at: Date
    }

    meal: {
      id: string
      user_id: string
      name: string
      description: string
      created_at: Date
      updated_at: Date
      on_diet: boolean
    }
  }
}
