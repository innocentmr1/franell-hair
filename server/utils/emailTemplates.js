const GOLD = '#C9A84C';

const orderNumber = (order) => order._id.toString().slice(-8).toUpperCase();

const itemsRows = (order) =>
  order.orderItems
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <div style="font-weight:600;color:#111;">${item.name}</div>
            <div style="font-size:13px;color:#777;">
              Qty: ${item.qty}${item.length ? ` · ${item.length}"` : ''}${item.color ? ` · ${item.color}` : ''}
            </div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#111;">
            $${(item.price * item.qty).toFixed(2)}
          </td>
        </tr>`
    )
    .join('');

const addressBlock = (order) => {
  const a = order.shippingAddress || {};
  return `${a.street || ''}<br/>${a.city || ''}${a.province ? `, ${a.province}` : ''} ${a.postal || ''}<br/>${a.country || ''}`;
};

const wrapper = (title, bodyHtml) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#111;">
    <div style="background:#111;padding:24px;text-align:center;">
      <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:.05em;">FRANELL <span style="color:${GOLD};">HAIR</span></span>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:16px 24px;text-align:center;font-size:12px;color:#999;">
      Franell Hair · info@franellhair.com
    </div>
  </div>`;

const orderConfirmationEmail = (order) => {
  const interacNote =
    order.paymentMethod === 'Interac e-Transfer'
      ? `<p style="background:#f9f5e8;border:1px solid ${GOLD};border-radius:6px;padding:12px 14px;font-size:14px;">
           Send <strong>$${order.totalPrice.toFixed(2)} CAD</strong> via Interac e-Transfer to
           <strong>info@franellhair.com</strong>, using order <strong>#${orderNumber(order)}</strong> as the reference.
           We'll confirm receipt and ship within 1 business day.
         </p>`
      : '';

  const body = `
    <p>Hi ${order.user?.name || 'there'},</p>
    <p>Thanks for your order! We've received order <strong>#${orderNumber(order)}</strong> and are getting it ready.</p>
    ${interacNote}
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${itemsRows(order)}</table>
    <table style="width:100%;font-size:14px;">
      <tr><td>Subtotal</td><td style="text-align:right;">$${order.itemsPrice.toFixed(2)}</td></tr>
      <tr><td>Shipping</td><td style="text-align:right;">${order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}</td></tr>
      <tr style="font-weight:700;font-size:16px;"><td style="padding-top:8px;">Total (CAD)</td><td style="text-align:right;padding-top:8px;">$${order.totalPrice.toFixed(2)}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Shipping to</h2>
    <p style="font-size:14px;color:#444;">${addressBlock(order)}</p>
  `;

  return { subject: `Order Confirmed — #${orderNumber(order)}`, html: wrapper('Order Confirmed', body) };
};

const orderShippedEmail = (order) => {
  const body = `
    <p>Hi ${order.user?.name || 'there'},</p>
    <p>Good news — your order <strong>#${orderNumber(order)}</strong> is on its way!</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${itemsRows(order)}</table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Shipping to</h2>
    <p style="font-size:14px;color:#444;">${addressBlock(order)}</p>
  `;

  return { subject: `Your order has shipped — #${orderNumber(order)}`, html: wrapper('Order Shipped', body) };
};

module.exports = { orderConfirmationEmail, orderShippedEmail };
