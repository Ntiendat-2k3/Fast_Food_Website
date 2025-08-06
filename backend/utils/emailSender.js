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

// Function to send staff notification
const sendStaffNotification = async (toEmail, staffName, title, message, type = "info") => {
  try {
    // Define colors and icons based on notification type
    const typeConfig = {
      info: { color: "#3b82f6", icon: "ℹ️", bgColor: "#eff6ff" },
      warning: { color: "#f59e0b", icon: "⚠️", bgColor: "#fffbeb" },
      success: { color: "#10b981", icon: "✅", bgColor: "#f0fdf4" },
      error: { color: "#ef4444", icon: "❌", bgColor: "#fef2f2" }
    }

    const config = typeConfig[type] || typeConfig.info

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `${config.icon} ${title} - FastFoodWebsite`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6347, #ff8c69); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">FastFoodWebsite</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: ${config.bgColor}; padding: 20px; border-radius: 8px; border-left: 4px solid ${config.color}; margin-bottom: 20px;">
              <h2 style="color: ${config.color}; margin: 0 0 10px 0; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">${config.icon}</span>
                ${title}
              </h2>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">Xin chào <strong>${staffName}</strong>,</p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">${message}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Thông báo này được gửi từ hệ thống quản lý FastFoodWebsite.<br>
                Thời gian: ${new Date().toLocaleString('vi-VN')}
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Trân trọng,<br>
                <strong>Đội ngũ FastFoodWebsite</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Staff notification sent to ${toEmail}`)
  } catch (error) {
    console.error(`Error sending staff notification to ${toEmail}:`, error)
    throw new Error("Không thể gửi thông báo. Vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau.")
  }
}

export { sendVerificationEmail, sendPasswordResetCode, sendStaffNotification }
