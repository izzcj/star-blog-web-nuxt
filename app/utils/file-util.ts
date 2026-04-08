/**
 * 将 File 转换为 DataURL
 *
 * @param file 文件对象
 * @returns Promise<string> DataURL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('FileReader error'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 将 Blob 转换为 File
 *
 * @param blob Blob 对象
 * @param fileName 文件名
 * @returns File 对象
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/**
 * 验证图片文件类型
 *
 * @param file 文件对象
 * @returns boolean
 */
export function isValidImageType(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/bmp'];
  return supportedTypes.includes(file.type);
}
