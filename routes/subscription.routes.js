export default async function subscriptionRoutes(fastify) {
    fastify.get('/', async (req, res) => res.send({ title: 'GET all subscriptions' }));
    fastify.get('/:id', async (req, res) => res.send({ title: 'Subscription detail route' }));
    fastify.post('/', async (req, res) => res.send({ title: 'CREATE new subscription' }));
    fastify.put('/:id', async (req, res) => res.send({ title: 'UPDATE subscription' }));
    fastify.delete('/:id', async (req, res) => res.send({ title: 'DELETE subscription' }));
    
    fastify.get('/user/:id', async (req, res) => res.send({ title: 'GET all subscriptions for a user' }));
    fastify.put('/:id/cancel', async (req, res) => res.send({ title: 'CANCEL subscription' }));
    fastify.put('/upcoming-renewals/:id', async (req, res) => res.send({ title: 'GET upcoming renewals for a subscription' }));
}