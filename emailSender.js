const nodemailer = require('nodemailer');

// Create a transporter object using your email service provider's SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'swagylous@gmail.com', // Your email address
    pass: 'alix cgje nhdh jkcr', // Your email password or an application-specific password
  },
});

// Define your mail function
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'swagylous@gmail.com', // Sender's email address
    to, // Recipient's email address
    subject, // Email subject
    html: text, // Plain text body of the email
    // You can also use html key to send HTML formatted emails:
    // html: '<h1>Body of the email</h1>'
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error occurred: ', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendEmail;