import formidable from 'formidable';
import fs from 'fs';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({
    maxFileSize: 4 * 1024 * 1024,
    maxTotalFileSize: 4 * 1024 * 1024,
    maxFiles: 20,
    keepExtensions: true,
    allowEmptyFiles: true,
    minFileSize: 0,
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    console.error('Formidable error:', err);
    return res.status(400).json({ error: 'Erro ao processar arquivos: ' + err.message });
  }

  const campo = (k) => (Array.isArray(fields[k]) ? fields[k][0] : fields[k]);
  const nome = campo('nome');
  const nascimento = campo('nascimento');
  const whatsapp = campo('whatsapp');
  const email = campo('email');
  const observacoes = campo('observacoes');

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
  });

  // Anexa TODOS os arquivos de cada campo (a CTPS pode ter várias fotos)
  const attachments = [];
  for (const [chave, padrao] of [['cnis', 'CNIS.pdf'], ['ctps', 'CTPS.pdf']]) {
    const lista = files[chave] ? (Array.isArray(files[chave]) ? files[chave] : [files[chave]]) : [];
    lista.forEach((f, i) => {
      if (f && f.size > 0) {
        attachments.push({
          filename: f.originalFilename || (lista.length > 1 ? `${i + 1}-${padrao}` : padrao),
          content: fs.readFileSync(f.filepath),
        });
      }
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
        <p><strong>Anexos:</strong> ${attachments.length}</p>
      `,
      attachments,
    });
  } catch (mailErr) {
    console.error('Mail error:', mailErr);
    return res.status(500).json({ error: 'Erro ao enviar email.' });
  }

  res.status(200).json({ ok: true });
}
