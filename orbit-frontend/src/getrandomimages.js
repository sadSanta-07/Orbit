import img1 from './assets/bgrandom/1.jpg';
import img2 from './assets/bgrandom/2.jpg';
import img3 from './assets/bgrandom/3.jpg';
import img4 from './assets/bgrandom/4.jpg';
import img5 from './assets/bgrandom/5.jpg';
import img6 from './assets/bgrandom/6.jpg';

const images = [img1, img2, img3, img4, img5, img6];

export const randomimage = () => {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};
