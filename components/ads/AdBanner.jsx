import { useAuth } from '../../contexts/AuthContext';

const AD_TAGS = {
  '160x300': {
    key: '7e03bb6d0fff5027d3b540a30284b769',
    width: 160,
    height: 300,
  },
  '160x600': {
    key: '07ee7a0f6ef3170e8708216d6f78f768',
    width: 160,
    height: 600,
  },
  '300x250': {
    key: 'b57621428fb208603a9eab07f06498da',
    width: 300,
    height: 250,
  },
  '320x50': {
    key: '4a467e025aa226203fd3245b47926a11',
    width: 320,
    height: 50,
  },
  '468x60': {
    key: '85ffb1c296782234bbf5e100030af7d3',
    width: 468,
    height: 60,
  },
  '728x90': {
    key: '95ec120e2e3ac3d1a58e6296a1a2fd35',
    width: 728,
    height: 90,
  },
};

export default function AdBanner({ size = '300x250', className = '' }) {
  const { isPro } = useAuth();
  if (isPro) return null;

  const ad = AD_TAGS[size];
  if (!ad) return null;

  return (
    <div className={`flex justify-center items-center overflow-hidden ${className}`}
      style={{ minHeight: ad.height }}>
      <div dangerouslySetInnerHTML={{
        __html: `
          <script>
            atOptions = {
              'key' : '${ad.key}',
              'format' : 'iframe',
              'height' : ${ad.height},
              'width' : ${ad.width},
              'params' : {}
            };
          </script>
          <script src="https://www.highperformanceformat.com/${ad.key}/invoke.js"></script>
        `
      }} />
    </div>
  );
}

export function NativeBanner({ className = '' }) {
  const { isPro } = useAuth();
  if (isPro) return null;

  return (
    <div className={`flex justify-center items-center overflow-hidden ${className}`}>
      <div dangerouslySetInnerHTML={{
        __html: `
          <script async="async" data-cfasync="false" src="https://pl30574927.effectivecpmnetwork.com/5cae4b7be587c347604b7b91854d676a/invoke.js"></script>
          <div id="container-5cae4b7be587c347604b7b91854d676a"></div>
        `
      }} />
    </div>
  );
}

export function Popunder() {
  const { isPro } = useAuth();
  if (isPro) return null;

  return (
    <div dangerouslySetInnerHTML={{
      __html: `
        <script src="https://pl30574926.effectivecpmnetwork.com/6f/27/b5/6f27b5826d0a43dc5d91c4bcf32eeaaf.js"></script>
      `
    }} />
  );
}

export function SocialBar() {
  const { isPro } = useAuth();
  if (isPro) return null;

  return (
    <div dangerouslySetInnerHTML={{
      __html: `
        <script src="https://pl30574929.effectivecpmnetwork.com/0f/2c/7d/0f2c7ddfef449cfcbcc5131f566283a6.js"></script>
      `
    }} />
  );
}

export function SmartLink() {
  const { isPro } = useAuth();
  if (isPro) return null;

  return (
    <div dangerouslySetInnerHTML={{
      __html: `
        <a href="https://www.effectivecpmnetwork.com/ksdu90yd?key=c714964da5a20be4e9d1b9e44e9418f4" rel="nofollow noopener" target="_blank">Sponsored</a>
      `
    }} />
  );
}
