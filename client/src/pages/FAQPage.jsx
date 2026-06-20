import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    section: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping is free and takes 3 business days. Express shipping is available at checkout for $30 and delivers in 2 business days.' },
      { q: 'Is shipping free?', a: 'Yes — standard shipping is always free on every order. No minimum spend required.' },
      { q: 'Where do you ship?', a: 'We currently ship to addresses within Canada only. We use Canada Post for all deliveries.' },
      { q: 'Can I track my order?', a: 'Yes. Once your order ships you can view its status anytime under My Orders in your account.' },
      { q: 'What if my package is lost or arrives damaged?', a: 'Please contact us within 2 days of the expected delivery date if your package is lost or arrives damaged. Reach us at info@franellhair.com or call +1 (709) 341-7527 and we will make it right.' },
    ],
  },
  {
    section: 'Products & Quality',
    items: [
      { q: 'What type of hair do you sell?', a: 'We sell 100% premium Remy human hair including wigs, bundles, closures, frontals, and extensions. Every product is quality-checked before it leaves our hands.' },
      { q: 'Can the hair be dyed or heat-styled?', a: 'Yes. Our human hair products can be dyed, bleached, curled, and flat-ironed just like natural hair. We recommend a strand test first and always use a heat protectant.' },
      { q: 'How do I choose the right length?', a: 'Lengths are measured from root to tip when the hair is straight. Body wave and curly styles appear shorter due to the curl pattern. Use the Size Guide on any product page for a full length chart.' },
      { q: 'How long will the hair last?', a: 'With proper care, our wigs and bundles last 12–24 months or longer. Wash every 2–4 weeks with a sulfate-free shampoo and store on a wig stand when not in use.' },
    ],
  },
  {
    section: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 10 days of delivery on unused, uninstalled, and unopened items in their original packaging. Hair that has been worn, altered, or washed cannot be returned for hygiene reasons.' },
      { q: 'How do I start a return?', a: 'Email us at info@franellhair.com with your order number and reason for the return. We will get back to you within 24 hours with next steps.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 3–5 business days of us receiving the returned item. You will receive an email confirmation once your refund is issued.' },
      { q: 'Can I exchange for a different product?', a: 'Yes! Email us within 10 days of delivery to arrange an exchange for a different length, texture, or style on any unused item.' },
    ],
  },
  {
    section: 'Payments & Pricing',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover) as well as Apple Pay and Google Pay, all processed securely through Stripe.' },
      { q: 'Is my payment information secure?', a: 'Yes. All payments are handled by Stripe, a PCI-DSS certified payment processor. We never store your card details on our servers.' },
      { q: 'Is there any tax added at checkout?', a: 'No — the price you see is the price you pay. There are no additional taxes added at checkout.' },
    ],
  },
  {
    section: 'Professional Installation',
    items: [
      { q: 'Do you recommend salons for installation?', a: 'Yes! After your order is delivered, we show you a list of our recommended local salons where professional stylists can install your Franell Hair. You can also find them on your order confirmation page.' },
      { q: 'Can the hair be installed at any salon?', a: 'Absolutely. Our hair works with any qualified stylist. We recommend our partner salons because they are familiar with our products and can help you achieve the best results.' },
    ],
  },
  {
    section: 'Contact & Support',
    items: [
      { q: 'How can I contact you?', a: 'You can reach us by email at info@franellhair.com, by phone at +1 (709) 341-7527, or through the Contact page on our website. We are based in Ottawa, ON, Canada.' },
      { q: 'What are your business hours?', a: 'Our team is available Monday to Saturday, 9am–6pm EST. We aim to reply to all messages within 24 hours.' },
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
