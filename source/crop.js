import {saveAs} from 'file-saver';

const CropSizeStorageKey = 'wbs.crop-size';
const MaxCropDimension = 99999;

// Turns whatever is typed or stored into a whole number of pixels, an empty or invalid value counts as 0.
function toDimension(value) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }
  return Math.min(number, MaxCropDimension);
}

function toSize(value) {
  return {
    width: toDimension(value && value.width),
    height: toDimension(value && value.height)
  };
}

export function formatResolution({width, height}) {
  return `${width} × ${height}`;
}

// What's in the width and height fields, 0 for an empty one.
export function getCropSize() {
  try {
    return toSize(JSON.parse(localStorage.getItem(CropSizeStorageKey)));
  } catch (e) {
    return toSize(null);
  }
}

// The resolution to crop to, or null while either dimension is 0.
export function getCropResolution() {
  const size = getCropSize();
  return size.width && size.height ? size : null;
}

export function setCropSize(value) {
  const size = toSize(value);

  if (!size.width && !size.height) {
    localStorage.removeItem(CropSizeStorageKey);
  } else {
    localStorage.setItem(CropSizeStorageKey, JSON.stringify(size));
  }
}

// Fires when the size is changed in another open Wallhaven tab.
export function onCropResolutionChange(listener) {
  window.addEventListener('storage', e => {
    if (e.key === CropSizeStorageKey) {
      listener(getCropResolution());
    }
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Could not encode the cropped image'))),
      'image/png'
    );
  });
}

// Scales the wallpaper so it covers the target resolution, then crops the overflow around the center.
export async function downloadCroppedWallpaper(url, resolution = getCropResolution()) {
  const {width, height} = resolution;

  // Wallhaven serves its files with `Access-Control-Allow-Origin: *`, so we can draw them on a canvas.
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch ${url} (${response.status})`);
  }
  const bitmap = await createImageBitmap(await response.blob());

  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (bitmap.width - sourceWidth) / 2;
  const sourceY = (bitmap.height - sourceHeight) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
  bitmap.close();

  // Like Wallhaven's own Crop & Scale tool, crops are always saved as PNG so no quality is lost.
  const croppedBlob = await canvasToBlob(canvas);

  // Also named like Wallhaven's tool: wallhaven-abc123.jpg -> wallhaven-abc123_2560x1080.png
  const fileName = new URL(url).pathname
    .split('/')
    .reverse()[0]
    .replace(/(\.[a-z]+)?$/i, `_${width}x${height}.png`);

  saveAs(croppedBlob, fileName);
}
