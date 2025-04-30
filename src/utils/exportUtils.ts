import html2canvas from "html2canvas"

export const exportElementAsImage = async (elementId: string, fileName: string): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId)
    if (!element) return false

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
    })

    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = fileName
    link.href = dataUrl
    link.click()

    return true
  } catch (error) {
    console.error("Erro ao exportar imagem:", error)
    return false
  }
}
