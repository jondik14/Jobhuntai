/**
 * Simple PDF text extraction utility
 * Note: For production, consider using a backend service or PDF.js library
 * This is a lightweight client-side approach
 */

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const text = await parsePDFBuffer(arrayBuffer);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

async function parsePDFBuffer(buffer: ArrayBuffer): Promise<string> {
  // Convert buffer to Uint8Array
  const bytes = new Uint8Array(buffer);
  
  // Simple text extraction by looking for text streams in PDF
  // This is a basic approach - PDFs are complex binary formats
  let text = '';
  
  // Try to extract readable text
  const decoder = new TextDecoder('utf-8');
  const rawText = decoder.decode(bytes);
  
  // Extract text between BT (Begin Text) and ET (End Text) markers
  // This is a very basic PDF text extraction
  const textRegex = /BT\s*(.*?)\s*ET/gs;
  let match;
  
  while ((match = textRegex.exec(rawText)) !== null) {
    // Clean up the text content
    let content = match[1];
    // Remove PDF operators
    content = content.replace(/\/[A-Za-z]+\s*/g, ' ');
    content = content.replace(/\d+\.?\d*\s+(Td|Tj|TJ|Tf|Tm|Tc|Tw|Tz|TL|Tr|Ts)\b/g, ' ');
    content = content.replace(/[()\[\]]/g, ' ');
    content = content.replace(/\\\d{3}/g, ' ');
    text += content + ' ';
  }
  
  // Fallback: extract any readable ASCII text
  if (text.trim().length < 100) {
    text = extractReadableText(bytes);
  }
  
  // Clean up the extracted text
  text = text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\n\r]/g, ' ')
    .trim();
  
  return text;
}

function extractReadableText(bytes: Uint8Array): string {
  let text = '';
  let inString = false;
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    
    // Look for text markers
    if (byte === 0x28) { // '(' - start of string
      inString = true;
      continue;
    }
    if (byte === 0x29) { // ')' - end of string
      inString = false;
      text += ' ';
      continue;
    }
    
    // Extract printable ASCII characters
    if (inString && byte >= 32 && byte < 127) {
      text += String.fromCharCode(byte);
    }
  }
  
  return text;
}

// Alternative: Parse text from a simple text file
export function extractTextFromTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Main function to handle multiple file types
export async function parseResumeFile(file: File): Promise<{ text: string; type: string }> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const text = await extractTextFromPDF(file);
    return { text, type: 'pdf' };
  }
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    const text = await extractTextFromTXT(file);
    return { text, type: 'txt' };
  }
  
  // For Word docs, we'd need a backend or mammoth.js library
  // For now, instruct user to convert to PDF or paste text
  throw new Error('Unsupported file format. Please upload a PDF or paste your resume text directly.');
}

// Extract LinkedIn URL from text
export function extractLinkedInUrl(text: string): string | undefined {
  const match = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/i);
  return match ? `https://${match[0]}` : undefined;
}

// Extract email from text
export function extractEmail(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : undefined;
}

// Extract phone number from text
export function extractPhone(text: string): string | undefined {
  const match = text.match(/(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
  return match ? match[0] : undefined;
}

// Extract name from resume (usually at the top)
export function extractName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Name is typically in first 5 lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Look for 2-3 words that look like a name
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      // Check if it looks like a name (no special chars, not all caps)
      const looksLikeName = words.every(w => 
        /^[A-Z][a-z]+$/.test(w) || /^[A-Z][a-z]+-[A-Z][a-z]+$/.test(w)
      );
      if (looksLikeName) {
        return line;
      }
    }
  }
  
  return undefined;
}
