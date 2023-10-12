import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealRoute(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        includedInDiet: z.boolean(),
      })
      const { name, description, includedInDiet } = createMealsBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        includedInDiet,
        created_at: new Date(),
        userId: user.id,
      })

      return reply.status(201).send()
    },
  )

  app.patch(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const getMealsParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const createMealsBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        includedInDiet: z.boolean().optional(),
      })

      const { name, description, includedInDiet } = createMealsBodySchema.parse(
        request.body,
      )

      await knex('meals').where('id', id).where('userId', user.id).update({
        name,
        description,
        includedInDiet,
      })
      return reply.status(204).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const meals = await knex('meals').where('userId', user.id).select('*')

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)
      const { sessionId } = request.cookies
      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const meal = await knex('meals')
        .where('id', id)
        .where('userId', user.id)
        .select('*')
        .first()

      if (!meal) {
        return reply.send('Meal not exist')
      }
      return { meal }
    },
  )
  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)
      const { sessionId } = request.cookies
      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      await knex('meals').where('id', id).where('userId', user.id).delete()

      return reply.status(200).send()
    },
  )
}
