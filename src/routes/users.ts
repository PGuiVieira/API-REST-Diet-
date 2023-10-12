import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoute(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUsersBodySchema = z.object({
      name: z.string(),
    })
    const { name } = createUsersBodySchema.parse(request.body)
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/:id/metrics', async (request, reply) => {
    const getUsersParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getUsersParamsSchema.parse(request.params)
    const meals = await knex('meals')
      .where('userId', id)
      .select('*')
      .orderBy('created_at', 'asc')
    console.log(meals)
    /*
    - Quantidade total de refeições registradas []
    - Quantidade total de refeições dentro da dieta []
    - Quantidade total de refeições fora da dieta []
    - Melhor sequência de refeições dentro da dieta []
  */
    const metrics = {
      numberMeals: meals.length,
      totalMealInDiet: 0,
      totalMealOutDiet: 0,
      bestSequenceMealsInDiet: 0,
    }
    let countBestSequence: 0

    meals.forEach((meal) => {
      if (meal.includedInDiet === 1) {
        countBestSequence += 1
        metrics.totalMealInDiet += 1
        if (countBestSequence > metrics.bestSequenceMealsInDiet) {
          metrics.bestSequenceMealsInDiet = countBestSequence
        }
      } else if (meal.includedInDiet === 0) {
        metrics.totalMealOutDiet += 1
        countBestSequence = 0
      }
    })

    return { metrics }
  })
}
