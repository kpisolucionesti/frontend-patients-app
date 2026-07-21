export const sanitizeInput = (value, options = {}) => {
  let v = String(value ?? '');
  v = v.replace(/<[^>]*>/g, '');
  v = v.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  v = v.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  v = v.replace(/javascript\s*:/gi, '');
  v = v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  v = v.trim();
  if (options.maxLength) v = v.slice(0, options.maxLength);
  return v;
};

export const sanitizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const str = String(value).replace(/[^0-9.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? '' : num;
};

export const sanitizeCedula = (value) =>
  String(value ?? '').replace(/\D/g, '').slice(0, 9);

export const sanitizePhone = (value) =>
  String(value ?? '').replace(/[^0-9+\-() ]/g, '').slice(0, 20);

export const sanitizeAlphanumeric = (value, options = {}) => {
  let v = String(value ?? '');
  v = v.replace(/<[^>]*>/g, '');
  v = v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  v = v.trim();
  if (options.maxLength) v = v.slice(0, options.maxLength);
  return v;
};
