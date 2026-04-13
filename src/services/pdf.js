import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { AppError } from '../lib/errors.js';

const MIN_TEXT_LENGTH = 200;

export async function extractText(buffer) {
  const data = await pdfParse(buffer);
  const text = data.text?.trim() ?? '';

  if (text.length < MIN_TEXT_LENGTH) {
    throw AppError.badRequest(
      'Could not extract text from the uploaded PDF. The file may be a scanned image. Please upload a text-based PDF.',
      'PDF_EMPTY'
    );
  }

  return text;
}
