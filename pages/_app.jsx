import '../styles/globals.css';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import DonationFloat from '../components/DonationFloat';
import { AuthProvider } from '../contexts/AuthContext';
import { Popunder, SocialBar, SmartLink } from '../components/ads/AdBanner';
// import { Analytics } from '@vercel/analytics/next';
// Cloudflare: Replace with Cloudflare Web Analytics snippet from dashboard

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function App({ Component, pageProps, router }) {
  return (
    <AuthProvider>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="page-wrapper"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
      <DonationFloat />
      <SmartLink />
      <Popunder />
      <SocialBar />
      {/* <Analytics /> */}
    </AuthProvider>
  );
}
