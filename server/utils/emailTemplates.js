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

const saloonSection = (saloons) => {
  if (!saloons?.length) return '';
  const rows = saloons
    .slice(0, 3)
    .map(
      (s) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <div style="font-weight:600;color:#111;">${s.name}</div>
            <div style="font-size:13px;color:#777;">${s.address}</div>
            ${s.phone ? `<div style="font-size:13px;color:#777;">${s.phone}</div>` : ''}
          </td>
        </tr>`
    )
    .join('');

  return `
    <h2 style="font-size:15px;margin:28px 0 6px;">Need help installing?</h2>
    <p style="font-size:13px;color:#777;margin:0 0 10px;">Get your Franell Hair installed by a professional stylist.</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
  `;
};

const STATUS_COPY = {
  pending:    { label: 'Order Pending',     intro: (n) => `Order <strong>#${n}</strong> is now marked as pending.` },
  processing: { label: 'Order Processing',  intro: (n) => `We're getting order <strong>#${n}</strong> ready for shipment.` },
  shipped:    { label: 'Order Shipped',     intro: (n) => `Good news — your order <strong>#${n}</strong> is on its way!` },
  delivered:  { label: 'Order Delivered',   intro: (n) => `Your order <strong>#${n}</strong> has been delivered. Enjoy your new hair!` },
  cancelled:  { label: 'Order Cancelled',   intro: (n) => `Order <strong>#${n}</strong> has been cancelled. If this is unexpected, just reply to this email.` },
};

const orderStatusEmail = (order, status, saloons = []) => {
  const copy = STATUS_COPY[status] || STATUS_COPY.processing;
  const n = orderNumber(order);
  const showSaloons = (status === 'shipped' || status === 'delivered') && saloons.length > 0;
  const body = `
    <p>Hi ${order.user?.name || 'there'},</p>
    <p>${copy.intro(n)}</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${itemsRows(order)}</table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Shipping to</h2>
    <p style="font-size:14px;color:#444;">${addressBlock(order)}</p>
    ${showSaloons ? saloonSection(saloons) : ''}
  `;

  return { subject: `${copy.label} — #${n}`, html: wrapper(copy.label, body) };
};

const welcomeEmail = (user) => {
  const body = `
    <p>Hi ${user.name},</p>
    <p>Welcome to Franell Hair! Your account is ready — browse our 100% Remy human hair bundles, wigs, braids and more, all shipped across Canada.</p>
    <p style="margin-top:20px;">
      <a href="https://www.franellhair.com/shop" style="background:${GOLD};color:#111;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Start Shopping</a>
    </p>
  `;

  return { subject: 'Welcome to Franell Hair', html: wrapper('Welcome!', body) };
};

module.exports = { orderConfirmationEmail, orderStatusEmail, welcomeEmail };
