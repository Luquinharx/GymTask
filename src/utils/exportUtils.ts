import html2canvas from "html2canvas"

export const exportElementAsImage = async (elementId: string, fileName: string): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId)
    if (!element) return false

    // Configurações melhoradas para html2canvas
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Escala maior para melhor qualidade
      useCORS: true, // Importante para imagens externas
      allowTaint: true,
      logging: false,
      imageTimeout: 0, // Sem timeout para imagens
      onclone: (clonedDoc) => {
        // Ajustar o clone para melhor renderização
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          clonedElement.style.width = "800px"
          clonedElement.style.padding = "20px"
          clonedElement.style.backgroundColor = "#ffffff"
          clonedElement.style.color = "#000000"
        }
      },
    })

    // Converter para PNG com qualidade máxima
    const dataUrl = canvas.toDataURL("image/png", 1.0)

    // Criar um link para download
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
