// src/utils/pdfGenerator.js
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

function generateOrderPDF({ company, user, order, items }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
    doc.on("error", reject);

    // Encabezado
    doc.fontSize(20).text(company.name, { align: "center" });
    doc.fontSize(12).text(company.slogan, { align: "center" });
    doc.moveDown();
    doc.text(`Fecha: ${new Date().toLocaleString()}`);

    doc.moveDown();
    doc.fontSize(14).text("Datos del cliente");
    doc.fontSize(12);
    doc.text(`Nombre: ${order.shipping_name}`);
    doc.text(`Correo: ${user.email}`);
    doc.text(
      `Dirección: ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_postal}, ${order.shipping_country}`
    );
    doc.moveDown();

    doc.fontSize(14).text("Detalle de la compra");
    doc.moveDown();

    doc.fontSize(12);
    items.forEach((item) => {
      doc.text(
        `${item.name} x${item.quantity} - $${item.unit_price.toFixed(
          2
        )} c/u = $${(item.unit_price * item.quantity).toFixed(2)}`
      );
    });

    doc.moveDown();

    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`);
    doc.text(`Impuestos: $${order.tax.toFixed(2)}`);
    doc.text(`Envío: $${order.shipping_cost.toFixed(2)}`);
    if (order.discount_amount > 0) {
      doc.text(
        `Descuento (${order.coupon_code}): -$${order.discount_amount.toFixed(
          2
        )}`
      );
    }
    doc.moveDown();
    doc.fontSize(14).text(`Total: $${order.total.toFixed(2)}`);

    doc
      .moveDown()
      .fontSize(12)
      .text("¡Gracias por tu compra!", { align: "center" });

    doc.end();
    doc.pipe(stream);
  });
}

module.exports = { generateOrderPDF };
