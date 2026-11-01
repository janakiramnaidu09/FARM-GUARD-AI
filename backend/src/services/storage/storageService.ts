import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../../config/env.js';

export interface StoredImageMetadata {
  storageKey: string;
  sha256: string;
  mimeType: string;
  fileSizeBytes: number;
}

export class StorageError extends Error {
  constructor(message: string, public code: string = 'STORAGE_ERROR') {
    super(message);
    this.name = 'StorageError';
  }
}

export class StorageService {
  private localDir: string;

  constructor() {
    this.localDir = path.resolve(process.cwd(), config.LOCAL_PRIVATE_UPLOAD_DIR);
    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  /**
   * Validates file magic bytes (signatures) to prevent MIME spoofing.
   */
  validateMagicBytes(buffer: Buffer): { valid: boolean; detectedMime: string; extension: string } {
    if (buffer.length < 12) {
      return { valid: false, detectedMime: 'unknown', extension: '' };
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { valid: true, detectedMime: 'image/jpeg', extension: 'jpg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { valid: true, detectedMime: 'image/png', extension: 'png' };
    }

    // WebP: RIFF ... WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { valid: true, detectedMime: 'image/webp', extension: 'webp' };
    }

    return { valid: false, detectedMime: 'unknown', extension: '' };
  }

  /**
   * Securely saves image to private storage.
   */
  async storeImage(userId: string, buffer: Buffer): Promise<StoredImageMetadata> {
    if (buffer.length > config.MAX_IMAGE_BYTES) {
      throw new StorageError(
        `Image size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds allowed limit of ${
          config.MAX_IMAGE_BYTES / (1024 * 1024)
        } MB.`,
        'FILE_TOO_LARGE'
      );
    }

    const { valid, detectedMime, extension } = this.validateMagicBytes(buffer);
    if (!valid) {
      throw new StorageError(
        'Invalid or corrupted image format. Only authentic JPEG, PNG, and WebP leaf photos are accepted.',
        'INVALID_IMAGE_SIGNATURE'
      );
    }

    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const imageId = crypto.randomUUID();
    const userSafeId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    const storageKey = `users/${userSafeId}/${imageId}.${extension}`;

    // Local private storage
    const targetPath = path.join(this.localDir, storageKey);
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(targetPath, buffer);

    return {
      storageKey,
      sha256,
      mimeType: detectedMime,
      fileSizeBytes: buffer.length,
    };
  }

  /**
   * Retrieves image bytes from private storage with user boundary verification.
   */
  async getImageBytes(userId: string, storageKey: string): Promise<Buffer> {
    const userSafeId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    if (!storageKey.startsWith(`users/${userSafeId}/`)) {
      throw new StorageError('Unauthorized access to private image asset.', 'FORBIDDEN');
    }

    const targetPath = path.join(this.localDir, storageKey);
    if (!fs.existsSync(targetPath)) {
      throw new StorageError('Image not found in private storage.', 'NOT_FOUND');
    }

    return await fs.promises.readFile(targetPath);
  }

  /**
   * Permanently deletes image from storage (for data deletion or privacy requests).
   */
  async deleteImage(userId: string, storageKey: string): Promise<void> {
    const userSafeId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    if (!storageKey.startsWith(`users/${userSafeId}/`)) {
      throw new StorageError('Unauthorized deletion of private image asset.', 'FORBIDDEN');
    }

    const targetPath = path.join(this.localDir, storageKey);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
    }
  }
}

export const storageService = new StorageService();

