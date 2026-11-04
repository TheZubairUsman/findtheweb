// The published frontend lives on shared hosting while its API runs on the VPS.
// Local browser QA keeps the same-origin test server contract.
export const apiUrl = path => {
  if (!path.startsWith('/api/v1/')) throw new Error('Invalid API path');
  const host = window.location.hostname;
  return host === 'findtheweb.zus3cu.tech'
    ? `https://api.zus3cu.tech/findtheweb${path}`
    : path;
};
