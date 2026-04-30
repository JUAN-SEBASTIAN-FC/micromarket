import { compressImage } from '../lib/imageUtils';

/**
 * Convierte un archivo a Base64.
 * Comprime las imágenes agresivamente para evitar el límite de 1MB de Firestore.
 */
export async function uploadFile(
  path: string, // Mantenido por compatibilidad
  file: File, 
  options: { 
    maxSizeKB?: number;
    maxWidth?: number;
  } = {}
): Promise<string> {
  const isImage = file.type.startsWith('image/');
  const isDoc = file.type === 'application/pdf' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.type === 'application/msword';

  if (!isImage && !isDoc) {
    throw new Error('INVALID_TYPE');
  }

  let finalFile: Blob | File = file;

  if (isImage) {
    // Compresión agresiva para Base64
    const width = options.maxWidth || 800;
    // La compresión siempre lo pasa a JPEG para máxima reducción
    finalFile = await compressImage(file, width, 0.6);
  }

  // Validación estricta de tamaño
  // Base64 infla el tamaño un 33%. Firestore tiene un máximo absoluto de 1MB.
  const limitKB = options.maxSizeKB || 300;
  
  if (finalFile.size > limitKB * 1024) {
    throw new Error('FILE_TOO_LARGE');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('UPLOAD_FAILED'));
    };
    reader.readAsDataURL(finalFile);
  });
}
