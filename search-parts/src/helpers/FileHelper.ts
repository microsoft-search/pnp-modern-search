// [TODO] : add global localization

export class FileHelper {

  /**
   * Format file size
   * @param bytes size in bytes
   * @param decimals decimal number
   */
  public static formatBytes(bytes, decimals) {
    if (bytes == 0) {
      return '0 bytes';
    }

    let sizeUnit = [
      'bytes',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB',
      'EB',
      'ZB',
      'YB'
    ];

    const k: number = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}  ${sizeUnit[i]}`;
  }

  /**
   * Extension to label
   * @param extension file extension
   */
  public static extensionToLabel(extension: string): string {
    let label: string;
    switch (extension) {
      case 'ppt':
      case 'pptx':
        label = 'PowerPoint';
        break;
      case 'xls':
      case 'xlsx':
        label = 'Excel';
        break;
      case 'doc':
      case 'docx':
        label = 'Word';
        break;
      case 'htm':
      case 'html':
        label = 'Web';
        break;
      case 'one':
        label = 'OneNote';
        break;
      default:
        label = extension.toUpperCase();
        break;
    }
    return label;
  }
}
