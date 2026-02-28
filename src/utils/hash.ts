export async function hashPhoneNumber(phone: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(phone);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return "0x" + hashHex;
}
