import { UPLOAD_LIMITS } from "@meuqr/shared";

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = UPLOAD_LIMITS.max_file_size_mb * 1024 * 1024;
const ALLOWED_TYPES = UPLOAD_LIMITS.allowed_image_types;

/**
 * Validate an uploaded file's type and size.
 */
export function validateUpload(
  file: { name: string; type: string; size: number }
): UploadValidationResult {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    const allowed = ALLOWED_TYPES.map((t) => t.split("/")[1]).join(", ");
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowed}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_LIMITS.max_file_size_mb}MB`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize a file name by removing path separators and special characters.
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path components
  const base = fileName.split(/[/\\]/).pop() || fileName;
  // Remove special chars
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
}

/**
 * Generate a safe storage path for an uploaded file.
 */
export function generateStoragePath(
  businessId: string,
  userId: string,
  originalName: string
): string {
  const safeName = sanitizeFileName(originalName);
  const timestamp = Date.now();
  const ext = safeName.split(".").pop() || "bin";
  return `${businessId}/${userId}/${timestamp}.${ext}`;
}
