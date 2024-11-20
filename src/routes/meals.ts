import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { userIdExists } from '../middlewares/user-id-exists'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export async function mealRoutes(app: FastifyInstance) {
  // listar todas as refeições do usuário
  app.get('/', { preHandler: [userIdExists] }, async (request) => {
    const userId = request.cookies.userID
    const meals = await knex('meal').where('user_id', userId).select('*')

    return meals
  })

  // criar refeição
  app.post(
    '/create',
    { preHandler: [userIdExists] },
    async (request, reply) => {
      const schema = z.object({
        name: z.string(),
        description: z.string(),
        on_diet: z.boolean(),
      })

      const { name, description, on_diet } = schema.parse(request.body)
      const userId = request.cookies.userID
      const addMeal = await knex('meal').insert({
        id: randomUUID(),
        user_id: userId,
        name,
        description,
        on_diet,
      })

      return reply.status(201).send('Refeição criada')
    },
  )

  // atualizar refeição
  app.put('/:id', { preHandler: [userIdExists] }, async (request, reply) => {
    const schema = z.object({
      name: z.string(),
      description: z.string(),
      on_diet: z.boolean(),
    })

    const id = request.params.id
    const { name, description, on_diet } = schema.parse(request.body)
    const userId = request.cookies.userID

    const updateMeal = await knex('meal')
      .where('id', id)
      .where('user_id', userId)
      .update({
        name,
        description,
        on_diet,
        updated_at: new Date().toISOString(),
      })

    return reply.status(204).send('Refeição alterada')
  })

  // apagar refeição
  app.delete('/:id', { preHandler: [userIdExists] }, async (request, reply) => {
    const id = request.params.id

    const userId = request.cookies.userID

    await knex('meal').where('id', id).where('user_id', userId).delete()

    return reply.status(204).send('Refeição deletada')
  })

  // buscar refeição especifica
  app.get('/:id', { preHandler: [userIdExists] }, async (request) => {
    const id = request.params.id
    const userId = request.cookies.userID

    const meal = knex('meal').where('id', id).where('user_id', userId).select()

    return meal
  })

  // metricas do usuario
  app.get(
    '/metrics',
    { preHandler: [userIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userID

      const meals = await knex('meal').where('user_id', userId).select()
      const soma = meals.reduce(
        (prev, meal) => {
          const soma = prev
          if (meal.on_diet) {
            soma.on_diet += 1
            soma.sequence_counter += 1
          } else {
            soma.out_diet += 1
            soma.sequence_counter = 0
          }
          if (soma.sequence_counter > soma.sequence_on_diet)
            soma.sequence_on_diet = soma.sequence_counter

          return soma
        },
        {
          on_diet: 0,
          out_diet: 0,
          sequence_on_diet: 0,
          sequence_counter: 0,
        },
      )

      return {
        quantidade: meals.length,
        diet: {
          on_diet: soma.on_diet,
          out_diet: soma.out_diet,
          sequence_on_diet: soma.sequence_on_diet,
        },
      }
    },
  )
}
