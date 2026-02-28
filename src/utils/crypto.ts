export async function generateSHA256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hashHex;
}

export async function sealData(data: any): Promise<{ hash: string; timestamp: number }> {
  const timestamp = Date.now();
  const payload = JSON.stringify({ ...data, timestamp });
  const hash = await generateSHA256(payload);
  return { hash, timestamp };
}
