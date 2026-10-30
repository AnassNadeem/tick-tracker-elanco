export function jitteredPosition(id: string, lat: number, lng: number) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  const angle = ((hash % 360) * Math.PI) / 180;
  const distance = 0.004 + ((hash >>> 9) % 1000) / 1000 * 0.01;
  return {
    lat: lat + Math.cos(angle) * distance,
    lng: lng + Math.sin(angle) * distance,
  };
}
