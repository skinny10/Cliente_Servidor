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

document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentForm') as HTMLFormElement;
    const studentsList = document.getElementById('studentsList') as HTMLDivElement;

    studentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const student: Omit<Student, 'id'> = {
            name: (document.getElementById('name') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            rfc: (document.getElementById('rfc') as HTMLInputElement).value,
            lastName: (document.getElementById('lastName') as HTMLInputElement).value,
            bloodType: (document.getElementById('bloodType') as HTMLInputElement).value,
            semesters: parseInt((document.getElementById('semesters') as HTMLInputElement).value),
            subjectsPassed: parseInt((document.getElementById('subjectsPassed') as HTMLInputElement).value),
            subjectsFailed: parseInt((document.getElementById('subjectsFailed') as HTMLInputElement).value),
        };

        const response = await fetch('/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(student),
        });

        const newStudent = await response.json();
        renderStudent(newStudent);
    });

    function renderStudent(student: Student) {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'student';
        studentDiv.innerHTML = `
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>RFC:</strong> ${student.rfc}</p>
          <p><strong>Last Name:</strong> ${student.lastName}</p>
          <p><strong>Blood Type:</strong> ${student.bloodType}</p>
          <p><strong>Semesters:</strong> ${student.semesters}</p>
          <p><strong>Subjects Passed:</strong> ${student.subjectsPassed}</p>
          <p><strong>Subjects Failed:</strong> ${student.subjectsFailed}</p>
        `;
        studentsList.appendChild(studentDiv);
    }

    async function fetchStudents(): Promise<Student[]> {
        const response = await fetch('/api/students');
        return await response.json();
    }

    fetchStudents();

    // Short Polling implementation
    setInterval(async () => {
        const response = await fetch('/students');
        const students = await response.json() as Student[];
        studentsList.innerHTML = '';  // Limpiar la lista antes de volver a renderizar
        students.forEach(renderStudent);
    }, 5000);  // Cada 5 segundos

    // Long Polling implementation
    async function longPolling() {
        const response = await fetch('/long-polling');
        const students = await response.json() as Student[];
        studentsList.innerHTML = '';  // Limpiar la lista antes de volver a renderizar
        students.forEach(renderStudent);
        longPolling();  // Llamar de nuevo para seguir long-polling
    }

    longPolling();

    // WebSocket implementation
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
            console.log(data.message);
        } else {
            studentsList.innerHTML = '';  // Limpiar la lista antes de volver a renderizar
            data.forEach(renderStudent);
        }
    });
});
