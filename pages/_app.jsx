import '../styles/globals.css';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DonationFloat from '../components/DonationFloat';
import { AuthProvider } from '../contexts/AuthContext';
import { DonateProvider } from '../contexts/DonateContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { TrailerProvider } from '../contexts/TrailerContext';
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
    <LanguageProvider>
      <AuthProvider>
        <DonateProvider>
          <TrailerProvider>
            <Navbar />
            <AnimatePresence mode="wait">
              <motion.div
                key={router.route}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="page-wrapper pt-12 md:pt-0"
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
            <Footer />
            <DonationFloat />
            <SmartLink />
            <Popunder />
            <SocialBar />
            {/* <Analytics /> */}
          </TrailerProvider>
        </DonateProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
