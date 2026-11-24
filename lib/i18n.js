export const SUPPORTED_LANGUAGES = ['en', 'rw'];
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'agasobanuye_language';

export const LANGUAGE_META = {
  en: {
    code: 'en',
    shortLabel: 'EN',
    label: 'English',
    nativeLabel: 'English',
  },
  rw: {
    code: 'rw',
    shortLabel: 'RW',
    label: 'Kinyarwanda',
    nativeLabel: 'Ikinyarwanda',
  },
};

export const CATEGORY_LABELS = {
  en: {
    All: 'All',
    Action: 'Action',
    Comedy: 'Comedy',
    Drama: 'Drama',
    Thriller: 'Thriller',
    Horror: 'Horror',
    Romance: 'Romance',
    'Sci-Fi': 'Sci-Fi',
    Fantasy: 'Fantasy',
    Animation: 'Animation',
    Adventure: 'Adventure',
    Crime: 'Crime',
    Mystery: 'Mystery',
  },
  rw: {
    All: 'Byose',
    Action: 'Ibikorwa',
    Comedy: 'Urwenya',
    Drama: 'Ikinamico',
    Thriller: 'Ibanga n’Ubwoba',
    Horror: 'Iteye Ubwoba',
    Romance: 'Urukundo',
    'Sci-Fi': 'Siyansi',
    Fantasy: 'Ibitangaza',
    Animation: 'Katuni',
    Adventure: 'Urugendo',
    Crime: 'Ibyaha',
    Mystery: 'Amayobera',
  },
};

export const MEDIA_TYPE_LABELS = {
  en: {
    All: 'All',
    Movie: 'Movie',
    Series: 'Series',
    Anime: 'Anime',
    Documentary: 'Documentary',
  },
  rw: {
    All: 'Byose',
    Movie: 'Filime',
    Series: 'Seri',
    Anime: 'Anime',
    Documentary: 'Inyigisho',
  },
};

export const TRANSLATIONS = {
  en: {
    lang: {
      label: 'Language',
      switcherAria: 'Select application language',
      switchToRw: 'Switch language to Kinyarwanda',
      switchToEn: 'Switch language to English',
    },
    nav: {
      brandSubtitle: 'Rwanda Movies',
      explore: 'Explore',
      exclusive: 'Exclusive',
      requests: 'Requests',
      news: 'Amakuru',
      shop: 'Shop',
      upload: 'Upload',
      creatorProgram: 'Creator Earnings',
      contact: 'Contact',
      donate: 'Donate',
      goPro: 'Go Pro',
      watchlist: 'Watchlist',
      finder: 'Finder',
      admin: 'Admin',
      sign: 'Sign',
      signIn: 'Sign In',
      exit: 'Exit',
      more: 'More',
      toggleMenu: 'Toggle navigation menu',
    },
    search: {
      desktopPlaceholder: 'Search movies & series...',
      mobilePlaceholder: 'Search movies & series by title...',
      heroPlaceholder: 'Search movies, series, anime...',
      formAria: 'Global movie and series search',
      inputAria: 'Search movies and series by title',
      clearAria: 'Clear search',
      dropdownTitle: 'Movies & Series',
      searching: 'Searching...',
      matchSingular: '1 match',
      matchPlural: '{{count}} matches',
      noMatch: 'No movies or series matching "{{query}}"',
      requestTitle: 'Request this title',
      searchAllResults: 'Search all results for "{{query}}"',
    },
    hero: {
      description:
        "Rwanda's home for Agasobanuye movies — Discover, stream, and download the latest episodes of Rocky, Sankara, Gashya, Agent Kim, and more.",
      statsMovies: 'movies',
      statsNews: 'news',
      statsShop: 'shop',
      statsGames: 'games',
      addMovie: 'Add Movie',
      request: 'Request',
      liveSports: 'Live Sports',
      telegram: 'Telegram',
    },
    notice: {
      prefix: 'Only requested movies and series are added. Head to',
      link: 'Requests',
      suffix: 'to submit — added within 24 hours.',
      dismissAria: 'Dismiss notice',
    },
    trending: {
      heading: 'Trending Now',
      subtitle: 'Top {{count}} most viewed',
      badge: 'Trending',
      viewAll: 'View all',
      watchNow: 'Watch Now',
      trailer: 'Trailer',
      scrollLeftAria: 'Scroll trending movies left',
      scrollRightAria: 'Scroll trending movies right',
      viewsSingular: '{{count}} view',
      viewsPlural: '{{count}} views',
    },
    spotlight: {
      watchNow: 'Watch Now',
      download: 'Download',
    },
    supportCta: {
      tag: 'Keep Us Free',
      headlinePrefix: 'Agasobanuye.rw is',
      headlineHighlight: '100% free',
      headlineSuffix: 'to watch because of viewers like you.',
      paypackPrefix: 'Pay directly via MTN MoMo Pay',
      paypackNetwork: 'ID 156833',
      paypackDetails: '(QR, USSD, or Paypack) to merchant',
      paypackSuffix: 'and confirm your transfer.',
      raisedThisMonth: 'Raised this month',
      supporters: 'Supporters',
      goalPct: '{{pct}}% of monthly goal',
      donateNow: 'Donate Now',
      fullSupportPage: 'Full Support Page',
    },
    momoManual: {
      tabManual: 'MoMo Pay 156833 & QR',
      tabGateway: 'Auto Push (Paypack)',
      merchantIdLabel: 'MoMo Pay Merchant ID',
      merchantNameLabel: 'Merchant Name',
      supportLineLabel: 'MoMo Line',
      ussdLabel: 'Quick Dial (USSD)',
      dialNow: 'Dial USSD',
      copyCode: 'Copy ID',
      copyUssd: 'Copy USSD',
      copyPhone: 'Copy Phone',
      copied: 'Copied',
      qrCaption: 'Scan with MTN MoMo or camera app to pay {{code}}',
      manualNoteTitle: 'Manual Verification',
      manualNoteBody: 'Send mobile money to Merchant ID {{code}} ({{name}}), then enter the SMS Transaction ID or upload your receipt screenshot below. Admin confirms manually — not instant.',
      txIdLabel: 'MoMo Transaction ID (from SMS)',
      txIdPlaceholder: 'e.g. MP241118.1234.A56789',
      orText: 'or upload payment screenshot',
      screenshotLabel: 'Payment Screenshot (PNG / JPG)',
      chooseScreenshot: 'Upload Receipt Screenshot',
      changeScreenshot: 'Replace Image',
      removeScreenshot: 'Remove',
      compressingImage: 'Optimizing screenshot...',
      senderPhoneLabel: 'Sender Phone (Optional)',
      senderPhonePlaceholder: '0789 690 247',
      payerNameLabel: 'Your Name (Optional)',
      payerNamePlaceholder: 'Your full name',
      emailLabel: 'Email for Updates (Optional)',
      emailPlaceholder: 'you@example.com',
      submitProof: 'Submit Payment Proof ({{amount}})',
      submitting: 'Submitting proof...',
      submittedTitle: 'Proof Submitted — Pending Review',
      submittedBody: 'We received your manual MoMo Pay {{code}} confirmation for {{amount}}. An admin will verify your transfer shortly.',
      siteRefLabel: 'Site Reference:',
      txIdResultLabel: 'Submitted TX ID:',
      checkStatus: 'Check Confirmation Status',
      checkingStatus: 'Checking...',
      stillPending: 'Still awaiting admin confirmation. Try again in a moment.',
      confirmedSuccess: 'Payment confirmed! Access is now unlocked.',
      sendWhatsApp: 'Also Confirm on WhatsApp ({{code}})',
      submitAnother: 'Submit Another Proof',
      done: 'Done',
    },
    supportForm: {
      badge: 'Support Us · MoMo Pay 156833',
      defaultTitle: 'Support Agasobanuye.rw',
      defaultSubtitle:
        'Pay manually to Merchant ID 156833 (QR / USSD + proof upload) or use Paypack Rwanda auto-push.',
      merchantLabel: 'Merchant:',
      selectAmount: 'Select Amount (RWF)',
      customAmountPlaceholder: 'Or enter custom amount (e.g. 3000 RWF)',
      phoneLabel: 'Rwandan Phone Number',
      phonePlaceholder: '0789 690 247 or 0738 392 120',
      phoneHelpPrefix: 'You will receive a Paypack prompt on your phone to authorize payment to merchant',
      namePlaceholder: 'Your Name (Optional)',
      emailPlaceholder: 'Email for receipt (Optional)',
      connecting: 'Connecting to Paypack...',
      payViaPaypack: 'Pay {{amount}} via Paypack',
      approveTitle: 'Approve on Your Phone',
      waitingPin: 'Waiting for PIN confirmation...',
      changeNumber: 'Change Number',
      successTitle: 'Payment Successful!',
      sendAnother: 'Send Another Support',
      noticeTitle: 'Paypack Notice',
      tryAnotherNumber: 'Try Another Number',
      whatsappDefaultText: 'Confirm Payment on WhatsApp',
      redirectsWithMerchant: 'Redirects with Merchant:',
      poweredBy: 'Powered by Paypack Rwanda',
      networks: 'MTN MoMo & Airtel Money',
    },
    donateModal: {
      defaultTitle: 'Donate to Agasobanuye.rw',
      defaultSubtitle: 'Select an amount, then pay via MoMo Pay 156833 (QR & Proof) or Paypack.',
      gatewayBadge: 'MoMo Pay 156833',
      closeAria: 'Close donate modal',
      step1: '1. Choose Amount',
      step2: '2. Pay & Confirm',
      selectAmountLabel: 'Select Donation Amount (RWF)',
      customAmountLabel: 'Or Enter Custom Amount',
      customAmountPlaceholder: 'e.g. 3000 RWF',
      minAmountError: 'Minimum donation amount is 100 RWF.',
      proceedWith: 'Proceed with {{amount}}',
      donationAmountLabel: 'Donation Amount',
      change: 'Change',
      phoneLabel: 'MTN MoMo / Airtel Number',
      paypackPromptHelp: 'Paypack sends a secure PIN prompt to your phone to pay',
      payViaPaypack: 'Pay {{amount}} via Paypack',
      waitingConfirmation: 'Waiting for Paypack confirmation...',
      receivedTitle: 'Donation Received!',
      done: 'Done',
      confirmWhatsApp: 'Confirm on WhatsApp ({{merchant}})',
      tiers: {
        500: 'Server Coffee',
        1000: 'Episode Upload',
        2000: 'Day of Hosting',
        5000: 'Support Uploader',
        10000: 'VIP Patron',
        25000: 'Studio Sponsor',
      },
    },
    recommended: {
      heading: 'Recommended for You',
      badge: 'OMDB & Similar Titles',
      subtitle: "Personalized movie recommendations based on genres you've recently viewed.",
      refresh: 'Refresh',
      yourGenres: 'Your Genres:',
      allRecentlyViewed: 'All Recently Viewed',
      empty: 'Browse or view movies to build your personalized recommendations list.',
      viewDetails: 'View Details',
      modalTitle: 'Recommended Title',
      requestTranslation: 'Request Agasobanuye Translation',
      searchLibrary: 'Search Library',
    },
    comingSoon: {
      heading: 'Coming Soon',
      upcomingCount: '{{count}} upcoming releases',
      requestTitle: 'Request a title →',
      teaser: 'Teaser',
      remind: 'Remind',
      notified: 'Notified',
      byPrefix: 'by',
      releasingToday: 'Releasing Today',
      tomorrow: 'Tomorrow',
      inDays: 'In {{days}} days',
      soon: 'Coming Soon',
    },
    homeSections: {
      latestNews: 'Latest News',
      shopDeals: 'Shop Deals',
      viewAll: 'View all →',
      allTitles: 'All Titles',
      filterByCategoryAria: 'Filter movie list by category',
      reset: 'Reset',
      titleSingular: 'title',
      titlePlural: 'titles',
      notInLibrary: 'Not in the library',
      noCategoryTitles: 'No {{category}} titles yet',
      emptyFilterHint: 'Try choosing another category or clear your active filters.',
      showAllTitles: 'Show All Titles',
      requestIt: 'Request It',
      addIt: 'Add It',
      prev: 'Prev',
      next: 'Next',
      noMoviesAdded: 'No movies added yet.',
      addFirstMovie: 'Add First Movie',
      movieFilter: {
        searchLabel: 'Search Title',
        searchPlaceholder: 'Filter by title, genre, or language...',
        genreLabel: 'Genre',
        allGenres: 'All Genres',
        yearLabel: 'Year',
        allYears: 'All Years',
        ratingLabel: 'Rating',
        anyRating: 'Any Rating',
        starsAndUp: '{{stars}}+ stars',
        clearFilters: 'Clear Filters',
      },
    },
    card: {
      featured: 'Featured',
      saved: 'Saved',
      saveToWatchlist: 'Watchlist',
      inWatchlist: 'In Watchlist',
      addToWatchlistTitle: 'Bookmark to Watchlist',
      inWatchlistTitle: 'In Watchlist — Click to remove',
      playTrailer: 'Play Trailer',
      playTrailerShort: 'Trailer',
      share: 'Share',
      shared: 'Shared!',
      copied: 'Copied!',
      shareAria: 'Share {{title}}',
      byPrefix: 'by',
      rateGroupAria: 'Rate {{title}} from 1 to 5 stars',
    },
    trailerModal: {
      officialTrailer: 'Official Trailer',
      closeAria: 'Close trailer modal',
      loading: 'Loading YouTube trailer...',
      unavailable: 'Direct trailer preview unavailable for this title.',
      watchOnYoutube: 'Watch on YouTube',
      openMoviePage: 'Open Movie Page',
      openOnYoutube: 'Open on YouTube',
    },
    footer: {
      subtitle: 'Rwanda Movies & Entertainment',
      descriptionPrefix: 'Stream, discover, and save the latest Kinyarwanda-translated movies, series, and anime curated by',
      browseHeading: 'Browse',
      connectHeading: 'Connect With Us',
      links: {
        explore: 'Explore',
        finder: 'Movie Finder',
        requests: 'Requests',
        watchlist: 'Watchlist',
        earnings: 'Creator Earnings',
        support: 'Support Us',
        contact: 'Contact',
      },
      rights: 'All rights reserved.',
      supportButton: 'Support {{merchant}}',
    },
    pages: {
      collection: {
        title: 'My Watchlist',
        savedBrowser: 'Saved in your browser',
        syncedProfile: 'Synced to your profile',
        syncingProfile: 'Syncing with your profile...',
        clearAll: 'Clear All',
        bannerPrefix: 'Your watchlist is saved in',
        bannerHighlight: 'this browser only',
        bannerSuffix: '— it stays even after you close the page. Sign in to sync across devices, or click the heart icon on any movie card to add or remove titles.',
        profileBannerPrefix: 'Your watchlist is',
        profileBannerHighlight: 'synced to your account profile',
        profileBannerSuffix: '— any bookmarks you add or remove here stay saved whenever you sign in.',
        signInToSync: 'Sign in to sync',
        emptyTitle: 'Nothing saved yet',
        emptyDesc: 'Heart any Agasobanuye movie or series to save it here.',
        browseBtn: 'Browse Agasobanuye',
        clearConfirmTitle: 'Clear collection?',
        cancel: 'Cancel',
      },
      support: {
        back: 'Back',
        heading: 'Support Agasobanuye.rw',
      },
      contact: {
        heading: 'Contact Us',
        subheading: "We'd love to hear from you",
      },
      finder: {
        heading: 'Finder',
        subheading: 'Search everything on Agasobanuye.rw + 15 movie sites',
      },
      requests: {
        heading: 'Requests',
      },
    },
    newsletter: {
      tag: 'Premiere Alerts',
      heading: 'Get Weekly Agasobanuye Drops in Your Inbox',
      description:
        'Be first to know when new Rocky, Sankara, and Agent Kim releases, full series seasons, and weekend premieres go live.',
      emailLabel: 'Email address',
      emailPlaceholder: 'you@example.com',
      submit: 'Notify Me',
      submitting: 'Subscribing...',
      privacyNote: 'No spam — release announcements only.',
      invalidEmail: 'Please enter a valid email address.',
      emptyEmail: 'Please enter your email address.',
      successTitle: 'You are on the list',
      successMessage: 'We registered {{email}} for upcoming Agasobanuye.rw premiere announcements.',
      alreadyTitle: 'Already subscribed',
      alreadyMessage: '{{email}} is already subscribed to our release alerts.',
      addAnother: 'Subscribe another email',
      genericError: 'Could not save your email right now. Please try again.',
    },
  },
  rw: {
    lang: {
      label: 'Ururimi',
      switcherAria: 'Hitamo ururimi rwa porogaramu',
      switchToRw: 'Hindura ururimi ujye mu Kinyarwanda',
      switchToEn: 'Hindura ururimi ujye mu Cyongereza',
    },
    nav: {
      brandSubtitle: 'Filime zo mu Rwanda',
      explore: 'Shakisha',
      exclusive: 'Umwihariko',
      requests: 'Saba Filime',
      news: 'Amakuru',
      shop: 'Iduka',
      upload: 'Ohereza',
      creatorProgram: 'Inyungu z’Abashyiraho',
      contact: 'Twandikire',
      donate: 'Inkunga',
      goPro: 'Jya Pro',
      watchlist: 'Urutonde',
      finder: 'Shakisha',
      admin: 'Admin',
      sign: 'Injira',
      signIn: 'Injira',
      exit: 'Sohoka',
      more: 'Ibindi',
      toggleMenu: 'Fungura cyangwa ufunge menu',
    },
    search: {
      desktopPlaceholder: 'Shakisha filime na seri...',
      mobilePlaceholder: 'Shakisha filime na seri ku izina...',
      heroPlaceholder: 'Shakisha filime, seri, anime...',
      formAria: 'Ishakisha rusange rya filime na seri',
      inputAria: 'Shakisha filime na seri ku izina',
      clearAria: 'Siba ibyo wanditse',
      dropdownTitle: 'Filime & Seri',
      searching: 'Birimo gushakishwa...',
      matchSingular: 'Igisubizo 1',
      matchPlural: 'Ibisubizo {{count}}',
      noMatch: 'Nta filime cyangwa seri bihuye na "{{query}}"',
      requestTitle: 'Saba iyi filime',
      searchAllResults: 'Reba ibisubizo byose bya "{{query}}"',
    },
    hero: {
      description:
        "Urubuga rwa mbere mu Rwanda rwa filime z'Agasobanuye — Reba, ushakishirize, kandi ukurure filime nshya za Rocky, Sankara, Gashya, Agent Kim, n'abandi.",
      statsMovies: 'filime',
      statsNews: 'amakuru',
      statsShop: 'iduka',
      statsGames: 'imikino',
      addMovie: 'Ongeramo Filime',
      request: 'Saba Filime',
      liveSports: 'Siporo Live',
      telegram: 'Telegram',
    },
    notice: {
      prefix: 'Hashyirwaho gusa filime na seri zasabwe. Jya kuri',
      link: 'Saba Filime',
      suffix: 'utange icyifuzo — ishyirwaho mu masaha 24.',
      dismissAria: 'Funga itangazo',
    },
    trending: {
      heading: 'Bikunzwe Cyane',
      subtitle: '{{count}} zirebwa cyane',
      badge: 'Bikunzwe',
      viewAll: 'Reba byose',
      watchNow: 'Reba Ubu',
      trailer: 'Incamake',
      scrollLeftAria: 'Subiza ibumoso filime zikunzwe',
      scrollRightAria: 'Jya iburyo kuri filime zikunzwe',
      viewsSingular: 'Yarebwe inshuro {{count}}',
      viewsPlural: 'Zarebwe {{count}}',
    },
    spotlight: {
      watchNow: 'Reba Ubu',
      download: 'Kuramo',
    },
    supportCta: {
      tag: 'Dufashe Kuba Ubuntu',
      headlinePrefix: 'Agasobanuye.rw ni',
      headlineHighlight: '100% ubuntu',
      headlineSuffix: 'kubera abakunzi nkawe badushyigikira.',
      paypackPrefix: 'Ishyura ako kanya kuri MTN MoMo Pay',
      paypackNetwork: 'ID 156833',
      paypackDetails: '(QR, USSD, cyangwa Paypack) ku mucuruzi',
      paypackSuffix: 'maze wemeze ubwishyu bwawe.',
      raisedThisMonth: 'Ayakusanyijwe uku kwezi',
      supporters: 'Abashyigikiye',
      goalPct: '{{pct}}% y’intego y’ukwezi',
      donateNow: 'Tanga Inkunga',
      fullSupportPage: 'Urupapuro rw’Inkunga',
    },
    momoManual: {
      tabManual: 'MoMo Pay 156833 & QR',
      tabGateway: 'Auto Push (Paypack)',
      merchantIdLabel: 'Nomero y’Umucuruzi (MoMo Pay ID)',
      merchantNameLabel: 'Izina ry’Umucuruzi',
      supportLineLabel: 'Telefoni ya MoMo',
      ussdLabel: 'Kanda ako kanya (USSD)',
      dialNow: 'Kanda USSD',
      copyCode: 'Koporora ID',
      copyUssd: 'Koporora USSD',
      copyPhone: 'Koporora Telefoni',
      copied: 'Byakoporowe',
      qrCaption: 'Sikana iyi QR ukoresheje telefoni wishyure kuri {{code}}',
      manualNoteTitle: 'Igenzura rikorwa n’umuntu',
      manualNoteBody: 'Ohereza amafaranga kuri Merchant ID {{code}} ({{name}}), hanyuma wandike Transaction ID yo muri SMS cyangwa ushyireho ifoto y’inyemezabwishyu. Byemezwa n’ubuyobozi — si ako kanya.',
      txIdLabel: 'MoMo Transaction ID (muri SMS)',
      txIdPlaceholder: 'urugero: MP241118.1234.A56789',
      orText: 'cyangwa shyiraho ifoto y’inyemezabwishyu',
      screenshotLabel: 'Ifoto y’Inyemezabwishyu (PNG / JPG)',
      chooseScreenshot: 'Shyiraho Ifoto ya Receipt',
      changeScreenshot: 'Hindura Ifoto',
      removeScreenshot: 'Kuramo',
      compressingImage: 'Ifoto irimo gutunganywa...',
      senderPhoneLabel: 'Telefoni yohereje (Si itegeko)',
      senderPhonePlaceholder: '0789 690 247',
      payerNameLabel: 'Izina ryawe (Si itegeko)',
      payerNamePlaceholder: 'Amazina yawe yose',
      emailLabel: 'Imeli (Si itegeko)',
      emailPlaceholder: 'wowe@example.com',
      submitProof: 'Ohereza Icyemezo ({{amount}})',
      submitting: 'Birimo koherezwa...',
      submittedTitle: 'Icyemezo Cyakiriwe — Kirasuzumwa',
      submittedBody: 'Twakiriye icyemezo cyawe cya MoMo Pay {{code}} cya {{amount}}. Ubuyobozi burakigenzura mu kanya gato.',
      siteRefLabel: 'Nimero ya Site:',
      txIdResultLabel: 'Transaction ID:',
      checkStatus: 'Reba niba Byemejwe',
      checkingStatus: 'Birimo gusuzumwa...',
      stillPending: 'Biracyategereje kwemezwa n’ubuyobozi. Ongera ugerageze mu kanya.',
      confirmedSuccess: 'Ubwishyu bwemejwe! Ubu wafunguriwe.',
      sendWhatsApp: 'Emeza na kuri WhatsApp ({{code}})',
      submitAnother: 'Ohereza Ikindi Cyemezo',
      done: 'Byarangiye',
    },
    supportForm: {
      badge: 'Dushyigikire · MoMo Pay 156833',
      defaultTitle: 'Shyigikira Agasobanuye.rw',
      defaultSubtitle:
        'Ishyura kuri Merchant ID 156833 (QR / USSD + icyemezo) cyangwa ukoreshe Paypack Rwanda.',
      merchantLabel: 'Umucuruzi:',
      selectAmount: 'Hitamo Amafaranga (RWF)',
      customAmountPlaceholder: 'Cyangwa wandike andi (urugero: 3000 RWF)',
      phoneLabel: 'Nimero ya Telefoni yo mu Rwanda',
      phonePlaceholder: '0789 690 247 cyangwa 0738 392 120',
      phoneHelpPrefix: 'Urabona ubutumwa bwa Paypack kuri telefoni yawe bwemeza kwishyura umucuruzi',
      namePlaceholder: 'Izina ryawe (Si itegeko)',
      emailPlaceholder: 'Imeli yawe (Si itegeko)',
      connecting: 'Birimo guhuzwa na Paypack...',
      payViaPaypack: 'Ishyura {{amount}} na Paypack',
      approveTitle: 'Emeza kuri Telefoni Yawe',
      waitingPin: 'Dutegereje ko ushyiramo PIN yawe...',
      changeNumber: 'Hindura Nimero',
      successTitle: 'Kwishyura Byakunze!',
      sendAnother: 'Tanga Indi Nkunga',
      noticeTitle: 'Itangazo rya Paypack',
      tryAnotherNumber: 'Gerageza Indi Nimero',
      whatsappDefaultText: 'Emeza Kwishyura kuri WhatsApp',
      redirectsWithMerchant: 'Byoherezwa ku mucuruzi:',
      poweredBy: 'Bikoreshwa na Paypack Rwanda',
      networks: 'MTN MoMo & Airtel Money',
    },
    donateModal: {
      defaultTitle: 'Shyigikira Agasobanuye.rw',
      defaultSubtitle: 'Hitamo umubare w’inkunga, hanyuma wishyure ukoresheje MoMo Pay 156833 cyangwa Paypack.',
      gatewayBadge: 'MoMo Pay 156833',
      closeAria: 'Funga idirishya ry’inkunga',
      step1: '1. Hitamo Umubare',
      step2: '2. Ishyura & Emeza',
      selectAmountLabel: 'Hitamo Amafaranga y’Inkunga (RWF)',
      customAmountLabel: 'Cyangwa Andika Ayo Ushaka',
      customAmountPlaceholder: 'urugero: 3000 RWF',
      minAmountError: 'Inkunga ntoya ishoboka ni 100 RWF.',
      proceedWith: 'Komeza na {{amount}}',
      donationAmountLabel: 'Amafaranga y’Inkunga',
      change: 'Hindura',
      phoneLabel: 'Nimero ya MTN MoMo / Airtel',
      paypackPromptHelp: 'Paypack yohereza ubutumwa bwo kwemeza PIN kuri telefoni yawe wishyura',
      payViaPaypack: 'Ishyura {{amount}} na Paypack',
      waitingConfirmation: 'Dutegereje kwemeza kwa Paypack...',
      receivedTitle: 'Inkunga Yakiriwe!',
      done: 'Byarangiye',
      confirmWhatsApp: 'Emeza kuri WhatsApp ({{merchant}})',
      tiers: {
        500: 'Ikawa ya Seriveri',
        1000: 'Gushyiraho Igice',
        2000: 'Umunsi w’Ububiko',
        5000: 'Shyigikira Umukorera',
        10000: 'Umuterankunga Mukuru',
        25000: 'Umutera-nkunga w’Inzu',
      },
    },
    recommended: {
      heading: 'Izigenewe Wowe',
      badge: 'OMDB & Filime Zisa',
      subtitle: 'Filime zagenewe wowe ukurikije ibyiciro uheruka kureba.',
      refresh: 'Vugurura',
      yourGenres: 'Ibyiciro Byawe:',
      allRecentlyViewed: 'Byose Byarebwe Vuba',
      empty: 'Sura cyangwa urebe filime kugira ngo ubone urutonde rugenewe wowe.',
      viewDetails: 'Reba Birambuye',
      modalTitle: 'Filime Yatoranyijwe',
      requestTranslation: 'Saba Agasobanuye',
      searchLibrary: 'Shakisha mu Bubiko',
    },
    comingSoon: {
      heading: 'Biri Hafi Kuza',
      upcomingCount: 'filime {{count}} zitegerejwe',
      requestTitle: 'Saba filime →',
      teaser: 'Incamake',
      remind: 'Nyibutsa',
      notified: 'Uzabimenyeshwa',
      byPrefix: 'na',
      releasingToday: 'Isoka Uyu Munsi',
      tomorrow: 'Ejo',
      inDays: 'Mu minsi {{days}}',
      soon: 'Vuba Cyane',
    },
    homeSections: {
      latestNews: 'Amakuru Mashya',
      shopDeals: 'Ibiciro by’Iduka',
      viewAll: 'Reba byose →',
      allTitles: 'Filime Zose',
      filterByCategoryAria: 'Shungura urutonde rwa filime ukurikije icyiciro',
      reset: 'Subiramo',
      titleSingular: 'filime',
      titlePlural: 'filime',
      notInLibrary: 'Ntibirimo mu bubiko',
      noCategoryTitles: 'Nta filime zo mu cyiciro cya {{category}} zirimo',
      emptyFilterHint: 'Gerageza guhitamo ikindi cyiciro cyangwa ukureho ibyo washyunguye.',
      showAllTitles: 'Erekana Zose',
      requestIt: 'Yisabe',
      addIt: 'Yongeremo',
      prev: 'Ibanziriza',
      next: 'Ikurikira',
      noMoviesAdded: 'Nta filime zirashyirwamo.',
      addFirstMovie: 'Ongeramo Filime ya Mbere',
      movieFilter: {
        searchLabel: 'Shakisha Izina',
        searchPlaceholder: 'Shungura ku izina, icyiciro, cyangwa ururimi...',
        genreLabel: 'Icyiciro',
        allGenres: 'Ibyiciro Byose',
        yearLabel: 'Umwaka',
        allYears: 'Imyaka Yose',
        ratingLabel: 'Amanota',
        anyRating: 'Amanota Yose',
        starsAndUp: 'Inyenyeri {{stars}}+',
        clearFilters: 'Siba Byashunguwe',
      },
    },
    card: {
      featured: 'Byatoranyijwe',
      saved: 'Byabitswe',
      saveToWatchlist: 'Bika mu Rutonde',
      inWatchlist: 'Biri mu Rutonde',
      addToWatchlistTitle: 'Bika mu rutonde rwawe',
      inWatchlistTitle: 'Biri mu rutonde — Kanda ubikuremo',
      playTrailer: 'Incamake',
      playTrailerShort: 'Incamake',
      share: 'Sangiza',
      shared: 'Byasangijwe!',
      copied: 'Byakoporowe!',
      shareAria: 'Sangiza {{title}}',
      byPrefix: 'na',
      rateGroupAria: 'Tanga amanota kuri {{title}} kuva kuri 1 kugeza kuri 5',
    },
    trailerModal: {
      officialTrailer: 'Incamake Yemewe',
      closeAria: 'Funga incamake',
      loading: 'Incamake ya YouTube irimo gufunguka...',
      unavailable: 'Incamake y’iyi filime ntibashije gufunguka ako kanya.',
      watchOnYoutube: 'Reba kuri YouTube',
      openMoviePage: 'Fungura Urupapuro rwa Filime',
      openOnYoutube: 'Fungura kuri YouTube',
    },
    footer: {
      subtitle: 'Filime n’Imyidagaduro mu Rwanda',
      descriptionPrefix: 'Reba, shaka, kandi ubike filime, seri, na anime zisobanuye mu Kinyarwanda zitegurwa na',
      browseHeading: 'Shakisha',
      connectHeading: 'Duhuze Kuri',
      links: {
        explore: 'Ahabanza',
        finder: 'Ishakisha rya Filime',
        requests: 'Saba Filime',
        watchlist: 'Urutonde Rwanjye',
        earnings: 'Inyungu z’Abashyiraho',
        support: 'Dushyigikire',
        contact: 'Twandikire',
      },
      rights: 'Uburenganzira bwose burarinzwe.',
      supportButton: 'Shyigikira {{merchant}}',
    },
    pages: {
      collection: {
        title: 'Urutonde Rwanjye',
        savedBrowser: 'Byabitswe muri iyi mushakisha',
        syncedProfile: 'Byahujwe na konti yawe',
        syncingProfile: 'Birimo guhuzwa na konti yawe...',
        clearAll: 'Siba Byose',
        bannerPrefix: 'Urutonde rwawe rubitswe muri',
        bannerHighlight: 'iyi mushakisha gusa',
        bannerSuffix: '— bigumaho na nyuma yo gufunga urupapuro. Injira muri konti kugira ngo ubone urutonde ku bikoresho byose.',
        profileBannerPrefix: 'Urutonde rwawe',
        profileBannerHighlight: 'ruhujwe na konti yawe',
        profileBannerSuffix: '— filime zose wongeyeho cyangwa ukuyemo zibikwa kuri konti yawe igihe cyose winjiye.',
        signInToSync: 'Injira uhuze urutonde',
        emptyTitle: 'Nta cyabitswe na kimwe',
        emptyDesc: 'Kanda umutima kuri filime cyangwa seri ushaka ubike hano.',
        browseBtn: 'Reba Filime z’Agasobanuye',
        clearConfirmTitle: 'Siba urutonde rwose?',
        cancel: 'Hagarika',
      },
      support: {
        back: 'Subira Inyuma',
        heading: 'Shyigikira Agasobanuye.rw',
      },
      contact: {
        heading: 'Twandikire',
        subheading: 'Twishimira kumva ibitekerezo byawe',
      },
      finder: {
        heading: 'Ishakisha',
        subheading: 'Shakisha byose kuri Agasobanuye.rw + imbuga 15 za filime',
      },
      requests: {
        heading: 'Saba Filime',
      },
    },
    newsletter: {
      tag: 'Amakuru ya Filime Nshya',
      heading: 'Menya Filime Nshya z’Agasobanuye Mbere y’Abandi',
      description:
        'Akira amatangazo ya buri cyumweru igihe filime nshya za Rocky, Sankara, Agent Kim n’ibice bya seri bishyizweho.',
      emailLabel: 'Imeli yawe',
      emailPlaceholder: 'izina@example.com',
      submit: 'Iyandikishe',
      submitting: 'Birimo kubikwa...',
      privacyNote: 'Nta butumwa budasobanutse — ni amatangazo ya filime nshya gusa.',
      invalidEmail: 'Nyamuneka andika imeli yuzuye kandi ikwiye.',
      emptyEmail: 'Nyamuneka andika imeli yawe.',
      successTitle: 'Wiyandikishije neza',
      successMessage: 'Twabikije {{email}} ku rutonde rw’abamenyeshwa filime nshya kuri Agasobanuye.rw.',
      alreadyTitle: 'Imeli isanzwe irimo',
      alreadyMessage: '{{email}} isanzwe ibitswe mu bamenyeshwa filime nshya.',
      addAnother: 'Andikisha indi meli',
      genericError: 'Kubika imeli ntibishobotse ubu. Ongera ugerageze mu kanya.',
    },
  },
};

export function normalizeLanguage(rawLang) {
  if (typeof rawLang !== 'string') return DEFAULT_LANGUAGE;
  const cleaned = rawLang.trim().toLowerCase();
  if (!cleaned) return DEFAULT_LANGUAGE;
  if (cleaned === 'rw' || cleaned.startsWith('rw-') || cleaned.startsWith('rw_') || cleaned === 'kin' || cleaned === 'kinyarwanda') {
    return 'rw';
  }
  if (cleaned === 'en' || cleaned.startsWith('en-') || cleaned.startsWith('en_') || cleaned === 'eng' || cleaned === 'english') {
    return 'en';
  }
  return DEFAULT_LANGUAGE;
}

export function getOppositeLanguage(lang) {
  return normalizeLanguage(lang) === 'rw' ? 'en' : 'rw';
}

export function getTranslations(lang) {
  const normalized = normalizeLanguage(lang);
  return TRANSLATIONS[normalized] || TRANSLATIONS[DEFAULT_LANGUAGE];
}

export function translate(lang, keyPath, vars = {}) {
  const dict = getTranslations(lang);
  const parts = String(keyPath || '').split('.').filter(Boolean);

  let current = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current !== 'string') {
    let fallback = TRANSLATIONS[DEFAULT_LANGUAGE];
    for (const part of parts) {
      if (fallback && typeof fallback === 'object' && part in fallback) {
        fallback = fallback[part];
      } else {
        fallback = undefined;
        break;
      }
    }
    current = typeof fallback === 'string' ? fallback : String(keyPath || '');
  }

  return current.replace(/\{\{(\w+)\}\}/g, (_, token) => {
    return Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : '';
  });
}

export function getCategoryLabel(category, lang) {
  const normalized = normalizeLanguage(lang);
  const map = CATEGORY_LABELS[normalized] || CATEGORY_LABELS[DEFAULT_LANGUAGE];
  return map[category] || category;
}

export function getMediaTypeLabel(type, lang) {
  const normalized = normalizeLanguage(lang);
  const map = MEDIA_TYPE_LABELS[normalized] || MEDIA_TYPE_LABELS[DEFAULT_LANGUAGE];
  return map[type] || type;
}

export function getComingSoonCountdownLabel(daysUntilRelease, lang) {
  const t = getTranslations(lang).comingSoon;
  if (typeof daysUntilRelease !== 'number' || !Number.isFinite(daysUntilRelease)) {
    return t.soon;
  }
  if (daysUntilRelease <= 0) return t.releasingToday;
  if (daysUntilRelease === 1) return t.tomorrow;
  return translate(lang, 'comingSoon.inDays', { days: daysUntilRelease });
}

export function formatViewCountLocalized(views, lang) {
  const normalized = normalizeLanguage(lang);
  const count = Number.isFinite(Number(views)) ? Math.max(0, Math.floor(Number(views))) : 0;

  let formattedNumber = String(count);
  if (count >= 1_000_000) {
    formattedNumber = `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (count >= 1_000) {
    formattedNumber = `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }

  if (normalized === 'rw') {
    return count === 1 ? `Yarebwe ${formattedNumber}` : `Zarebwe ${formattedNumber}`;
  }
  return count === 1 ? `${formattedNumber} view` : `${formattedNumber} views`;
}
