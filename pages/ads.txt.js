export async function getServerSideProps({ res }) {
  const rawClient = String(process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '').trim();
  const pubId = rawClient.replace(/^ca-/i, '');

  const lines = pubId && /^pub-\d+$/i.test(pubId)
    ? [`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`]
    : [
        '# Agasobanuye.rw Authorized Digital Sellers (ads.txt)',
        '# Set NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX in your environment to activate Google AdSense.',
      ];

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(`${lines.join('\n')}\n`);
  res.end();

  return { props: {} };
}

export default function AdsTxt() {
  return null;
}
