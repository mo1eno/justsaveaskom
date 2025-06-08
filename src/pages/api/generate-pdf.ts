import { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const text = req.method === "GET" ? req.query.text : req.body?.text;

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: "No text provided" });
    return;
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  let buffers: Buffer[] = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=result.pdf");
    res.status(200).send(pdfData);
  });

  // Фон (светло-серый)
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#F0F0F0");

  // Заголовок
  doc.fillColor("black")
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("📊 Результаты анализа", { align: "center", underline: true });

  doc.moveDown();

  // Основной текст с отступом
  doc.font("Helvetica")
    .fontSize(14)
    .fillColor("#333333")
    .text(text, { align: "left", indent: 20, lineGap: 4 });

  doc.end();
}
