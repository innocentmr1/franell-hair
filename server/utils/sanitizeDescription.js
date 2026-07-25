const sanitizeHtml = require('sanitize-html');

// Product descriptions are admin-authored rich text (often pasted from Word,
// hence the inline styles) and rendered client-side via
// dangerouslySetInnerHTML. This strips anything that could execute script
// (script tags, event handler attributes, javascript: URLs, iframes) while
// keeping ordinary formatting intact.
const sanitizeDescription = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: ['p', 'div', 'span', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'br', 'a', 'h1', 'h2', 'h3', 'h4'],
    allowedAttributes: {
      '*': ['style'],
      a: ['href', 'target', 'rel'],
    },
    allowedStyles: {
      '*': {
        'font-size': [/^.*$/],
        'font-family': [/^.*$/],
        color: [/^.*$/],
        'font-weight': [/^.*$/],
        'text-align': [/^.*$/],
        'margin-bottom': [/^.*$/],
        'line-height': [/^.*$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });

module.exports = sanitizeDescription;
