import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    section: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 5–7 business days. Express shipping (2–3 business days) is available at checkout. Orders placed before 2pm EST ship the same day.' },
      { q: 'Do you offer free shipping?', a: 'Yes! We offer free standard shipping on all orders over $150. Orders under $150 have a flat shipping fee of $8.99.' },
      { q: 'Can I track my order?', a: 'Absolutely. Once your order ships, you\'ll receive a tracking number via email. You can also view your order status under My Orders in your account.' },
      { q: 'Do you ship internationally?', a: 'Currently we ship within the United States. International shipping is coming soon — sign up for our newsletter to be the first to know.' },
    ],
  },
  {
    section: 'Products & Quality',
    items: [
      { q: 'What type of hair do you sell?', a: 'We sell 100% high-grade human hair including wigs, bundles, closures, frontals, braiding hair, crochet hair, locs, and extensions. All products are sourced from trusted suppliers and quality-checked before shipping.' },
      { q: 'Can the hair be dyed or heat-styled?', a: 'Yes. Our human hair products can be dyed, bleached, curled, and flat-ironed just like natural hair. We recommend a strand test first and always use a heat protectant.' },
      { q: 'How do I choose the right length?', a: 'Lengths are measured from root to tip when the hair is straight. Body wave and curly styles will appear shorter due to the curl pattern. Check our Size Guide for a full length chart.' },
      { q: 'How long will the hair last?', a: 'With proper care, our wigs and bundles last 12–24 months or longer. We recommend washing every 2–4 weeks with sulfate-free shampoo and storing on a wig stand when not in use.' },
    ],
  },
  {
    section: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery on all unused, uninstalled, and unopened items in their original packaging. Hair that has been worn, altered, or washed cannot be returned for hygiene reasons.' },
      { q: 'How do I start a return?', a: 'Email us at info@franellhair.com with your order number and the reason for your return. We\'ll send you a prepaid return label within 1–2 business days.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 3–5 business days of us receiving the returned item. You\'ll receive an email confirmation once your refund is issued.' },
      { q: 'Can I exchange for a different product?', a: 'Yes! If you\'d like a different length, texture, or style, we\'re happy to exchange your unused item. Email us within 30 days of delivery to arrange an exchange.' },
    ],
  },
  {
    section: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover) as well as Apple Pay and Google Pay, all processed securely through Stripe.' },
      { q: 'Is my payment information secure?', a: 'Yes. All payments are processed by Stripe, a PCI-DSS certified payment processor. We never store your card details on our servers.' },
      { q: 'Do you offer buy now, pay later?', a: 'We\'re working on adding Afterpay and Klarna soon. Sign up for our newsletter to be notified when it\'s available.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <ChevronDown size={18} className="faq-chevron" />
      </button>
      {open && <div className="faq-answer"><p>{a}</p></div>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="faq-page">
      <div className="faq-hero">
        <h1 className="faq-hero-title">Frequently Asked Questions</h1>
        <p className="faq-hero-sub">Everything you need to know about Franell Hair.</p>
      </div>

      <div className="faq-body">
        {FAQS.map((section) => (
          <div key={section.section} className="faq-section">
            <h2 className="faq-section-title">{section.section}</h2>
            <div className="faq-list">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="faq-contact-cta">
          <h3>Still have questions?</h3>
          <p>Our team is happy to help. Reach out anytime.</p>
          <a href="mailto:info@franellhair.com" className="faq-contact-btn">Email Us</a>
        </div>
      </div>
    </div>
  );
}
