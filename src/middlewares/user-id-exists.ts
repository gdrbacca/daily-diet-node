import { FastifyReply, FastifyRequest } from 'fastify'

export async function userIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.cookies.userID

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
