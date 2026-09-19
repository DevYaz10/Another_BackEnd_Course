export default async function userRoutes(fastify) {
    fastify.get('/', async (req, res) => res.send({ title: 'GET all users' }));
    fastify.get('/:id', async (req, res) => res.send({ title: 'User detail route' }));
    fastify.post('/', async (req, res) => res.send({ title: 'CREATE new user' }));
    fastify.put('/:id', async (req, res) => res.send({ title: 'UPDATE user' }));
    fastify.delete('/:id', async (req, res) => res.send({ title: 'DELETE user' }));
}