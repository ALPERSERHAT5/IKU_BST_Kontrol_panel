import QRCode from 'qrcode';

export async function generateRoomQrPng(room, baseUrl) {
  const url = `${baseUrl}/yeni-talep.html?room=${room.qrToken}`;
  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
  return buffer;
}

export function buildRoomQrDataUrl(room, baseUrl) {
  const url = `${baseUrl}/yeni-talep.html?room=${room.qrToken}`;
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });
}