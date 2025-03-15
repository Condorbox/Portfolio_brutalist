import { EmailJSResponseStatus } from '@emailjs/browser';
import * as emailjs from '@emailjs/nodejs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
 
    try {        
        const emailjsUserID = process.env.EMAILJS_USER_ID;
        const emailjsServiceID = process.env.EMAILJS_SERVICE_ID;
        const emailjsTemplateID = process.env.EMAILJS_TEMPLATE_ID;
        const emailjsKey = process.env.EMAILJS_API_KEY;

        if (!emailjsUserID || !emailjsServiceID || !emailjsTemplateID) {
            console.error('Missing EmailJS credentials');
            return res.status(500).json({ error: 'Server configuration error' });
        }      
       
        emailjs.init({
            publicKey: emailjsUserID,
            privateKey: emailjsKey
        });
            
        const formData = req.body;
        const response = await emailjs.send(
            emailjsServiceID,
            emailjsTemplateID,
            formData
        );
     
        console.log('Email sent successfully', response);
        return res.status(200).json({ message: 'Email sent successfully', status: response.status });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
            error: 'Failed to send email',
            details: error instanceof EmailJSResponseStatus ? error.text : error.message
        });
    }
}