const GOLD = '#C9A84C';

// Admin notification templates embed raw customer-submitted free text (contact
// form messages, names) — escape it so HTML/links can't be injected into the
// admin's inbox.
const escapeHtml = (str) =>
  String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const orderNumber = (order) => order._id.toString().slice(-8).toUpperCase();

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const shippingMethodLabel = (order) =>
  order.shippingPrice === 0 ? 'Standard Shipping (3 business days)' : 'Express Shipping (2 business days)';

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

const viewOrderButton = (order) => `
  <p style="margin-top:20px;">
    <a href="https://www.franellhair.com/orders/${order._id}" style="background:${GOLD};color:#111;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">View Your Order</a>
  </p>
`;

const supportFooter = `
  <p style="font-size:13px;color:#777;margin-top:24px;">
    Questions about your order? Email us at <a href="mailto:info@franellhair.com" style="color:${GOLD};">info@franellhair.com</a> or use the chat button on our site. We reply Monday to Friday, 9am to 6pm EST.
  </p>
`;

const wrapper = (title, bodyHtml) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#111;">
    <div style="background:#111;padding:24px;text-align:center;">
      <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:.05em;">FRANELL <span style="color:${GOLD};">HAIR</span></span>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:16px 24px;text-align:center;font-size:12px;color:#999;line-height:1.7;border-top:1px solid #eee;">
      <strong style="color:#666;">Franell Hair</strong><br/>
      info@franellhair.com &middot; +1 (709) 341-7527<br/>
      Ottawa, ON, Canada &middot; Mon to Sat, 9am to 6pm EST
    </div>
  </div>`;

const orderConfirmationEmail = (order) => {
  const interacNote =
    order.paymentMethod === 'Interac e-Transfer'
      ? `<p style="background:#f9f5e8;border:1px solid ${GOLD};border-radius:6px;padding:12px 14px;font-size:14px;">
           To complete your order, please send <strong>$${order.totalPrice.toFixed(2)} CAD</strong> via Interac e-Transfer to
           <strong>info@franellhair.com</strong>. Use order <strong>#${orderNumber(order)}</strong> as the payment message or reference so we can match it quickly.
           Once received, we will confirm by email and begin processing your order within 1 business day.
         </p>`
      : `<p style="font-size:14px;">Your payment has been received. Thank you.</p>`;

  const body = `
    <p>Hi ${order.user?.name || 'there'},</p>
    <p>Thank you for shopping with Franell Hair. We have received your order and are getting it ready for you.</p>
    <table style="width:100%;font-size:14px;margin:16px 0;">
      <tr><td style="color:#777;">Order Number</td><td style="text-align:right;font-weight:600;">#${orderNumber(order)}</td></tr>
      <tr><td style="color:#777;">Order Date</td><td style="text-align:right;">${formatDate(order.createdAt || Date.now())}</td></tr>
      <tr><td style="color:#777;">Shipping Method</td><td style="text-align:right;">${shippingMethodLabel(order)}</td></tr>
    </table>
    ${interacNote}
    <h2 style="font-size:15px;margin:24px 0 6px;">Items Ordered</h2>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 20px;">${itemsRows(order)}</table>
    <table style="width:100%;font-size:14px;">
      <tr><td>Subtotal</td><td style="text-align:right;">$${order.itemsPrice.toFixed(2)}</td></tr>
      ${order.discount > 0 ? `<tr style="color:#16a34a;"><td>Discount</td><td style="text-align:right;">-$${order.discount.toFixed(2)}</td></tr>` : ''}
      <tr><td>Shipping</td><td style="text-align:right;">${order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}</td></tr>
      <tr style="font-weight:700;font-size:16px;"><td style="padding-top:8px;">Total (CAD)</td><td style="text-align:right;padding-top:8px;">$${order.totalPrice.toFixed(2)}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Shipping To</h2>
    <p style="font-size:14px;color:#444;">${addressBlock(order)}</p>
    <h2 style="font-size:15px;margin:24px 0 6px;">What Happens Next</h2>
    <p style="font-size:14px;color:#444;">
      Your order will be processed within 1 to 2 business days. You will receive another email with your shipping confirmation as soon as it is on its way.
      If you need to make any changes, contact us as soon as possible.
    </p>
    <p style="font-size:14px;color:#444;">
      Not completely happy with your purchase? You may return or exchange eligible items within 10 days of delivery. See our Shipping and Returns page for full details.
    </p>
    ${viewOrderButton(order)}
    ${supportFooter}
  `;

  return { subject: `Order Confirmed: #${orderNumber(order)}`, html: wrapper('Order Confirmed', body) };
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
    <h2 style="font-size:15px;margin:28px 0 6px;">Need Help Installing?</h2>
    <p style="font-size:13px;color:#777;margin:0 0 10px;">Get your Franell Hair installed by a professional stylist at one of our partner salons.</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
  `;
};

const STATUS_COPY = {
  pending: {
    label: 'Order Pending',
    intro: (order) => `
      <p>Order <strong>#${orderNumber(order)}</strong> has been placed and is marked as pending.</p>
      <p style="font-size:14px;color:#444;">This usually means we are waiting on payment confirmation, or your order is next in line to be processed. We will email you again as soon as it moves to the next stage.</p>
    `,
  },
  processing: {
    label: 'Order Processing',
    intro: (order) => `
      <p>Good news. We are now preparing order <strong>#${orderNumber(order)}</strong> for shipment.</p>
      <p style="font-size:14px;color:#444;">Orders are typically packed and shipped within 1 to 2 business days. You will receive a shipping confirmation email the moment it leaves our hands.</p>
    `,
  },
  shipped: {
    label: 'Order Shipped',
    intro: (order) => `
      <p>Your order <strong>#${orderNumber(order)}</strong> is officially on its way.</p>
      <p style="font-size:14px;color:#444;">Based on your selected shipping method (${shippingMethodLabel(order)}), you can expect it to arrive soon. If your package does not arrive within the expected window, please reach out to us within 2 days of the expected delivery date so we can help.</p>
    `,
  },
  delivered: {
    label: 'Order Delivered',
    intro: (order) => `
      <p>Order <strong>#${orderNumber(order)}</strong> has been delivered. We hope you love your new hair.</p>
      <p style="font-size:14px;color:#444;">For the best results, we recommend using a sulfate free shampoo, moisturizing regularly, and storing your hair on a wig stand or in its original packaging when not in use.</p>
      <p style="font-size:14px;color:#444;">If anything is not quite right, you have 10 days from delivery to request a return or exchange. Just reply to this email or contact us at info@franellhair.com.</p>
    `,
  },
  cancelled: {
    label: 'Order Cancelled',
    intro: (order) => `
      <p>Order <strong>#${orderNumber(order)}</strong> has been cancelled.</p>
      <p style="font-size:14px;color:#444;">If a payment had already been made for this order, a refund will be processed within 3 to 5 business days back to your original payment method. If you believe this cancellation was a mistake or you have any questions, please contact us right away at info@franellhair.com.</p>
    `,
  },
};

const orderStatusEmail = (order, status, saloons = []) => {
  const copy = STATUS_COPY[status] || STATUS_COPY.processing;
  const showSaloons = (status === 'shipped' || status === 'delivered') && saloons.length > 0;
  const body = `
    <p>Hi ${order.user?.name || 'there'},</p>
    ${copy.intro(order)}
    <h2 style="font-size:15px;margin:24px 0 6px;">Order Summary</h2>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 20px;">${itemsRows(order)}</table>
    <table style="width:100%;font-size:14px;">
      <tr style="font-weight:700;"><td>Total (CAD)</td><td style="text-align:right;">$${order.totalPrice.toFixed(2)}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Shipping To</h2>
    <p style="font-size:14px;color:#444;">${addressBlock(order)}</p>
    ${showSaloons ? saloonSection(saloons) : ''}
    ${viewOrderButton(order)}
    ${supportFooter}
  `;

  return { subject: `${copy.label}: #${orderNumber(order)}`, html: wrapper(copy.label, body) };
};

const welcomeEmail = (user) => {
  const body = `
    <p>Hi ${user.name},</p>
    <p>Welcome to Franell Hair. Your account has been created successfully, and you are all set to start shopping.</p>
    <p style="font-size:14px;color:#444;">Here is what your account gives you access to:</p>
    <table style="width:100%;font-size:14px;margin:12px 0 20px;">
      <tr><td style="padding:6px 0;">100% human hair bundles, wigs, braids, and extensions</td></tr>
      <tr><td style="padding:6px 0;">Free standard shipping across Canada on every order</td></tr>
      <tr><td style="padding:6px 0;">10 day hassle free returns and exchanges</td></tr>
      <tr><td style="padding:6px 0;">Order tracking and history from your account</td></tr>
      <tr><td style="padding:6px 0;">A wishlist to save your favourite products</td></tr>
    </table>
    ${supportFooter}
    <p style="margin-top:20px;">
      <a href="https://www.franellhair.com/shop" style="background:${GOLD};color:#111;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Start Shopping</a>
    </p>
  `;

  return { subject: 'Welcome to Franell Hair', html: wrapper('Welcome to Franell Hair', body) };
};

const reviewReminderEmail = (order) => {
  const productRows = order.orderItems
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <div style="font-weight:600;color:#111;margin-bottom:6px;">${item.name}</div>
            <a href="https://www.franellhair.com/product/${item.product}#review-form"
               style="background:${GOLD};color:#111;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;display:inline-block;">
              Leave a Review
            </a>
          </td>
        </tr>`
    )
    .join('');

  const body = `
    <p>Hi ${order.user?.name || 'there'},</p>
    <p>Your order <strong>#${orderNumber(order)}</strong> was delivered a few days ago, and we hope you are enjoying your new hair.</p>
    <p style="font-size:14px;color:#444;">Would you be willing to share a quick review? It only takes a minute, and it makes a real difference in helping other customers choose the right products.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${productRows}</table>
    <p style="font-size:14px;color:#444;">As a reminder, you can always reach us at info@franellhair.com if you have any questions or concerns about your order.</p>
  `;

  return { subject: 'How Was Your Franell Hair Order?', html: wrapper('Enjoying Your Order?', body) };
};

const passwordResetEmail = (user, resetUrl) => {
  const body = `
    <p>Hi ${user.name},</p>
    <p>We received a request to reset the password on your Franell Hair account. Click the button below to choose a new password. This link will expire in 1 hour for your security.</p>
    <p style="margin-top:20px;">
      <a href="${resetUrl}" style="background:${GOLD};color:#111;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Reset Your Password</a>
    </p>
    <p style="font-size:13px;color:#777;margin-top:20px;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged, and no further action is needed.</p>
    ${supportFooter}
  `;

  return { subject: 'Reset Your Franell Hair Password', html: wrapper('Password Reset Requested', body) };
};

const otpEmail = (user, otp) => {
  const body = `
    <p>Hi ${user.name},</p>
    <p>Thanks for creating a Franell Hair account. Please enter the verification code below to confirm your email address and activate your account.</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:16px 32px;font-size:32px;font-weight:700;letter-spacing:.3em;color:#111;">${otp}</span>
    </div>
    <p style="font-size:14px;color:#444;">This code will expire in 10 minutes. If you did not create a Franell Hair account, you can safely ignore this email.</p>
    ${supportFooter}
  `;

  return { subject: 'Confirm Your Franell Hair Email Address', html: wrapper('Verify Your Email', body) };
};

const mfaOtpEmail = (user, otp) => {
  const body = `
    <p>Hi ${user.name},</p>
    <p>Someone (hopefully you) is signing in to your Franell Hair admin account. Enter the code below to complete the sign in.</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:16px 32px;font-size:32px;font-weight:700;letter-spacing:.3em;color:#111;">${otp}</span>
    </div>
    <p style="font-size:14px;color:#444;">This code will expire in 10 minutes. If this was not you, your password may be compromised. Please change it immediately and contact us at info@franellhair.com.</p>
    ${supportFooter}
  `;

  return { subject: 'Your Franell Hair Admin Sign-In Code', html: wrapper('Admin Sign-In Verification', body) };
};

const adminNewOrderEmail = (order) => {
  const body = `
    <p>A new order has been placed on Franell Hair.</p>
    <table style="width:100%;font-size:14px;margin:16px 0;">
      <tr><td style="color:#777;">Order Number</td><td style="text-align:right;font-weight:600;">#${orderNumber(order)}</td></tr>
      <tr><td style="color:#777;">Customer</td><td style="text-align:right;">${escapeHtml(order.user?.name) || 'N/A'} (${escapeHtml(order.user?.email) || 'N/A'})</td></tr>
      <tr><td style="color:#777;">Payment Method</td><td style="text-align:right;">${order.paymentMethod}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Items Ordered</h2>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 20px;">${itemsRows(order)}</table>
    <table style="width:100%;font-size:14px;">
      <tr style="font-weight:700;font-size:16px;"><td>Total (CAD)</td><td style="text-align:right;">$${order.totalPrice.toFixed(2)}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Shipping To</h2>
    <p style="font-size:14px;color:#444;">${addressBlock(order)}</p>
    <p style="margin-top:20px;">
      <a href="https://www.franellhair.com/admin/orders" style="background:${GOLD};color:#111;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">View in Admin Dashboard</a>
    </p>
  `;
  return { subject: `New Order: #${orderNumber(order)}`, html: wrapper('New Order Received', body) };
};

const adminNewCustomerEmail = (user) => {
  const body = `
    <p>A new customer has registered on Franell Hair.</p>
    <table style="width:100%;font-size:14px;margin:16px 0;">
      <tr><td style="color:#777;">Name</td><td style="text-align:right;font-weight:600;">${escapeHtml(user.name)}</td></tr>
      <tr><td style="color:#777;">Email</td><td style="text-align:right;">${escapeHtml(user.email)}</td></tr>
      <tr><td style="color:#777;">Registered</td><td style="text-align:right;">${formatDate(user.createdAt || Date.now())}</td></tr>
    </table>
    <p style="margin-top:20px;">
      <a href="https://www.franellhair.com/admin/users" style="background:${GOLD};color:#111;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">View in Admin Dashboard</a>
    </p>
  `;
  return { subject: `New Customer: ${user.name}`, html: wrapper('New Customer Registered', body) };
};

const adminNewContactMessageEmail = (msg) => {
  const body = `
    <p>A new message was submitted through the Contact page.</p>
    <table style="width:100%;font-size:14px;margin:16px 0;">
      <tr><td style="color:#777;">Name</td><td style="text-align:right;font-weight:600;">${escapeHtml(msg.name)}</td></tr>
      <tr><td style="color:#777;">Email</td><td style="text-align:right;">${escapeHtml(msg.email)}</td></tr>
      <tr><td style="color:#777;">Subject</td><td style="text-align:right;">${escapeHtml(msg.subject)}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:24px 0 6px;">Message</h2>
    <p style="font-size:14px;color:#444;white-space:pre-wrap;">${escapeHtml(msg.message)}</p>
    <p style="margin-top:20px;">
      <a href="https://www.franellhair.com/admin/messages" style="background:${GOLD};color:#111;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">View in Admin Dashboard</a>
    </p>
  `;
  return { subject: `New Contact Message: ${msg.subject}`, html: wrapper('New Contact Message', body) };
};

module.exports = {
  orderConfirmationEmail,
  orderStatusEmail,
  welcomeEmail,
  passwordResetEmail,
  mfaOtpEmail,
  reviewReminderEmail,
  otpEmail,
  adminNewOrderEmail,
  adminNewCustomerEmail,
  adminNewContactMessageEmail,
};
