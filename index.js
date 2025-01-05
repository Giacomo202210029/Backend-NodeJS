const express = require('express');
const app = express();
const { swaggerUi, specs } = require('./swagger');

let morgan = require('morgan');

const cors = require('cors')

app.use(cors())

app.use(morgan('tiny'));

morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

// Configurar morgan con el formato tiny y agregar el token personalizado
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

let people = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

/**
 * @swagger
 * /api/people:
 *   get:
 *     summary: Retrieve a list of people
 *     responses:
 *       200:
 *         description: A list of people
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   number:
 *                     type: string
 */
app.get('/api/people', (request, response) => {
    response.json(people);
});


/**
 * @swagger
 * /info:
 *   get:
 *     summary: Retrieve information about the phonebook
 *     responses:
 *       200:
 *         description: Information about the phonebook
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */


app.get('/info', (request, response) => {
    const quantity = people.length
    const time = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'GMT',
        timeZoneName: 'short'
    });
    response.send(`
        <p>Phonebook has info for ${quantity} people</p>
        <p>${time}</p>
    `);
});
/**
 * @swagger
 * /api/people/{id}:
 *   get:
 *     summary: Retrieve a person by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the person to retrieve
 *     responses:
 *       200:
 *         description: A person object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 number:
 *                   type: string
 *       404:
 *         description: Person not found
 */
app.get('/api/people/:id', (request, response) => {
    const id = Number(request.params.id);

    const person = people.find(note => {
        console.log(note.id, typeof note.id, id, typeof id, note.id === id);
        return note.id === id;
    });
    if (person) {
        response.json(person)
    } else {
            response.status(404).end()
    }

});


/**
 * @swagger
 * /api/people/{id}:
 *   delete:
 *     summary: Delete a person by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the person to delete
 *     responses:
 *       204:
 *         description: Person deleted successfully
 *       404:
 *         description: Person not found
 */
app.delete('/api/people/:id', (request, response) => {
    const id = Number(request.params.id);
    people = people.filter(note => note.id !== id);

    response.status(204).end();
});


const generateId = () => {
    const maxId = people.length > 0
        ? Math.max(...people.map(n => n.id))
        : 0
    return maxId + 1
}

/**
 * @swagger
 * /api/people:
 *   post:
 *     summary: Add a new person
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Person added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 number:
 *                   type: string
 *       400:
 *         description: Content missing
 */
app.post('/api/people', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const existingname = people.find(person => {
        return person.name === body.name;
    });

    if(existingname){
        return response.status(400).json(
        { error: 'name must be unique' }
        )
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    people = people.concat(person)

    response.status(201).json(person)
})

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})