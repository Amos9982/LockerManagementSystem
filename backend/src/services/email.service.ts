export async function sendEmail(to: string, subject: string, body: string) {
  // In production you would use SES / SMTP etc.
  console.log(`\n=== EMAIL SENT ===\nTo: ${to}\nSubject: ${subject}\n\n${body}\n`);
}
