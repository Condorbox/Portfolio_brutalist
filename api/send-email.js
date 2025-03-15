
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {

        const { nombre, email, mensaje } = req.body;
        
        const emailjsUserID = process.env.EMAILJS_USER_ID;
        const emailjsServiceID = process.env.EMAILJS_SERVICE_ID;
        const emailjsTemplateID = process.env.EMAILJS_TEMPLATE_ID;
        
        // TODO Send mail
        console.log("Send mail :D")
        
        return res.status(200).json({ message: 'Email enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar email:', error);
        return res.status(500).json({ error: 'Error al enviar el email' });
    }
}