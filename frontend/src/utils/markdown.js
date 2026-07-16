/**
 * A safe and simple markdown to HTML parser for Gemini responses.
 * Processes headers, bold, bullet points, inline code, and multiline code blocks.
 * @param {string} md 
 * @returns {string} Safe HTML string
 */
export const parseMarkdown = (md) => {
  if (!md) return '';

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```javascript\n...\n```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const cleanCode = code.trim();
    return `<pre class="code-block"><div class="code-header">${lang || 'code'}</div><code>${cleanCode}</code></pre>`;
  });

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Inline code: `code`
  html = html.replace(/`(.*?)`/g, '<code class="code-inline">$1</code>');

  // Lists (bullet points)
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');

  // Multi-line spacing: replace double newlines with paragraphs, or keep paragraphs clean
  const lines = html.split('\n');
  let inList = false;
  let formattedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    
    // Group adjacent <li> elements
    if (trimmed.startsWith('<li>')) {
      if (!inList) {
        formattedLines.push('<ul class="markdown-list">');
        inList = true;
      }
      formattedLines.push(line);
    } else {
      if (inList) {
        formattedLines.push('</ul>');
        inList = false;
      }
      
      // Don't add paragraph spacing inside code blocks
      if (trimmed && !trimmed.startsWith('<h') && !trimmed.startsWith('<pre') && !trimmed.startsWith('<code>') && !trimmed.startsWith('</pre>') && !trimmed.startsWith('</div>')) {
        formattedLines.push(`<p>${line}</p>`);
      } else {
        formattedLines.push(line);
      }
    }
  }
  
  if (inList) {
    formattedLines.push('</ul>');
  }

  return formattedLines.join('\n');
};
