import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function userRoutes(app: FastifyInstance) {
  // buscar todos usuarios
  app.get('/', async () => {
    const users = await knex('users').select('*')

    return users
  })

  // criar usuario
  app.post('/create', async (request, reply) => {
    const userId = request.cookies.userID

    const userSchema = z.object({
      name: z.string(),
    })

    const { name } = userSchema.parse(request.body)

    const user = await knex('users')
      .insert({
        id: randomUUID(),
        name,
      })
      .returning('*')

    if (!userId) {
      const userId = user[0].id
      reply.cookie('userID', userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return reply.status(200).send('Usuário criado')
    /* if (!userID) {
      return reply.status(500).send('Usuário não logado')
    } else return reply.status(200).send(userID) */
  })

  // só um jeitinho de trocar usuario, no cookie fica o userId
  app.post('/login/:name', async (request, reply) => {
    const userSchema = z.object({
      name: z.string(),
    })
    const { name } = userSchema.parse(request.params)

    const user = await knex('users').where('name', name).select().first()

    if (!user) {
      return reply.status(404).send({
        error: 'Usuario não encontrado',
      })
    }

    reply.cookie('userID', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(200).send(`Usuário conectado: ${name}`)
  })
}
