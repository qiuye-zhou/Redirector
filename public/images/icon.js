// 创建 canvas 元素
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 创建不同尺寸的图标
const createIcon = (size) => {
  canvas.width = size;
  canvas.height = size;
  
  // 设置背景色
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(0, 0, size, size);
  
  // 绘制简单的图标
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
  ctx.fill();
  
  // 转换为 base64
  return canvas.toDataURL();
};

// 导出不同尺寸的图标
export const icons = {
  '16': createIcon(16),
  '48': createIcon(48),
  '128': createIcon(128)
}; 