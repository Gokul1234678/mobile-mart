
{SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=agsgokul6@gmail.com
SMTP_PASSWORD=dbfnvuktfvxakvzq
SMTP_FROM_NAME=MobileMart
SMTP_FROM_EMAIL=agsgokul6@gmail.com}
// ✅ TEST EMAIL ROUTE — remove after testing
app.get("/api/test-email", async (req, res) => {
  try {

    const SibApiV3Sdk = require("sib-api-v3-sdk");

    // --------------------------------------------------
    // Configure Brevo API Key
    // --------------------------------------------------
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    const apiKey =
      defaultClient.authentications["api-key"];

    apiKey.apiKey = process.env.BREVO_API_KEY;

    // --------------------------------------------------
    // Create Transactional Email API
    // --------------------------------------------------
    const apiInstance =
      new SibApiV3Sdk.TransactionalEmailsApi();

    // --------------------------------------------------
    // Email Data
    // --------------------------------------------------
    const sendSmtpEmail =
      new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "MobileMart",
      email: "agsgokul6@gmail.com"
    };

    sendSmtpEmail.to = [
      {
        email: "gokul1672003@gmail.com"
      }
    ];

    sendSmtpEmail.subject =
      "MobileMart Test Email ✅";

    sendSmtpEmail.textContent =
      "Hello! This is a test email from MobileMart using Brevo.";

    // --------------------------------------------------
    // Send Email
    // --------------------------------------------------
    const result =
      await apiInstance.sendTransacEmail(
        sendSmtpEmail
      );

    console.log("EMAIL SENT:", result);

    // --------------------------------------------------
    // Success Response
    // --------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Test email sent successfully"
    });

  } catch (error) {

    console.error(
      "BREVO TEST ERROR:",
      error.response?.body || error
    );

    // --------------------------------------------------
    // Error Response
    // --------------------------------------------------
    res.status(500).json({
      success: false,
      message:
        error.response?.body?.message ||
        error.message
    });
  }
});