const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "bernardo.zieme32@ethereal.email",
    pass: "u1m5gE9xaxePc75Svf",
  },
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationMail = async (email, firstName, code) => {
  const mailOptions = {
    from: `"Servily" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Servily account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px;">
        <h2>Welcome to Servily, ${firstName}!</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 5px;">
          <strong>${code}</strong>
        </div>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateVerificationCode,
  sendVerificationMail,
};
