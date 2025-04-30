import type { User, Exercise, Workout, WorkoutExercise } from "../types"
import { v4 as uuidv4 } from "uuid"

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "lucasmartinsa3009@gmail.com",
    password: "password",
    role: "admin",
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao@example.com",
    password: "password",
    role: "student",
  },
  {
    id: "3",
    name: "Maria Souza",
    email: "maria@example.com",
    password: "password",
    role: "student",
  },
  {
    id: "4",
    name: "Leonardo Martins",
    email: "silvaodaak@gmail.com",
    password: "leoleobr3",
    role: "student",
  },
]

// Mock Exercises
export const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Supino Reto",
    muscleGroup: "Peito",
    instructions: "Deite no banco, segure a barra com as mãos afastadas e empurre para cima.",
    imageUrl:
      "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
  },
  {
    id: "2",
    name: "Agachamento",
    muscleGroup: "Pernas",
    instructions: "Posicione a barra nos ombros, desça até as coxas ficarem paralelas ao chão.",
    imageUrl:
      "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
  },
  {
    id: "3",
    name: "Puxada Alta",
    muscleGroup: "Costas",
    instructions: "Segure a barra com as mãos afastadas, puxe até a barra tocar o peito.",
    imageUrl:
      "https://images.pexels.com/photos/4162452/pexels-photo-4162452.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    videoUrl: "https://www.youtube.com/embed/CAwf7n6Luuc",
  },
  {
    id: "4",
    name: "Rosca Direta",
    muscleGroup: "Bíceps",
    instructions: "Segure os halteres com os braços estendidos, dobre os cotovelos trazendo o peso para os ombros.",
    imageUrl:
      "https://images.pexels.com/photos/4162543/pexels-photo-4162543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    videoUrl: "https://www.youtube.com/embed/kwG2ipFRgfo",
  },
  {
    id: "5",
    name: "Tríceps Corda",
    muscleGroup: "Tríceps",
    instructions: "Segure a corda com as mãos, estenda os cotovelos empurrando para baixo.",
    imageUrl:
      "https://images.pexels.com/photos/4162529/pexels-photo-4162529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    videoUrl: "https://www.youtube.com/embed/kiuVA7g4nqw",
  },
]

// Mock Workout Exercises
const mockWorkoutExercises: Record<string, WorkoutExercise[]> = {
  "monday-user2": [
    {
      id: uuidv4(),
      exerciseId: "1",
      sets: 4,
      reps: 12,
      notes: "Descanse 60 segundos entre séries",
      completed: false,
    },
    {
      id: uuidv4(),
      exerciseId: "4",
      sets: 3,
      reps: 15,
      notes: "Mantenha a forma correta",
      completed: false,
    },
  ],
  "wednesday-user2": [
    {
      id: uuidv4(),
      exerciseId: "2",
      sets: 4,
      reps: 10,
      notes: "Foco na postura",
      completed: false,
    },
    {
      id: uuidv4(),
      exerciseId: "5",
      sets: 3,
      reps: 12,
      notes: "Movimento controlado",
      completed: false,
    },
  ],
  "friday-user2": [
    {
      id: uuidv4(),
      exerciseId: "3",
      sets: 4,
      reps: 10,
      notes: "Use carga moderada",
      completed: false,
    },
  ],
  "tuesday-user3": [
    {
      id: uuidv4(),
      exerciseId: "1",
      sets: 3,
      reps: 10,
      notes: "Aumentar carga em 2.5kg",
      completed: false,
    },
    {
      id: uuidv4(),
      exerciseId: "5",
      sets: 3,
      reps: 15,
      notes: "Foco na contração",
      completed: false,
    },
  ],
  "thursday-user3": [
    {
      id: uuidv4(),
      exerciseId: "2",
      sets: 4,
      reps: 12,
      notes: "Faça aquecimento adequado",
      completed: false,
    },
    {
      id: uuidv4(),
      exerciseId: "3",
      sets: 3,
      reps: 12,
      notes: "Movimento completo",
      completed: false,
    },
  ],
}

// Mock Workouts
export const mockWorkouts: Workout[] = [
  {
    id: uuidv4(),
    studentId: "2",
    dayOfWeek: "monday",
    exercises: mockWorkoutExercises["monday-user2"],
    completed: false,
  },
  {
    id: uuidv4(),
    studentId: "2",
    dayOfWeek: "wednesday",
    exercises: mockWorkoutExercises["wednesday-user2"],
    completed: false,
  },
  {
    id: uuidv4(),
    studentId: "2",
    dayOfWeek: "friday",
    exercises: mockWorkoutExercises["friday-user2"],
    completed: false,
  },
  {
    id: uuidv4(),
    studentId: "3",
    dayOfWeek: "tuesday",
    exercises: mockWorkoutExercises["tuesday-user3"],
    completed: false,
  },
  {
    id: uuidv4(),
    studentId: "3",
    dayOfWeek: "thursday",
    exercises: mockWorkoutExercises["thursday-user3"],
    completed: false,
  },
]

// Helper Functions
export const getExerciseById = (id: string): Exercise | undefined => {
  return mockExercises.find((exercise) => exercise.id === id)
}

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id)
}

export const getStudents = (): User[] => {
  return mockUsers.filter((user) => user.role === "student")
}
