import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/users'
import { mealRoutes } from './routes/meals'

export const server = fastify()

server.register(cookie)

server.register(userRoutes, {
  prefix: 'users',
})

server.register(mealRoutes, {
  prefix: 'meals',
})
server
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('listening 3333')
  })
