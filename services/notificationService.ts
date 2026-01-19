
/**
 * Notification Service for NexusHub
 * Handles Email (Resend) and WhatsApp (Evolution API)
 */

export interface NotificationPayload {
    to: string;
    subject?: string;
    message: string;
    type: 'email' | 'whatsapp';
}

class NotificationService {
    private resendApiKey: string = '';
    private evolutionApiUrl: string = '';
    private evolutionApiKey: string = '';
    private evolutionInstance: string = '';

    constructor() {
        // In a real app, these would come from the database/settings
        // For now, we use environment variables or default to empty
        this.resendApiKey = import.meta.env.VITE_RESEND_API_KEY || '';
        this.evolutionApiUrl = import.meta.env.VITE_EVOLUTION_API_URL || '';
        this.evolutionApiKey = import.meta.env.VITE_EVOLUTION_API_KEY || '';
        this.evolutionInstance = import.meta.env.VITE_EVOLUTION_INSTANCE || '';
    }

    async sendEmail(to: string, subject: string, html: string) {
        if (!this.resendApiKey) {
            console.warn('Resend API Key not configured.');
            return { success: false, message: 'API Key missing' };
        }

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.resendApiKey}`,
                },
                body: JSON.stringify({
                    from: 'NexusHub <notifications@nexushub.digital>',
                    to: [to],
                    subject: subject,
                    html: html,
                }),
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error sending email via Resend:', error);
            return { success: false, error };
        }
    }

    async sendWhatsApp(number: string, message: string) {
        if (!this.evolutionApiUrl || !this.evolutionApiKey || !this.evolutionInstance) {
            console.warn('Evolution API not fully configured.');
            return { success: false, message: 'Config missing' };
        }

        // Format number: remove non-digits
        const cleanNumber = number.replace(/\D/g, '');

        try {
            const response = await fetch(`${this.evolutionApiUrl}/message/sendText/${this.evolutionInstance}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.evolutionApiKey,
                },
                body: JSON.stringify({
                    number: cleanNumber,
                    options: {
                        delay: 1200,
                        presence: "composing",
                        linkPreview: false
                    },
                    textMessage: {
                        text: message
                    }
                }),
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error sending WhatsApp via Evolution:', error);
            return { success: false, error };
        }
    }

    /**
     * Send a welcome notification to a new client
     */
    async sendWelcomeMessage(clientName: string, email: string, phone?: string) {
        const emailSubject = `Bem-vindo ao NexusHub, ${clientName}!`;
        const emailHtml = `
            <h1>Olá, ${clientName}!</h1>
            <p>Seja bem-vindo ao portal do cliente da NexusHub Digital.</p>
            <p>Seu acesso já está liberado. Você pode acompanhar seus projetos, contratos e faturas através do link abaixo:</p>
            <a href="https://portal.nexushub.digital" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Acessar Portal</a>
            <p>Se tiver qualquer dúvida, basta responder a este e-mail.</p>
            <br>
            <p>Atenciosamente,<br>Equipe NexusHub</p>
        `;

        const waMessage = `Olá *${clientName}*! Seja bem-vindo à NexusHub Digital. 🚀\n\nSeu portal do cliente já está ativo. Acesse tudo por aqui: portal.nexushub.digital\n\nQualquer dúvida, conte conosco!`;

        const results = {
            email: await this.sendEmail(email, emailSubject, emailHtml),
            whatsapp: phone ? await this.sendWhatsApp(phone, waMessage) : { success: false, message: 'Phone not provided' }
        };

        return results;
    }
}

export const notificationService = new NotificationService();
