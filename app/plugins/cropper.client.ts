import Cropper from 'cropperjs';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      Cropper,
    },
  };
});
