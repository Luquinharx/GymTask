import type { User } from "../types"
import emailjs from "@emailjs/browser"

// Configurações do EmailJS
const EMAILJS_SERVICE_ID = "Gymtask" // Substitua pelo seu Service ID
const EMAILJS_TEMPLATE_ID = "template_su5snrm" // Template ID fornecido
const EMAILJS_PUBLIC_KEY = "EbUCrzHz-KzDaIyBG" // Public Key da sua conta

// Enviar email de boas-vindas com credenciais
export const sendWelcomeEmail = async (user: User, password: string): Promise<boolean> => {
  try {
    console.log("Enviando email para:", user.email, "com senha:", password)

    // Usando EmailJS
    const templateParams = {
      to_name: user.name,
      to_email: user.email,
      user_email: user.email,
      user_password: password,
      app_name: "GymTask",
      app_url: window.location.origin || "https://gymtask.app",
    }

    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)

    console.log("Email enviado com sucesso:", response)
    return true
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    throw error
  }
}

// Reenviar credenciais
export const resendCredentialsEmail = async (user: User): Promise<boolean> => {
  try {
    // Usando EmailJS
    const templateParams = {
      to_name: user.name,
      to_email: user.email,
      user_email: user.email,
      app_name: "GymTask",
      app_url: window.location.origin || "https://gymtask.app",
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      "password_reset_template", // Template específico para redefinição de senha
      templateParams,
      EMAILJS_PUBLIC_KEY,
    )

    console.log(`Email de redefinição enviado com sucesso para ${user.email}`)
    return true
  } catch (error) {
    console.error("Erro ao enviar email de redefinição:", error)
    throw error
  }
}
