
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Process the meta logo image
async function processImage() {
  try {
    console.log('Processing image...');
    
    // Make sure the directory exists
    const outputDir = path.resolve('client/public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Process the image with white background
    await sharp('attached_assets/meta-logo.jpg')
      .resize(300) // Make it bigger
      .toFormat('png')
      .png({ 
        quality: 100,
        compressionLevel: 9
      })
      // Set white background
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile('client/public/meta-logo-white-bg.png');
      
    console.log('Image processed successfully!');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
