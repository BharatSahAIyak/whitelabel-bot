import imageCompression from 'browser-image-compression';

export const compressImage = async (imageFile: File) => {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 1920,
    useWebWorker: false,
  };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (err) {
    if (imageFile instanceof Blob) {
      console.log('Image: ', imageFile);
      return imageFile;
    } else {
      console.error('Compression Error: ', err);
      return undefined;
    }
  }
};
