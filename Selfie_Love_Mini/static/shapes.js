// 这个文件创建一组SVG形状资源文件，提供给小程序使用
// 由于实际微信小程序开发中我们应该使用真实图片文件
// 这里我们用JavaScript生成所需的SVG形状，作为演示用

const createSVGShape = (shapePath, maskMode = true) => {
  // 基础SVG模板
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    ${shapePath}
  </svg>`;
  
  // 如果使用mask模式，转换为base64数据URI
  if (maskMode) {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  return svg;
};

// 爱心形状
const heartShape = createSVGShape(`
  <path d="M50,88.87a2.48,2.48,0,0,1-1.51-.51C29.51,74.1,21.43,66.07,16.21,58.8,8.51,48.15,9.09,37.21,17.2,29.1A19.59,19.59,0,0,1,32.55,24.2a22.81,22.81,0,0,1,15.89,7.07l1.56,1.5,1.55-1.5A22.79,22.79,0,0,1,67.45,24.2a19.61,19.61,0,0,1,15.35,4.9c8.11,8.11,8.69,19.05,1,29.7-5.22,7.27-13.3,15.3-32.28,29.56A2.48,2.48,0,0,1,50,88.87Z" fill="white"/>
`);

// 星星形状
const starShape = createSVGShape(`
  <path d="M50,10.8l12.24,24.81,27.38,3.98L67.94,61.31l4.68,27.27L50,75.94l-22.62,11.89l4.68-27.27L10.38,39.59l27.38-3.98L50,10.8z" fill="white"/>
`);

// 圆形形状
const circleShape = createSVGShape(`
  <circle cx="50" cy="50" r="40" fill="white"/>
`);

// 花朵形状
const flowerShape = createSVGShape(`
  <path d="M50,20c-8.28,0-15,6.72-15,15c0,8.28,6.72,15,15,15c8.28,0,15-6.72,15-15C65,26.72,58.28,20,50,20z" fill="white"/>
  <path d="M50,80c8.28,0,15-6.72,15-15c0-8.28-6.72-15-15-15c-8.28,0-15,6.72-15,15C35,73.28,41.72,80,50,80z" fill="white"/>
  <path d="M20,50c0,8.28,6.72,15,15,15c8.28,0,15-6.72,15-15c0-8.28-6.72-15-15-15C26.72,35,20,41.72,20,50z" fill="white"/>
  <path d="M80,50c0-8.28-6.72-15-15-15c-8.28,0-15,6.72-15,15c0,8.28,6.72,15,15,15C73.28,65,80,58.28,80,50z" fill="white"/>
`);

// 蝴蝶形状
const butterflyShape = createSVGShape(`
  <path d="M50,50c0,0,8-20,25-25c17-5,25,20,0,30c-4,2-8,10-8,10s-2-8-6-10c-25-10-17-35,0-30C78,30,86,50,86,50" stroke="white" stroke-width="3" fill="white"/>
  <path d="M50,50c0,0-8,20-25,25c-17,5-25-20,0-30c4-2,8-10,8-10s2,8,6,10c25,10,17,35,0,30C22,70,14,50,14,50" stroke="white" stroke-width="3" fill="white"/>
`);

// 皇冠形状
const crownShape = createSVGShape(`
  <path d="M15,65h70l-10-40l-15,20l-15-30l-15,30l-15-20L15,65z" fill="white"/>
`);

// 眼镜形状
const glassesShape = createSVGShape(`
  <circle cx="35" cy="50" r="15" fill="white"/>
  <circle cx="65" cy="50" r="15" fill="white"/>
  <path d="M20,50h15 M65,50h15" stroke="white" stroke-width="5" fill="none"/>
  <path d="M50,50h1" stroke="white" stroke-width="5" fill="none"/>
`);

// 闪光形状
const sparkleShape = createSVGShape(`
  <path d="M50,10v80 M10,50h80 M25,25l50,50 M25,75l50-50" stroke="white" stroke-width="5" fill="none"/>
  <circle cx="50" cy="50" r="10" fill="white"/>
`);

export default {
  heart: heartShape,
  star: starShape,
  circle: circleShape,
  flower: flowerShape,
  butterfly: butterflyShape,
  crown: crownShape,
  glasses: glassesShape,
  sparkle: sparkleShape
};