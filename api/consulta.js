import formidable from 'formidable';
import fs from 'fs';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
      if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({
          maxFileSize: 4 * 1024 * 1024,
          keepExtensions: true,
  });

  let fields, files;
      try {
              [fields, files] = await form.parse(req);
      } catch (err) {
              console.error('Formidable error:', err);
              return res.status(400).json({ error: 'Erro ao processar arquivos: ' + err.message });
      }

  const nome = Array.isArray(fields.nome) ? fields.nome[0] : fields.nome;
      const nascimento = Array.isArray(fields.nascimento) ? fields.nascimento[0] : fields.nascimento;
      const whatsapp = Array.isArray(fields.whatsapp) ? fields.whatsapp[0] : fields.whatsapp;
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
      const observacoes = Array.isArray(fields.observacoes) ? fields.observacoes[0] : fields.observacoes;

  const transporter = nodemailer.createTransport({
          host: 'smtp.zoho.com',
          port: 465,
          secure: true,
          auth: {
                    user: process.env.ZOHO_USER,
                    pass: process.env.ZOHO_PASS,
          },
  });

  const attachments = [];
      if (files.cnis) {
              const f = Array.isArray(files.cnis) ? files.cnis[0] : files.cnis;
              attachments.push({
                        filename: f.originalFilename || 'CNIS.pdf',
                        content: fs.readFileSync(f.filepath),
              });
      }
      if (files.ctps) {
              const f = Array.isArray(files.ctps) ? files.ctps[0] : files.ctps;
              attachments.push({
                        filename: f.originalFilename || 'CTPS.pdf',
                        content: fs.readFileSync(f.filepath),
              });
      }

  try {
          await transporter.sendMail({
                    from: `"Site AcaoPrev" <${process.env.ZOHO_USER}>`,
                    to: 'contato@acaoprev.com',
                    subject: `[Site] Nova avaliacao gratuita: ${nome}`,
                    html: `
                            <h2>Nova solicitacao de avaliacao gratuita</h2>
                                    <p><strong>Nome:</strong> ${nome}</p>
                                            <p><strong>Data de nascimento:</strong> ${nascimento}</p>
                                                    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                                                            <p><strong>E-mail:</strong> ${email || 'nao informado'}</p>
                                                                    <p><strong>Observacoes:</strong><br>${observacoes || 'nenhuma'}</p>
                                                                          `,
                    attachments,
          });
  } catch (mailErr) {
          console.error('Mail error:', mailErr);
          return res.status(500).json({ error: 'Erro ao enviar email.' });
  }

  res.status(200).json({ ok: true });
}
