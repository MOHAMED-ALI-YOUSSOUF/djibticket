// import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Buffer } from "buffer";

export async function generateTicketPDF(ticket: {
  ticketId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // En-tête
    doc.fontSize(20).text("Djib-Ticket", 50, 50);
    doc.fontSize(16).text("Votre Billet", 50, 80);

    // Détails de l'événement
    doc.fontSize(12).text(`Événement: ${ticket.eventName}`, 50, 120);
    doc.text(`Date: ${ticket.eventDate}`, 50, 140);
    doc.text(`Lieu: ${ticket.eventLocation}`, 50, 160);
    doc.text(`Nom: ${ticket.userName}`, 50, 180);

    // QR Code
    QRCode.toDataURL(`https://djib-ticket.com/tickets/${ticket.ticketId}`, (err, qrCodeData) => {
      if (err) {
        reject(err);
        return;
      }
      doc.image(qrCodeData, 50, 220, { width: 100 });
      doc.end();
    });
  });
}