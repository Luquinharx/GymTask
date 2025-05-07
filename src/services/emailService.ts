import type { User } from "../types"
import emailjs from "@emailjs/browser"

// Configurações do EmailJS com as credenciais corretas
const EMAILJS_SERVICE_ID = "Gymtask" // Service ID fornecido
const EMAILJS_TEMPLATE_ID = "template_su5snrm" // Template ID fornecido
const EMAILJS_PUBLIC_KEY = "EbUCrzHz-KzDalyBG" // Public Key fornecida

// Função para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Enviar email de boas-vindas com credenciais
export const sendWelcomeEmail = async (user: User, password: string): Promise<boolean> => {
  try {
    // Validar email antes de enviar
    if (!user.email || !isValidEmail(user.email)) {
      console.error("Email inválido ou vazio:", user.email)
      throw new Error("O endereço de email é inválido ou está vazio")
    }

    console.log("Enviando email para:", user.email, "com senha:", password)

    // Inicializar EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY)

    // Usando EmailJS com as credenciais corretas
    const templateParams = {
      to_name: user.name,
      to_email: user.email,
      user_email: user.email,
      user_password: password,
      app_name: "GymTask",
      app_url: window.location.origin || "https://gymtask.app",
      reply_to: "lucasmartinsa3009@gmail.com", // Adicionado campo reply_to
    }

    console.log("Parâmetros do template:", templateParams)

    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)

    console.log("Email enviado com sucesso:", response)
    return true
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    // Verificar se há erros específicos do EmailJS
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)

      // Sugestões para resolver problemas comuns
      if (error.message.includes("service_id")) {
        console.error("Verifique se o Service ID está correto e se o serviço está ativo no painel do EmailJS")
      } else if (error.message.includes("template_id")) {
        console.error("Verifique se o Template ID está correto e se o template está ativo no painel do EmailJS")
      } else if (error.message.includes("public_key")) {
        console.error("Verifique se a Public Key está correta")
      } else if (error.message.includes("network")) {
        console.error("Problema de rede. Verifique sua conexão com a internet")
      } else if (error.message.includes("recipient")) {
        console.error("Problema com o endereço do destinatário. Verifique se o email está correto")
      }
    }
    throw error
  }
}

// Reenviar credenciais
export const resendCredentialsEmail = async (user: User): Promise<boolean> => {
  try {
    // Validar email antes de enviar
    if (!user.email || !isValidEmail(user.email)) {
      throw new Error("O endereço de email é inválido ou está vazio")
    }

    // Inicializar EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY)

    // Usando EmailJS
    const templateParams = {
      to_name: user.name,
      to_email: user.email,
      user_email: user.email,
      app_name: "GymTask",
      app_url: window.location.origin || "https://gymtask.app",
      reply_to: "lucasmartinsa3009@gmail.com", // Adicionado campo reply_to
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID, // Usar o mesmo template para redefinição
      templateParams,
    )

    console.log(`Email de redefinição enviado com sucesso para ${user.email}`)
    return true
  } catch (error) {
    console.error("Erro ao enviar email de redefinição:", error)
    throw error
  }
}

// Enviar email de redefinição de senha
export const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
  try {
    // Validar email antes de enviar
    if (!email || !isValidEmail(email)) {
      throw new Error("O endereço de email é inválido ou está vazio")
    }

    // Inicializar EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY)

    // Usando EmailJS
    const templateParams = {
      to_email: email,
      app_name: "GymTask",
      app_url: window.location.origin || "https://gymtask.app",
      reply_to: "lucasmartinsa3009@gmail.com", // Adicionado campo reply_to
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      "template_password_reset", // Template específico para redefinição de senha
      templateParams,
    )

    console.log(`Email de redefinição de senha enviado com sucesso para ${email}`)
    return true
  } catch (error) {
    console.error("Erro ao enviar email de redefinição de senha:", error)
    throw error
  }
}

// Alternativas gratuitas para envio de email
export const getEmailAlternatives = (): string[] => {
  return [
    "EmailJS (gratuito até 200 emails/mês)",
    "SendGrid (gratuito até 100 emails/dia)",
    "Mailgun (gratuito para testes, depois pago)",
    "Amazon SES (muito barato, $0.10 por 1000 emails)",
    "Firebase Functions + Nodemailer (gratuito dentro dos limites do plano Spark)",
  ]
}

// Verificar configuração do EmailJS
export const checkEmailJSConfig = (): string[] => {
  const configChecks = [
    "Verifique se o Service ID está correto no painel do EmailJS",
    "Verifique se o Template ID está correto e se o template contém as variáveis corretas",
    "Verifique se a Public Key está correta",
    "Verifique se o serviço de email está configurado corretamente no painel do EmailJS",
    "Verifique se o domínio do seu site está na lista de domínios permitidos no painel do EmailJS",
    "Verifique se o template contém as variáveis {{to_name}}, {{to_email}}, {{user_email}}, {{user_password}}, {{app_name}} e {{app_url}}",
    "Verifique se o serviço de email está ativo e não está em modo de manutenção",
  ]

  return configChecks
}
