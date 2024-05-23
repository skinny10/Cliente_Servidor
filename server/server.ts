import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { WebSocketServer, WebSocket } from 'ws';  // Importa los tipos WebSocket y WebSocketServer

const app = express();
const port = 3000;

app.use(bodyParser.json());

// definimos la estrcutura del objeto student, y declaramos atributos
interface Student {
    id: number;
    name: string;
    email: string;
    rfc: string;
    lastName: string;
    bloodType: string;
    semesters: number;
    subjectsPassed: number;
    subjectsFailed: number;
}

let students: Student[] = [];
let nextId = 1;

// CRUD endpoints
// aqui es donde podemos crear un nuevo estudiante
app.post('/students', (req: Request, res: Response) => {
    const student: Student = { ...req.body, id: nextId++ };
    students.push(student);
    res.status(201).json(student);
    notifyClients();
});

// obtenemos a los estudiantes, nos devuelve la lista de estudiantes
app.get('/students', (req: Request, res: Response) => {
    res.json(students);
});


// busca un estudiante por su  id y lo devulve y si no lo encuetra nos marcara un 404 de error
app.get('/students/:id', (req: Request, res: Response) => {
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (student) {
        res.json(student);
    } else {
        res.status(404).send('Student not found');
    }
});

// aqui actualiza la informacion de un estudiante especifico y notifica a los clientes websocket
app.put('/students/:id', (req: Request, res: Response) => {
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index !== -1) {
        students[index] = { ...students[index], ...req.body };
        res.json(students[index]);
        notifyClients();
    } else {
        res.status(404).send('Student not found');
    }
});

// aqui eliminamos un estudiante por su id, y notificamos
app.delete('/students/:id', (req: Request, res: Response) => {
    students = students.filter(s => s.id !== parseInt(req.params.id));
    res.status(204).send();
    notifyClients();
});


/**Este endpoint usa Long Polling para verificar si hay estudiantes en la lista cada segundo. 
* Si encuentra estudiantes, responde con la lista y detiene la verificación. */
// Long Polling endpoint
app.get('/long-polling', (req: Request, res: Response) => {
    const checkForUpdates = setInterval(() => {
        if (students.length > 0) {
            clearInterval(checkForUpdates);
            res.json(students);
        }
    }, 1000);  // Chequear cada segundo
});


// WebSocket setup
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const wss = new WebSocketServer({ server });  // Crea un nuevo WebSocketServer
wss.on('connection', (ws: WebSocket) => {  // Especifica el tipo WebSocket para ws
    ws.on('message', (message: string) => {  // Especifica el tipo string para message
        console.log('received: %s', message);
    });

    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server' }));
});

// Notify WebSocket clients
function notifyClients() {
    wss.clients.forEach((client: WebSocket) => {  // Especifica el tipo WebSocket para client
        if (client.readyState === WebSocket.OPEN) {  // Usa WebSocket.OPEN en lugar de 1
            client.send(JSON.stringify(students));
        }
    });
}

app.get('/api/students', (req: Request, res: Response) => {
    res.json(students);
  });

export default app;
