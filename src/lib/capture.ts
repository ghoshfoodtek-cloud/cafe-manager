import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function captureFromCamera(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      correctOrientation: true,
      saveToGallery: true,
    });
    return photo.dataUrl ?? null;
  } catch (e) {
    return null;
  }
}

export async function pickFromGallery(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      correctOrientation: true,
    });
    return photo.dataUrl ?? null;
  } catch (e) {
    return null;
  }
}
