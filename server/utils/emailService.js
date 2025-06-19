const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendLeaveStatusEmail = async (employeeEmail, status, startDate, endDate) => {
    try {
        const statusText = status === 'Approuve' ? 'approuvée' : 'refusée';
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: employeeEmail,
            subject: `Mise à jour de votre demande de congé`,
            html: `
                <h2>Mise à jour de votre demande de congé</h2>
                <p>Votre demande de congé a été ${statusText}.</p>
                <p><strong>Détails :</strong></p>
                <ul>
                    <li>Date de début : ${new Date(startDate).toLocaleDateString('fr-FR')}</li>
                    <li>Date de fin : ${new Date(endDate).toLocaleDateString('fr-FR')}</li>
                    <li>Statut : ${statusText}</li>
                </ul>
                <p>Vous pouvez consulter les détails dans votre espace personnel.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendLeaveStatusEmail
};
