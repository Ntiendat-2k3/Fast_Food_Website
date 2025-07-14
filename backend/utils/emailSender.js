import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Function to send verification email
const sendVerificationEmail = async (toEmail, verificationCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Xác minh tài khoản của bạn - FastFoodWebsite",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ff6347;">Chào mừng bạn đến với FastFoodWebsite!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã xác minh sau để hoàn tất quá trình đăng ký:</p>
          <h3 style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; color: #ff6347;">
            ${verificationCode}
          </h3>
          <p>Mã này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ FastFoodWebsite</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${toEmail}`)
  } catch (error) {
    console.error(`Error sending verification email to ${toEmail}:`, error)
    throw new Error("Không thể gửi email xác minh. Vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau.")
  }
}

// Function to send password reset code
const sendPasswordResetCode = async (toEmail, resetCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Mã đặt lại mật khẩu của bạn - FastFoodWebsite",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ff6347;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
          <p>Vui lòng sử dụng mã sau để đặt lại mật khẩu:</p>
          <h3 style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; color: #ff6347;">
            ${resetCode}
          </h3>
          <p>Mã này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ FastFoodWebsite</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Password reset code sent to ${toEmail}`)
  } catch (error) {
    console.error(`Error sending password reset code to ${toEmail}:`, error)
    throw new Error("Không thể gửi mã đặt lại mật khẩu. Vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau.")
  }
}

export { sendVerificationEmail, sendPasswordResetCode }
