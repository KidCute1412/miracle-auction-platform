import nodemailer from "nodemailer";

const formatVndForEmail = (value: number | bigint | string): string => BigInt(value).toLocaleString("vi-VN");

// Create transporter once and reuse
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use false for STARTTLS; true for SSL on port 465
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendMail = async (email: string, title: string, content: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: {
        name: 'Hệ Thống Đấu Giá Trực Tuyến',
        address: process.env.GMAIL_ADDRESS || ''
      },
      to: email,
      subject: title,
      html: content,
      text: content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Online Auction Mailer',
        'Importance': 'normal'
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[✓] Email sent to ${email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`[✗] Failed to send email to ${email}:`, error);
    return false;
  }
};




// ============================================
// AUCTION END EMAIL TEMPLATES
// ============================================

interface EmailTemplateParams {
  productName: string;
  productLink: string;
  finalPrice: number | bigint;
  winnerName?: string;
  sellerName?: string;
}

// Winner Email Template
export const getWinnerEmailTemplate = (params: EmailTemplateParams): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 40px 30px; border: 1px solid #e5e5e5; }
    .badge { display: inline-block; background: #10b981; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .product-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .product-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .price { font-size: 32px; font-weight: bold; color: #667eea; margin: 15px 0; }
    .button { display: inline-block; background: #667eea; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .info-text { color: #6b7280; font-size: 14px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Chúc mừng bạn đã thắng đấu giá!</h1>
    </div>
    <div class="content">
      <div class="badge">NGƯỜI THẮNG</div>
      <p>Bạn đã thắng đấu giá sản phẩm:</p>
      
      <div class="product-info">
        <div class="product-name">${params.productName}</div>
        <div class="price">${params.finalPrice.toLocaleString('vi-VN')} VNĐ</div>
      </div>

      <p class="info-text">Vui lòng hoàn tất thanh toán trong vòng 48 giờ để hoàn tất giao dịch. Không thanh toán đúng hạn có thể dẫn đến hủy đơn hàng.</p>

      <a href="${params.productLink}" class="button">Xem chi tiết sản phẩm</a>

      <p class="info-text">Sau khi xác nhận thanh toán, người bán sẽ liên hệ với bạn để sắp xếp giao hàng.</p>

      <p style="margin-top: 30px;">Cảm ơn bạn đã tham gia đấu giá!</p>
    </div>
    <div class="footer">
      <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
      <p>&copy; 2026 Hệ thống đấu giá trực tuyến. Bảo lưu mọi quyền.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Seller Email Template - With Winner
export const getSellerWithWinnerEmailTemplate = (params: EmailTemplateParams): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 40px 30px; border: 1px solid #e5e5e5; }
    .badge { display: inline-block; background: #3b82f6; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .product-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .product-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { color: #6b7280; font-weight: 500; }
    .info-value { color: #1f2937; font-weight: bold; }
    .price { font-size: 28px; color: #10b981; }
    .button { display: inline-block; background: #10b981; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #059669; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Đấu giá kết thúc thành công</h1>
    </div>
    <div class="content">
      <div class="badge">ĐÃ BÁN</div>
      <p>Tin vui! Sản phẩm của bạn đã được bán thành công.</p>
      
      <div class="product-info">
        <div class="product-name">${params.productName}</div>
        <div class="info-row">
          <span class="info-label">Người thắng</span>
          <span class="info-value">${params.winnerName}</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Giá cuối cùng</span>
          <span class="info-value price">${params.finalPrice.toLocaleString('vi-VN')} VNĐ</span>
        </div>
      </div>

      <p><strong>Các bước tiếp theo:</strong></p>
      <ul style="color: #6b7280; line-height: 2;">
        <li>Chờ người mua hoàn tất thanh toán (trong 48 giờ)</li>
        <li>Chuẩn bị sản phẩm để giao hàng</li>
        <li>Liên hệ người mua để sắp xếp giao hàng</li>
      </ul>

      <a href="${params.productLink}" class="button">Xem chi tiết sản phẩm</a>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Bạn sẽ được thông báo khi người mua hoàn tất thanh toán.</p>
    </div>
    <div class="footer">
      <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
      <p>&copy; 2026 Hệ thống đấu giá trực tuyến. Bảo lưu mọi quyền.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Seller Email Template - No Winner
export const getSellerNoWinnerEmailTemplate = (params: EmailTemplateParams): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 40px 30px; border: 1px solid #e5e5e5; }
    .badge { display: inline-block; background: #6b7280; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .product-info { background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .product-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .button { display: inline-block; background: #f59e0b; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #d97706; }
    .info-text { color: #6b7280; font-size: 14px; line-height: 1.8; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Đấu giá đã kết thúc</h1>
    </div>
    <div class="content">
      <div class="badge">KHÔNG CÓ NGƯỜI THẮNG</div>
      <p>Phiên đấu giá của bạn đã kết thúc, nhưng rất tiếc không có người đặt giá thành công.</p>
      
      <div class="product-info">
        <div class="product-name">${params.productName}</div>
      </div>

      <p class="info-text"><strong>Nguyên nhân có thể:</strong></p>
      <ul class="info-text">
        <li>Giá khởi điểm có thể quá cao</li>
        <li>Mô tả hoặc hình ảnh sản phẩm cần cải thiện</li>
        <li>Cân nhắc đăng lại với điều khoản phù hợp hơn</li>
      </ul>

      <a href="${params.productLink}" class="button">Xem chi tiết sản phẩm</a>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Bạn có thể đăng lại sản phẩm này hoặc liên hệ hỗ trợ để được tư vấn.</p>
    </div>
    <div class="footer">
      <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
      <p>&copy; 2026 Hệ thống đấu giá trực tuyến. Bảo lưu mọi quyền.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Loser Email Template
export const getLoserEmailTemplate = (params: EmailTemplateParams): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 40px 30px; border: 1px solid #e5e5e5; }
    .product-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .product-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .price { font-size: 24px; font-weight: bold; color: #64748b; margin: 10px 0; }
    .button { display: inline-block; background: #3b82f6; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #2563eb; }
    .info-text { color: #6b7280; font-size: 14px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Đấu giá đã kết thúc</h1>
    </div>
    <div class="content">
      <p>Cảm ơn bạn đã tham gia đấu giá cho sản phẩm:</p>
      
      <div class="product-info">
        <div class="product-name">${params.productName}</div>
        <p class="info-text">Giá thắng cuối cùng:</p>
        <div class="price">${params.finalPrice.toLocaleString('vi-VN')} VNĐ</div>
      </div>

      <p>Rất tiếc, giá đặt của bạn không phải cao nhất. Nhưng đừng lo, còn rất nhiều sản phẩm tuyệt vời khác!</p>

      <a href="${params.productLink}" class="button">Khám phá sản phẩm tương tự</a>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Tiếp tục tham gia và bạn có thể thắng ở phiên đấu giá tiếp theo!</p>
    </div>
    <div class="footer">
      <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
      <p>&copy; 2026 Hệ thống đấu giá trực tuyến. Bảo lưu mọi quyền.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// ========================================== Auction Question and Answer Templates =========================================

export function sendBidderQuestionTemplate ({
  seller_username,
  product_name, 
  content,
  productUrl,
} : {
  seller_username: string;
  product_name: string;
  content: string;
  productUrl: string;

})
{

  return `
    <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f4f8;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <!-- Main Container -->
                            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                                
                                <!-- Header with gradient -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #6dd5b8 0%, #52b69a 100%); padding: 32px 40px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">
                                            Câu hỏi mới về sản phẩm
                                        </h1>
                                    </td>
                                </tr>
                                
                                <!-- Content Body -->
                                <tr>
                                    <td style="padding: 40px 40px 30px;">
                                        <p style="margin: 0 0 20px; color: #2c3e50; font-size: 16px; line-height: 1.6;">
                                            Xin chào <strong style="color: #34495e;">${seller_username}</strong>
                                        </p>
                                        
                                        <p style="margin: 0 0 24px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                            Bạn có một câu hỏi mới về sản phẩm:
                                        </p>
                                        
                                        <!-- Product Name Badge -->
                                        <div style="background: linear-gradient(135deg, #e8f5f1 0%, #d4ede5 100%); border-left: 4px solid #52b69a; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                                            <p style="margin: 0; color: #1a5f4d; font-size: 15px; font-weight: 600;">
                                                ${product_name}
                                            </p>
                                        </div>
                                        
                                        <!-- Question Box -->
                                        <div style="background-color: #fafbfc; border: 1px solid #e1e8ed; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                                            <p style="margin: 0 0 8px; color: #7f8c8d; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                                Nội dung câu hỏi
                                            </p>
                                            <p style="margin: 0; color: #2c3e50; font-size: 15px; line-height: 1.7; font-style: italic;">
                                                "${content}"
                                            </p>
                                        </div>
                                        
                                        <p style="margin: 0 0 28px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                            Vui lòng trả lời câu hỏi này để tương tác tốt hơn với khách hàng của bạn.
                                        </p>
                                        
                                        <!-- CTA Button -->
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 0 0 28px;">
                                                    <a href="${productUrl}" style="display: inline-block; background: linear-gradient(135deg, #6dd5b8 0%, #52b69a 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(82, 182, 154, 0.3); transition: all 0.3s;">
                                                        Xem sản phẩm và trả lời
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Alternative Link -->
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 0;">
                                            <p style="margin: 0 0 8px; color: #7f8c8d; font-size: 13px;">
                                                Hoặc sao chép đường link sau:
                                            </p>
                                            <p style="margin: 0; word-break: break-all;">
                                                <a href="${productUrl}" style="color: #52b69a; font-size: 13px; text-decoration: none;">${productUrl}</a>
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 28px 40px; border-top: 1px solid #e9ecef;">
                                        <p style="margin: 0 0 8px; color: #95a5a6; font-size: 14px; line-height: 1.5;">
                                            Trân trọng,
                                        </p>
                                        <p style="margin: 0; color: #2c3e50; font-size: 15px; font-weight: 600;">
                                            Đội ngũ Online Auction (Miracle)
                                        </p>
                                        <p style="margin: 16px 0 0; color: #95a5a6; font-size: 12px; line-height: 1.5;">
                                            Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                                        </p>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
  `;
}

// ============================================
// BUY NOW SUCCESS EMAIL TEMPLATE
// ============================================

export function getBuyNowSuccessTemplate({
  buyer_username,
  product_name,
  product_link,
  buy_now_price,
}: {
  buyer_username: string;
  product_name: string;
  product_link: string;
  buy_now_price: number | bigint | string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f4f8;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Main Container -->
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                        
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">
                                    Mua hàng thành công
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content Body -->
                        <tr>
                            <td style="padding: 40px 40px 30px;">
                                <p style="margin: 0 0 20px; color: #2c3e50; font-size: 16px; line-height: 1.6;">
                                    Xin chào <strong style="color: #34495e;">${buyer_username}</strong>
                                </p>
                                
                                <p style="margin: 0 0 24px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                    Bạn đã mua thành công sản phẩm:
                                </p>
                                
                                <!-- Product Name Badge -->
                                <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                                    <p style="margin: 0; color: #064e3b; font-size: 15px; font-weight: 600;">
                                        ${product_name}
                                    </p>
                                </div>
                                
                                <!-- Price Information -->
                                <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 24px; margin-bottom: 28px; text-align: center;">
                                    <p style="margin: 0 0 12px; color: #065f46; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                        Giá mua
                                    </p>
                                    <p style="margin: 0; color: #047857; font-size: 32px; font-weight: 700; line-height: 1.2;">
                                        ${formatVndForEmail(buy_now_price)} VNĐ
                                    </p>
                                </div>
                                
                                <!-- Information Box -->
                                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 28px;">
                                    <p style="margin: 0 0 12px; color: #78350f; font-size: 14px; line-height: 1.7;">
                                        <strong>Các bước tiếp theo:</strong>
                                    </p>
                                    <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                                        <li>Vui lòng hoàn tất thanh toán trong vòng 48 giờ</li>
                                        <li>Người bán sẽ liên hệ với bạn để sắp xếp giao hàng</li>
                                        <li>Kiểm tra kỹ sản phẩm khi nhận hàng</li>
                                    </ul>
                                </div>
                                
                                <!-- Success Message -->
                                <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                                    <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.7; text-align: center;">
                                        Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã tin tùng và mua sắm tại Online Auction!
                                    </p>
                                </div>
                                
                                <!-- CTA Button -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 0 0 28px;">
                                            <a href="${product_link}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); transition: all 0.3s;">
                                                Xem chi tiết đơn hàng
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Alternative Link -->
                                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 0;">
                                    <p style="margin: 0 0 8px; color: #7f8c8d; font-size: 13px;">
                                        Hoặc sao chép đường link sau:
                                    </p>
                                    <p style="margin: 0; word-break: break-all;">
                                        <a href="${product_link}" style="color: #10b981; font-size: 13px; text-decoration: none;">${product_link}</a>
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 28px 40px; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 8px; color: #95a5a6; font-size: 14px; line-height: 1.5;">
                                    Trân trọng,
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 15px; font-weight: 600;">
                                    Đội ngũ Online Auction (Miracle)
                                </p>
                                <p style="margin: 16px 0 0; color: #95a5a6; font-size: 12px; line-height: 1.5;">
                                    Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}

// ============================================
// BID SUCCESS EMAIL TEMPLATE
// ============================================

export function getBidSuccessTemplate({
  bidder_username,
  product_name,
  product_link,
  max_price,
  current_price,
}: {
  bidder_username: string;
  product_name: string;
  product_link: string;
  max_price: number | bigint | string;
  current_price: number | bigint | string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f4f8;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Main Container -->
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                        
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">
                                    Đặt giá thành công
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content Body -->
                        <tr>
                            <td style="padding: 40px 40px 30px;">
                                <p style="margin: 0 0 20px; color: #2c3e50; font-size: 16px; line-height: 1.6;">
                                    Xin chào <strong style="color: #34495e;">${bidder_username}</strong>
                                </p>
                                
                                <p style="margin: 0 0 24px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                    Bạn đã đặt giá thành công cho sản phẩm:
                                </p>
                                
                                <!-- Product Name Badge -->
                                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                                    <p style="margin: 0; color: #1e3a8a; font-size: 15px; font-weight: 600;">
                                        ${product_name}
                                    </p>
                                </div>
                                
                                <!-- Price Information -->
                                <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 24px; margin-bottom: 28px;">
                                    <div style="margin-bottom: 20px;">
                                        <p style="margin: 0 0 8px; color: #0369a1; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                            Giá tối đa của bạn
                                        </p>
                                        <p style="margin: 0; color: #0c4a6e; font-size: 24px; font-weight: 700; line-height: 1.2;">
                                            ${formatVndForEmail(max_price)} VNĐ
                                        </p>
                                    </div>
                                    
                                    <div style="border-top: 1px solid #bae6fd; padding-top: 20px;">
                                        <p style="margin: 0 0 8px; color: #0369a1; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                            Giá hiện tại của sản phẩm
                                        </p>
                                        <p style="margin: 0; color: #10b981; font-size: 24px; font-weight: 700; line-height: 1.2;">
                                            ${formatVndForEmail(current_price)} VNĐ
                                        </p>
                                    </div>
                                </div>
                                
                                <!-- Information Box -->
                                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 28px;">
                                    <p style="margin: 0 0 12px; color: #065f46; font-size: 14px; line-height: 1.7;">
                                        <strong>Lưu ý quan trọng:</strong>
                                    </p>
                                    <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
                                        <li>Hệ thống sẽ tự động đấu giá cho bạn đến mức giá tối đa</li>
                                        <li>Bạn sẽ nhận thông báo khi có người đặt giá cao hơn</li>
                                        <li>Theo dõi phiên đấu giá để cập nhật tình hình mới nhất</li>
                                    </ul>
                                </div>
                                
                                <p style="margin: 0 0 28px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                    Chúc bạn may mắn trong phiên đấu giá này!
                                </p>
                                
                                <!-- CTA Button -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 0 0 28px;">
                                            <a href="${product_link}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); transition: all 0.3s;">
                                                Theo dõi phiên đấu giá
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Alternative Link -->
                                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 0;">
                                    <p style="margin: 0 0 8px; color: #7f8c8d; font-size: 13px;">
                                        Hoặc sao chép đường link sau:
                                    </p>
                                    <p style="margin: 0; word-break: break-all;">
                                        <a href="${product_link}" style="color: #3b82f6; font-size: 13px; text-decoration: none;">${product_link}</a>
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 28px 40px; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 8px; color: #95a5a6; font-size: 14px; line-height: 1.5;">
                                    Trân trọng,
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 15px; font-weight: 600;">
                                    Đội ngũ Online Auction (Miracle)
                                </p>
                                <p style="margin: 16px 0 0; color: #95a5a6; font-size: 12px; line-height: 1.5;">
                                    Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}

// ============================================
// BIDDER BANNED EMAIL TEMPLATE
// ============================================

export function getBidderBannedTemplate({
  bidder_username,
  seller_username,
  product_name,
  product_link,
  reason,
}: {
  bidder_username: string;
  seller_username: string;
  product_name: string;
  product_link: string;
  reason?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f4f8;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Main Container -->
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                        
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">
                                    Thông báo cấm đấu giá
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content Body -->
                        <tr>
                            <td style="padding: 40px 40px 30px;">
                                <p style="margin: 0 0 20px; color: #2c3e50; font-size: 16px; line-height: 1.6;">
                                    Xin chào <strong style="color: #34495e;">${bidder_username}</strong>
                                </p>
                                
                                <p style="margin: 0 0 24px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                    Rất tiếc thông báo rằng bạn đã bị người bán <strong style="color: #dc2626;">${seller_username}</strong> cấm tham gia đấu giá sản phẩm:
                                </p>
                                
                                <!-- Product Name Badge -->
                                <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #dc2626; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                                    <p style="margin: 0; color: #7f1d1d; font-size: 15px; font-weight: 600;">
                                        ${product_name}
                                    </p>
                                </div>
                                
                                ${
                                  reason
                                    ? `
                                <!-- Reason Box -->
                                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                                    <p style="margin: 0 0 8px; color: #991b1b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                        Lý do
                                    </p>
                                    <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.7;">
                                        ${reason}
                                    </p>
                                </div>
                                `
                                    : ""
                                }
                                
                                <!-- Information Box -->
                                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 28px;">
                                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.7;">
                                        <strong>Điều này có nghĩa là:</strong>
                                    </p>
                                    <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                                        <li>Bạn không thể đặt giá cho sản phẩm này nữa</li>
                                        <li>Các lượt đấu giá trước đó của bạn sẽ bị hủy</li>
                                        <li>Bạn vẫn có thể tham gia đấu giá các sản phẩm khác</li>
                                    </ul>
                                </div>
                                
                                <p style="margin: 0 0 28px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                    Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ với người bán hoặc đội ngũ hỗ trợ của chúng tôi.
                                </p>
                                
                                <!-- CTA Button -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 0 0 28px;">
                                            <a href="${product_link}" style="display: inline-block; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(107, 114, 128, 0.3); transition: all 0.3s;">
                                                Xem chi tiết sản phẩm
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Alternative Link -->
                                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 0;">
                                    <p style="margin: 0 0 8px; color: #7f8c8d; font-size: 13px;">
                                        Hoặc sao chép đường link sau:
                                    </p>
                                    <p style="margin: 0; word-break: break-all;">
                                        <a href="${product_link}" style="color: #6b7280; font-size: 13px; text-decoration: none;">${product_link}</a>
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 28px 40px; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 8px; color: #95a5a6; font-size: 14px; line-height: 1.5;">
                                    Trân trọng,
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 15px; font-weight: 600;">
                                    Đội ngũ Online Auction (Miracle)
                                </p>
                                <p style="margin: 16px 0 0; color: #95a5a6; font-size: 12px; line-height: 1.5;">
                                    Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}

export function sendSellerAnswerTemplate ({
  bidder_username,
  seller_username,
  product_name,
  bidder_question,
  content,
  productUrl,
} :
{
  bidder_username: string;
  seller_username: string;
  product_name: string;
  bidder_question: string;
  content: string;
  productUrl: string;
})
{
  return `
    <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f4f8;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <!-- Main Container -->
                            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                                
                                <!-- Header with gradient -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #6dd5b8 0%, #52b69a 100%); padding: 32px 40px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">
                                            Người bán đã trả lời câu hỏi của bạn
                                        </h1>
                                    </td>
                                </tr>
                                
                                <!-- Content Body -->
                                <tr>
                                    <td style="padding: 40px 40px 30px;">
                                        <p style="margin: 0 0 20px; color: #2c3e50; font-size: 16px; line-height: 1.6;">
                                            Xin chào <strong style="color: #34495e;">${bidder_username}</strong>
                                        </p>
                                        
                                        <p style="margin: 0 0 24px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                            Người bán <strong>${seller_username}</strong> đã trả lời câu hỏi của bạn về sản phẩm:
                                        </p>
                                        
                                        <!-- Product Name Badge -->
                                        <div style="background: linear-gradient(135deg, #e8f5f1 0%, #d4ede5 100%); border-left: 4px solid #52b69a; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                                            <p style="margin: 0; color: #1a5f4d; font-size: 15px; font-weight: 600;">
                                                ${product_name}
                                            </p>
                                        </div>
                                        
                                        <!-- Your Question Box -->
                                        <div style="background-color: #f8f9fa; border: 1px solid #e1e8ed; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
                                            <p style="margin: 0 0 8px; color: #7f8c8d; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                                Câu hỏi của bạn
                                            </p>
                                            <p style="margin: 0; color: #5a6c7d; font-size: 15px; line-height: 1.7; font-style: italic;">
                                                "${bidder_question}"
                                            </p>
                                        </div>
                                        
                                        <!-- Seller's Answer Box -->
                                        <div style="background-color: #fafbfc; border: 1px solid #52b69a; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                                            <p style="margin: 0 0 8px; color: #52b69a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                                Câu trả lời từ người bán
                                            </p>
                                            <p style="margin: 0; color: #2c3e50; font-size: 15px; line-height: 1.7;">
                                                "${content}"
                                            </p>
                                        </div>
                                        
                                        <p style="margin: 0 0 28px; color: #5a6c7d; font-size: 15px; line-height: 1.6;">
                                            Bạn có thể xem chi tiết và tiếp tục trao đổi với người bán tại trang sản phẩm.
                                        </p>
                                        
                                        <!-- CTA Button -->
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 0 0 28px;">
                                                    <a href="${productUrl}" style="display: inline-block; background: linear-gradient(135deg, #6dd5b8 0%, #52b69a 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 10px rgba(82, 182, 154, 0.3); transition: all 0.3s;">
                                                        Xem trang sản phẩm
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Alternative Link -->
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 0;">
                                            <p style="margin: 0 0 8px; color: #7f8c8d; font-size: 13px;">
                                                Hoặc sao chép đường link sau:
                                            </p>
                                            <p style="margin: 0; word-break: break-all;">
                                                <a href="${productUrl}" style="color: #52b69a; font-size: 13px; text-decoration: none;">${productUrl}</a>
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 28px 40px; border-top: 1px solid #e9ecef;">
                                        <p style="margin: 0 0 8px; color: #95a5a6; font-size: 14px; line-height: 1.5;">
                                            Trân trọng,
                                        </p>
                                        <p style="margin: 0; color: #2c3e50; font-size: 15px; font-weight: 600;">
                                            Đội ngũ Online Auction (Miracle)
                                        </p>
                                        <p style="margin: 16px 0 0; color: #95a5a6; font-size: 12px; line-height: 1.5;">
                                            Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                                        </p>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
  `
}

// ========================================== Product Description Changed Template =========================================

interface ProductDescriptionChangedParams {
  bidderUsername: string;
  productName: string;
  currentPrice: number | bigint;
  productUrl: string;
  changeDate: string;
}

export function getProductDescriptionChangedTemplate(params: ProductDescriptionChangedParams): string {
  const {
    bidderUsername,
    productName,
    currentPrice,
    productUrl,
    changeDate
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 40px 30px; border: 1px solid #e5e5e5; }
    .badge { display: inline-block; background: #f59e0b; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .product-info { background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .product-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fde68a; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #92400e; font-weight: 500; }
    .info-value { color: #78350f; font-weight: bold; }
    .price { font-size: 28px; color: #f59e0b; }
    .button { display: inline-block; background: #f59e0b; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #d97706; }
    .info-text { color: #6b7280; font-size: 14px; margin: 15px 0; line-height: 1.8; }
    .warning-box { background: #fef3c7; border: 1px solid #fcd34d; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .warning-box p { margin: 0; color: #92400e; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thông báo cập nhật sản phẩm</h1>
    </div>
    <div class="content">
      <div class="badge">CẬP NHẬT MÔ TẢ</div>
      <p>Xin chào <strong>${bidderUsername}</strong>,</p>
      <p>Người bán đã cập nhật mô tả cho sản phẩm mà bạn đang giữ giá cao nhất.</p>
      
      <div class="product-info">
        <div class="product-name">${productName}</div>
        <div class="info-row">
          <span class="info-label">Giá hiện tại</span>
          <span class="info-value price">${currentPrice.toLocaleString('vi-VN')} VNĐ</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trạng thái</span>
          <span class="info-value">Bạn đang giữ giá cao nhất</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Thời gian cập nhật</span>
          <span class="info-value">${changeDate}</span>
        </div>
      </div>

      <div class="warning-box">
        <p><strong>Lưu ý quan trọng:</strong> Vui lòng xem lại mô tả sản phẩm để đảm bảo rằng các thông tin cập nhật vẫn phù hợp với mong đợi của bạn. Nếu có bất kỳ thắc mắc nào, hãy liên hệ người bán để được giải đáp.</p>
      </div>

      <a href="${productUrl}" class="button">Xem chi tiết sản phẩm</a>

      <p class="info-text"><strong>Các bước tiếp theo:</strong></p>
      <ul class="info-text">
        <li>Đọc kỹ mô tả sản phẩm đã được cập nhật</li>
        <li>Kiểm tra các thay đổi về thông số kỹ thuật hoặc điều kiện</li>
        <li>Liên hệ người bán nếu cần làm rõ thông tin</li>
        <li>Tiếp tục tham gia đấu giá nếu sản phẩm vẫn phù hợp</li>
      </ul>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Đây là thông báo tự động để giúp bạn cập nhật thông tin mới nhất về sản phẩm bạn quan tâm.</p>
    </div>
    <div class="footer">
      <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
      <p>&copy; 2026 Hệ thống đấu giá trực tuyến. Bảo lưu mọi quyền.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ========================================== Outbid Notification Template =========================================

interface OutbidNotificationParams {
  bidderUsername: string;
  productName: string;
  newCurrentPrice: number | bigint | string;
  yourMaxBid: number | bigint | string;
  productUrl: string;
}

export function getOutbidNotificationTemplate(params: OutbidNotificationParams): string {
  const {
    bidderUsername,
    productName,
    newCurrentPrice,
    yourMaxBid,
    productUrl
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 40px 30px; border: 1px solid #e5e5e5; }
    .badge { display: inline-block; background: #ef4444; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .product-info { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .product-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fecaca; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #991b1b; font-weight: 500; }
    .info-value { color: #7f1d1d; font-weight: bold; }
    .price { font-size: 28px; color: #ef4444; }
    .button { display: inline-block; background: #ef4444; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #dc2626; }
    .info-text { color: #6b7280; font-size: 14px; margin: 15px 0; line-height: 1.8; }
    .alert-box { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .alert-box p { margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bạn đã bị vượt giá</h1>
    </div>
    <div class="content">
      <div class="badge">BỊ VƯỢT QUA</div>
      <p>Xin chào <strong>${bidderUsername}</strong>,</p>
      <p>Có người đã đặt giá cao hơn bạn cho sản phẩm bạn đang quan tâm.</p>
      
      <div class="product-info">
        <div class="product-name">${productName}</div>
        <div class="info-row">
          <span class="info-label">Giá hiện tại</span>
          <span class="info-value price">${formatVndForEmail(newCurrentPrice)} VNĐ</span>
        </div>
        <div class="info-row">
          <span class="info-label">Giá đặt tối đa của bạn</span>
          <span class="info-value">${formatVndForEmail(yourMaxBid)} VNĐ</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Trạng thái</span>
          <span class="info-value">Bạn không còn giữ giá cao nhất</span>
        </div>
      </div>

      <div class="alert-box">
        <p><strong>Hành động ngay:</strong> Nếu bạn vẫn muốn sở hữu sản phẩm này, hãy đặt giá cao hơn để giành lại vị trí dẫn đầu. Phiên đấu giá có thể kết thúc bất cứ lúc nào!</p>
      </div>

      <a href="${productUrl}" class="button">Đấu giá ngay</a>

      <p class="info-text"><strong>Mẹo để thắng đấu giá:</strong></p>
      <ul class="info-text">
        <li>Đặt giá tối đa cao hơn để hệ thống tự động đấu giá cho bạn</li>
        <li>Theo dõi thường xuyên để không bỏ lỡ cơ hội</li>
        <li>Hãy nhanh tay trước khi phiên đấu giá kết thúc</li>
      </ul>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Đây là thông báo tự động để giúp bạn cập nhật tình hình đấu giá. Chúc bạn may mắn!</p>
    </div>
    <div class="footer">
      <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
      <p>&copy; 2026 Hệ thống đấu giá trực tuyến. Bảo lưu mọi quyền.</p>
    </div>
  </div>
</body>
</html>
  `;
}
