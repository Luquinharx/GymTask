"use client"

import type React from "react"
import { type Workout, type Exercise, daysOfWeekLabels } from "../../types"
import { FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

interface WorkoutExcelExportProps {
  workout: Workout
  studentName: string
  exercises: Record<string, Exercise>
  fileName?: string
}

const WorkoutExcelExport: React.FC<WorkoutExcelExportProps> = ({
  workout,
  studentName,
  exercises,
  fileName = "treino",
}) => {
  const handleExport = () => {
    // Criar dados para o Excel
    const workoutData = [
      ["GymTask - Planilha de Treino"],
      [],
      ["Aluno:", studentName],
      ["Dia:", daysOfWeekLabels[workout.dayOfWeek]],
      ["Treino:", workout.name || `Treino de ${daysOfWeekLabels[workout.dayOfWeek]}`],
      ["Data:", new Date().toLocaleDateString("pt-BR")],
      [],
      ["Exercício", "Séries", "Repetições", "Observações"],
      ...workout.exercises.map((ex) => [
        exercises[ex.exerciseId]?.name || "Exercício não encontrado",
        ex.sets,
        ex.reps,
        ex.notes || "",
      ]),
    ]

    // Criar planilha
    const ws = XLSX.utils.aoa_to_sheet(workoutData)

    // Estilizar células
    const headerStyle = {
      font: { bold: true, sz: 14 },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center" },
    }

    // Aplicar estilos (XLSX-Style seria necessário para estilos mais avançados)
    ws["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 40 }]

    // Criar workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Treino")

    // Exportar para arquivo
    XLSX.writeFile(wb, `${fileName}-${daysOfWeekLabels[workout.dayOfWeek].toLowerCase()}.xlsx`)
  }

  return (
    <button
      onClick={handleExport}
      className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
    >
      <FileSpreadsheet className="h-4 w-4 mr-1" />
      Exportar Excel
    </button>
  )
}

export default WorkoutExcelExport
