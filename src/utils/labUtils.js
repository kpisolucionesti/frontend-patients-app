export function isOutOfRange(valueStr, param, gender) {
  if (!param?.reference_ranges || valueStr == null) return false;
  const ranges = param.reference_ranges;
  const key = gender === 'Femenino' ? 'female' : 'male';
  const range = ranges[key] || ranges['male'];
  if (!range || !range.type) return false;
  const num = parseFloat(String(valueStr).replace(',', '.'));
  if (isNaN(num)) return false;
  if (range.type === 'range') return num < range.min || num > range.max;
  if (range.type === 'inequality') {
    if (range.comparator === '<') return num >= range.value;
    if (range.comparator === '>') return num <= range.value;
    if (range.comparator === '<=') return num > range.value;
    if (range.comparator === '>=') return num < range.value;
  }
  if (range.type === 'categorical') return String(valueStr).trim().toLowerCase() !== range.value.trim().toLowerCase();
  return false;
}
