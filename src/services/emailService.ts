import type { User } from "../types"

// Opção 1: Usando EmailJS
// Você precisará instalar: npm install @emailjs/browser
import emailjs from "@emailjs/browser"

// Opção 2: Usando Resend
// Você precisará instalar: npm install resend
// import { Resend } from 'resend'
// const resend = new Resend('re_123456789');

// Substitua as configurações do EmailJS com as credenciais fornecidas
const EMAILJS_SERVICE_ID = "Gymtask" // Substitua pelo seu Service ID quando tiver
const EMAILJS_TEMPLATE_ID = "template_su5snrm" // Template ID fornecido
const EMAILJS_PUBLIC_KEY = "EbUCrzHz-KzDaIyBG" // Public Key da sua conta

// Enviar email de boas-vindas com credenciais
export const sendWelcomeEmail = async (user: User, password: string): Promise<boolean> => {
  try {
    // Usando EmailJS
    const templateParams = {
      to_name: user.name,
      to_email: user.email,
      user_email: user.email,
      user_password: password,
      app_name: "GymTask",
      app_url: "https://gymtask.app",
    }

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)

    // Usando Resend (alternativa)
    /*
    await resend.emails.send({
      from: 'GymTask <onboarding@gymtask.app>',
      to: [user.email],
      subject: 'Bem-vindo ao GymTask - Suas credenciais de acesso',
      html: `
        <h1>Bem-vindo ao GymTask!</h1>
        <p>Olá ${user.name},</p>
        <p>Seu professor criou uma conta para você.</p>
        <p>Suas credenciais de acesso são:</p>
        <ul>
          <li>Email: ${user.email}</li>
          <li>Senha: ${password}</li>
        </ul>
        <p>Acesse o sistema em: <a href="https://gymtask.app">https://gymtask.app</a></p>
        <p>Atenciosamente,<br>Equipe GymTask</p>
      `
    });
    */

    console.log(`Email enviado com sucesso para ${user.email}`)
    return true
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return false
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
      app_url: "https://gymtask.app",
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
    return false
  }
}
