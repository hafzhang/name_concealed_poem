const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

console.log('Testing Resvg import...');
try {
  const svg = '<svg width="100" height="100"><rect width="100" height="100" fill="red" /></svg>';
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 100 } });
  console.log('Resvg initialized successfully!');
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  console.log('Render successful! Buffer length:', pngBuffer.length);
} catch (e) {
  console.error('Error:', e);
}