import { getCsrfToken } from '@/lib/api/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const uploadApi = {
  async uploadProductImage(
    file: File,
    csrfToken: string,
  ): Promise<{ url: string; publicId: string; width: number; height: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/upload/product-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        Array.isArray(err.message)
          ? err.message[0]
          : (err.message ?? 'Upload failed.'),
      );
    }

    const data = await res.json();
    return {
      url: data.secureUrl as string,
      publicId: data.publicId as string,
      width: data.width as number,
      height: data.height as number,
    };
  },

  getCsrfToken,
};
