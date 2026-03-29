import { BOX_SVG } from '../constants';

export default function BoxIcon({ k, size = 40 }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: BOX_SVG[k] || BOX_SVG['fridge'] }}
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    />
  );
}
