import type React from "react"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import type { Workout, Exercise } from "../../types"
import { daysOfWeekLabels } from "../../types"
import { Printer } from "lucide-react"

// Definir estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 5,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "bold",
    width: 100,
    color: "#4b5563",
  },
  infoValue: {
    fontSize: 12,
    color: "#1f2937",
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  exerciseCell: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  setsCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    textAlign: "center",
  },
  repsCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    textAlign: "center",
  },
  notesCell: {
    width: "30%",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#9ca3af",
  },
})

// Componente do PDF
const WorkoutPDF = ({
  workout,
  studentName,
  exercises,
}: {
  workout: Workout
  studentName: string
  exercises: Record<string, Exercise>
}) => {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>GymTask</Text>
            <Text style={styles.subtitle}>{workout.name || `Treino de ${daysOfWeekLabels[workout.dayOfWeek]}`}</Text>
          </View>
          {/* Logo */}
          <Image style={styles.logo} src="/logo.png" />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Aluno:</Text>
            <Text style={styles.infoValue}>{studentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dia:</Text>
            <Text style={styles.infoValue}>{daysOfWeekLabels[workout.dayOfWeek]}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{today}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.exerciseCell]}>Exercício</Text>
            <Text style={[styles.tableCell, styles.setsCell]}>Séries</Text>
            <Text style={[styles.tableCell, styles.repsCell]}>Repetições</Text>
            <Text style={[styles.tableCell, styles.notesCell]}>Observações</Text>
          </View>

          {workout.exercises.map((ex) => (
            <View key={ex.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.exerciseCell]}>
                {exercises[ex.exerciseId]?.name || "Exercício não encontrado"}
              </Text>
              <Text style={[styles.tableCell, styles.setsCell]}>{ex.sets}</Text>
              <Text style={[styles.tableCell, styles.repsCell]}>{ex.reps}</Text>
              <Text style={[styles.tableCell, styles.notesCell]}>{ex.notes || "-"}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Gerado por GymTask em {today} • www.gymtask.app • Todos os direitos reservados
        </Text>
      </Page>
    </Document>
  )
}

interface WorkoutPdfExportProps {
  workout: Workout
  studentName: string
  exercises: Record<string, Exercise>
  fileName?: string
}

const WorkoutPdfExport: React.FC<WorkoutPdfExportProps> = ({
  workout,
  studentName,
  exercises,
  fileName = "treino",
}) => {
  return (
    <PDFDownloadLink
      document={<WorkoutPDF workout={workout} studentName={studentName} exercises={exercises} />}
      fileName={`${fileName}-${daysOfWeekLabels[workout.dayOfWeek].toLowerCase()}.pdf`}
      className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
    >
      {({ loading }) =>
        loading ? (
          <>Preparando PDF...</>
        ) : (
          <>
            <Printer className="h-4 w-4 mr-1" />
            Exportar PDF
          </>
        )
      }
    </PDFDownloadLink>
  )
}

export default WorkoutPdfExport
