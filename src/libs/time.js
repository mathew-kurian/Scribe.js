export default function time() {
  if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
    const duration = process.hrtime();
    return duration[0] * 1000 + duration[1] / 1e6;
  }

  return Date.now();
}
