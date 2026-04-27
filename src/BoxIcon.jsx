import { BOX_SVG } from './constants';

export default function BoxIcon({ k, size = 40 }) {
  const raw = BOX_SVG[k] || BOX_SVG['fridge'];
  const html = raw.replace(/<svg([^>]*)\swidth="\d+"\s+height="\d+"/, `<svg$1 width="${size}" height="${size}"`);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ width: size, height: size, display: 'block', flexShrink: 0, lineHeight: 0 }}
    />
  );
}
