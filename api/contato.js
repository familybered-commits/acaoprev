import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

  const { nome, whatsapp, email, area, mensagem } = req.body;

  const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
                user: process.env.ZOHO_USER,
                pass: process.env.ZOHO_PASS,
        },
  });

  await transporter.sendMail({
        from: `"Site AcaoPrev" <${process.env.ZOHO_USER}>`,
        to: 'contato@acaoprev.com',
        subject: `[Site] Novo contato: ${nome}`,
        html: `
              <h2>Novo contato pelo site</h2>
                    <p><strong>Nome:</strong> ${nome}</p>
                          <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                                <p><strong>E-mail:</strong> ${email || 'nao informado'}</p>
                                      <p><strong>Area de interesse:</strong> ${area || 'nao informada'}</p>
                                            <p><strong>Mensagem:</strong><br>${mensagem || 'nao informada'}</p>
                                                `,
  });

  res.status(200).json({ ok: true });
}
