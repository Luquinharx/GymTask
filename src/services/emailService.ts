import type { User } from "../types"

// Este é um serviço simulado de email
// Em uma aplicação real, você usaria um serviço como SendGrid, Mailgun, etc.

export const sendWelcomeEmail = async (user: User, password: string): Promise<boolean> => {
  // Simular o envio de email
  console.log(`
    Enviando email para: ${user.email}
    Assunto: Bem-vindo ao GymTask - Suas credenciais de acesso
    
    Conteúdo:
    Olá ${user.name},
    
    Bem-vindo ao GymTask! Seu professor criou uma conta para você.
    
    Suas credenciais de acesso são:
    Email: ${user.email}
    Senha: ${password}
    
    Acesse o sistema em: https://gymtask.app
    
    Atenciosamente,
    Equipe GymTask
  `)

  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 500))

  return true
}

export const resendCredentialsEmail = async (user: User): Promise<boolean> => {
  // Simular o reenvio de credenciais
  console.log(`
    Reenviando credenciais para: ${user.email}
    Assunto: GymTask - Suas credenciais de acesso
    
    Conteúdo:
    Olá ${user.name},
    
    Conforme solicitado, aqui estão suas credenciais de acesso ao GymTask:
    
    Email: ${user.email}
    Senha: ${user.password || "[Senha oculta por segurança]"}
    
    Acesse o sistema em: https://gymtask.app
    
    Atenciosamente,
    Equipe GymTask
  `)

  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 500))

  return true
}
