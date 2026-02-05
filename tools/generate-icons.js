const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'assets', 'icons', 'logo_vertice.svg');
const outDir = path.join(__dirname, '..', 'assets', 'icons');

async function generate() {
  if (!fs.existsSync(svgPath)) {
    console.error('No se encontró la fuente SVG:', svgPath);
    process.exit(1);
  }

  console.log('Generando PNGs desde', svgPath);

  await sharp(svgPath)
    .resize(192, 192, { fit: 'cover' })
    .png({ quality: 90 })
    .toFile(path.join(outDir, 'icon-192.png'));

  await sharp(svgPath)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 90 })
    .toFile(path.join(outDir, 'icon-512.png'));

  console.log('icon-192.png y icon-512.png generados en', outDir);
}

generate().catch(err => {
  console.error('Error generando íconos:', err);
  process.exit(1);
});
