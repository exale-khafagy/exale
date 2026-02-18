import { auth } from '@clerk/nextjs/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

// FileRouter for Apply form attachments (Pitch Deck / CV)
export const ourFileRouter = {
  applyAttachment: f({
    pdf: { maxFileSize: '16MB', maxFileCount: 1 },
    blob: { maxFileSize: '16MB', maxFileCount: 1 },
  })
    .middleware(() => {
      // Public upload for Apply form - no auth required
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Apply attachment uploaded:', file.url);
      return { url: file.url };
    }),

  profilePicture: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) {
        throw new Error('Unauthorized');
      }
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  mediaLibrary: f({
    image: { maxFileSize: '8MB', maxFileCount: 10 },
    pdf: { maxFileSize: '16MB', maxFileCount: 10 },
    blob: { maxFileSize: '16MB', maxFileCount: 10 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) {
        throw new Error('Unauthorized');
      }
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      // File will be registered client-side after upload
      console.log('Media file uploaded:', file.url);
      return { url: file.url, name: file.name, size: file.size, type: file.type };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
