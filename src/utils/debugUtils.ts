// Utilitário para ajudar na depuração de problemas de autenticação

export const logAuthState = (message: string, data?: any) => {
    console.log(`[AUTH] ${message}`, data || "")
  }
  
  export const logError = (context: string, error: any) => {
    console.error(`[ERROR] ${context}:`, error)
  
    // Se for um erro do Firebase, exibir detalhes específicos
    if (error && error.code) {
      console.error(`Firebase error code: ${error.code}`)
      console.error(`Firebase error message: ${error.message}`)
    }
  }
  