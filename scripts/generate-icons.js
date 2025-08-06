const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 绘制图标
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(0, 0, size, size);
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
  ctx.fill();

  // 保存为PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/images/icon${size}.png`, buffer);
}); 