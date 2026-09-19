export default async function authRoutes(fastify) {
  fastify.post('/sign-up', async (req, res) => res.send({ message: 'Sign-up route' }));
  fastify.post('/sign-in', async (req, res) => res.send({ message: 'Sign-in route' }));
  fastify.post('/sign-out', async (req, res) => res.send({ message: 'Sign-out route' }));
}