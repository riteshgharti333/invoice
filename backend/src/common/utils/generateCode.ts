export function generateCode(prefix: string, count: number): string {
  const year = new Date().getFullYear();
  const prefixUpper = prefix.substring(0, 3).toUpperCase();
  
  return `${prefixUpper}-${year}-${count + 1}`;
}