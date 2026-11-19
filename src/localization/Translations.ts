export type Language = 'en' | 'id';

export interface LevelText {
  title: string;
  subtitle: string;
}

export const LEVEL_TRANSLATIONS: Record<Language, Record<number, LevelText>> = {
  en: {
    1: { title: 'Morning Creek', subtitle: 'A gentle dawn awakening' },
    2: { title: 'Lily Garden', subtitle: 'Floating blossom archipelago' },
    3: { title: 'Mossy Forest', subtitle: 'Ancient moss stones & misty turns' },
    4: { title: 'Gentle Rain', subtitle: 'Soothing raindrops on ripples' },
    5: { title: 'Autumn River', subtitle: 'Golden foliage & winding currents' },
    6: { title: 'Old Wooden Bridge', subtitle: 'Rustic timber beams overhead' },
    7: { title: 'Little Friends', subtitle: 'Ducks, frogs & playful carp' },
    8: { title: 'Firefly Valley', subtitle: 'Evening glow under starlit canopies' },
    9: { title: 'Whispering Falls', subtitle: 'Foaming rapids & misty currents' },
    10: { title: 'The Endless Journey', subtitle: 'A majestic voyage toward the sea' },
  },
  id: {
    1: { title: 'Sungai Pagi', subtitle: 'Fajar tenang yang menyapa' },
    2: { title: 'Taman Teratai', subtitle: 'Gugusan teratai mengapung' },
    3: { title: 'Hutan Berlumut', subtitle: 'Batu berlumut purba & kelokan berkabut' },
    4: { title: 'Hujan Rintik', subtitle: 'Tetesan hujan lembut di atas riak' },
    5: { title: 'Sungai Musim Gugur', subtitle: 'Dedaunan emas & arus berkelok' },
    6: { title: 'Jembatan Kayu Tua', subtitle: 'Lengkungan kayu pedesaan di atas kepala' },
    7: { title: 'Sahabat Kecil', subtitle: 'Bebek, katak & ikan mas yang ceria' },
    8: { title: 'Lembah Kunang-Kunang', subtitle: 'Cahaya malam di bawah rimbun bintang' },
    9: { title: 'Air Terjun Berbisik', subtitle: 'Jeram berbusa & arus berembun' },
    10: { title: 'Perjalanan Abadi', subtitle: 'Pelayaran agung menuju samudra luas' },
  }
};

export const UI_TRANSLATIONS = {
  en: {
    // Main Menu
    gameTitle: 'Little Paper Boat',
    gameTagline: '"A little boat. A wonderful journey."',
    startJourney: 'Start Journey',
    continueJourney: (num: string, title: string) => `Continue (${num}: ${title})`,
    riverMap: 'River Map 🗺️',
    gameSettings: 'Game Settings ⚙️',
    donateHeader: 'Donate',
    qrisDonate: '📱 QRIS',
    paypal: '🅿️ PayPal',
    footerNote: 'A cozy 3D browser adventure • Powered by PlayCanvas',

    // First-Time Language Select Modal
    langModalTitle: 'Choose Language / Pilih Bahasa ⛵',
    langModalDesc: 'Select your preferred language to begin your journey:<br>Silakan pilih bahasa Anda:',
    langEnglish: '🇬🇧 English',
    langIndonesian: '🇮🇩 Bahasa Indonesia',

    // River Map Screen
    backMenu: '◀ Menu',
    mapTitle: 'River Journeys 🗺️',
    mapSubtitle: 'Follow the gentle currents through 10 tranquil realms',
    realmPrefix: 'REALM',
    locked: 'Locked 🔒',
    requiresLevel: (lvl: number) => `Requires Level ${lvl}`,
    sailRiver: 'Sail River ⛵',
    replay: 'Replay ↺',

    // In-Game HUD
    checkpointReached: '🏮 Lantern Checkpoint Reached',
    touchHint: 'Drag screen or use A / D / Arrow Keys to steer',
    pauseTooltip: 'Menu / Pause [Esc]',

    // Pause Screen
    pauseTitle: 'Drifting at Rest ⏸️',
    resumeDrift: 'Resume Drift ⛵',
    restartLevel: 'Restart Level ↺',

    // Level Complete
    completeTitle: 'Journey Completed! 💎',
    completeSubtitle: 'You arrived safely at the harbor',
    completeGems: 'Red Gems:',
    nextJourney: 'Next Journey ➔',
    sailAgain: 'Sail Again ↺',

    // Game Over
    gameOverTitle: 'Paper Drifted Away 🌊',
    gameOverSubtitle: 'The paper soaked through, but the river flows on',
    respawnLantern: 'Respawn at Lantern 🏮',

    // Settings
    settingsTitle: 'Game Settings ⚙️',
    languageLabel: 'Language / Bahasa:',
    qualityLabel: 'Visual Quality Profile:',
    qualityPerf: '⚡ Performance',
    qualityBal: '🌿 Balanced',
    qualityHigh: '✨ Quality',
    masterVolume: 'Master Volume:',
    musicVolume: 'Music Volume:',
    ambientVolume: 'River & Nature:',
    sfxVolume: 'Sound Effects:',
    soundOn: '🔊 Sound On',
    soundOff: '🔇 Sound Off',
    resetProgress: '↺ Reset',
    resetConfirm: 'Reset all river journeys and return to Level 1?',
    saveClose: 'Save & Close',

    // Tutorial
    tutorialTitle: 'How to Sail ⛵',
    tutorialSubtitle: 'A peaceful paper boat drifting along the winding streams',
    steeringHeader: '⛵ Smooth Steering:',
    steeringDescDesktop: 'Use <strong>A / D</strong> or <strong>Left / Right Arrow</strong> keys to guide your paper boat along the stream.',
    steeringDescMobile: 'Drag smoothly on the screen or use the on-screen touchpad to steer naturally.',
    currentsHeader: '🌊 River Currents & Hazards:',
    currentsDesc: 'Avoid rocks, fallen branches, and swirling water vortexes! Lily pads and friendly ducks are soft and won\'t damage your boat.',
    goalHeader: '💎 Goal of the River:',
    goalDesc: 'Collect shimmering red gems along the currents to earn 3 stars. Pass lantern checkpoints and glide through the finish arch!',
    understood: 'Understood',

    // QRIS Modal
    qrisTitle: 'Support Developer 💖',
    qrisSubtitle: 'Scan this QRIS code using your mobile banking or e-wallet application.',
    downloadQr: '📥 Download QR Code',
    openPaypal: '🅿️ Open PayPal (hanafidesar)',
    close: 'Close',
  },
  id: {
    // Main Menu
    gameTitle: 'Perahu Kertas Kecil',
    gameTagline: '"Sebuah perahu kecil. Sebuah perjalanan indah."',
    startJourney: 'Mulai Petualangan',
    continueJourney: (num: string, title: string) => `Lanjutkan (${num}: ${title})`,
    riverMap: 'Peta Sungai 🗺️',
    gameSettings: 'Pengaturan Game ⚙️',
    donateHeader: 'Donasi',
    qrisDonate: '📱 QRIS',
    paypal: '🅿️ PayPal',
    footerNote: 'Petualangan 3D santai di browser • Ditenagai oleh PlayCanvas',

    // First-Time Language Select Modal
    langModalTitle: 'Pilih Bahasa / Choose Language ⛵',
    langModalDesc: 'Silakan pilih bahasa yang ingin digunakan:<br>Please select your preferred language:',
    langEnglish: '🇬🇧 English',
    langIndonesian: '🇮🇩 Bahasa Indonesia',

    // River Map Screen
    backMenu: '◀ Menu',
    mapTitle: 'Perjalanan Sungai 🗺️',
    mapSubtitle: 'Ikuti arus tenang melintasi 10 alam yang damai',
    realmPrefix: 'ALAM',
    locked: 'Terkunci 🔒',
    requiresLevel: (lvl: number) => `Membutuhkan Level ${lvl}`,
    sailRiver: 'Arungi Sungai ⛵',
    replay: 'Main Lagi ↺',

    // In-Game HUD
    checkpointReached: '🏮 Pos Lentera Tercapai',
    touchHint: 'Geser layar atau gunakan A / D / Tombol Panah untuk kemudi',
    pauseTooltip: 'Menu / Jeda [Esc]',

    // Pause Screen
    pauseTitle: 'Berhenti Sejenak ⏸️',
    resumeDrift: 'Lanjutkan Arung ⛵',
    restartLevel: 'Ulangi Level ↺',

    // Level Complete
    completeTitle: 'Perjalanan Selesai! 💎',
    completeSubtitle: 'Kamu tiba dengan selamat di dermaga',
    completeGems: 'Permata Merah:',
    nextJourney: 'Perjalanan Berikutnya ➔',
    sailAgain: 'Arungi Lagi ↺',

    // Game Over
    gameOverTitle: 'Perahu Kertas Karam 🌊',
    gameOverSubtitle: 'Kertas telah basah kuyup, namun sungai terus mengalir',
    respawnLantern: 'Kembali ke Pos Lentera 🏮',

    // Settings
    settingsTitle: 'Pengaturan Game ⚙️',
    languageLabel: 'Bahasa / Language:',
    qualityLabel: 'Profil Kualitas Visual:',
    qualityPerf: '⚡ Performa',
    qualityBal: '🌿 Seimbang',
    qualityHigh: '✨ Kualitas',
    masterVolume: 'Volume Utama:',
    musicVolume: 'Volume Musik:',
    ambientVolume: 'Suara Sungai & Alam:',
    sfxVolume: 'Efek Suara:',
    soundOn: '🔊 Suara Nyala',
    soundOff: '🔇 Senyap',
    resetProgress: '↺ Reset',
    resetConfirm: 'Reset semua progres petualangan sungai dan kembali ke Level 1?',
    saveClose: 'Simpan & Tutup',

    // Tutorial
    tutorialTitle: 'Cara Berlayar ⛵',
    tutorialSubtitle: 'Sebuah perahu kertas santai mengarungi aliran sungai yang berliku',
    steeringHeader: '⛵ Kemudi Halus:',
    steeringDescDesktop: 'Gunakan tombol <strong>A / D</strong> atau <strong>Panah Kiri / Kanan</strong> untuk mengarahkan perahu kertas Anda.',
    steeringDescMobile: 'Geser dengan lembut di layar atau gunakan touchpad di layar untuk mengemudi alami.',
    currentsHeader: '🌊 Arus Sungai & Rintangan:',
    currentsDesc: 'Hindari batu besar, ranting tumbang, dan pusaran air! Daun teratai dan bebek ramah lembut dan tidak merusak perahu.',
    goalHeader: '💎 Tujuan Perjalanan:',
    goalDesc: 'Kumpulkan permata merah berkilau untuk mendapatkan 3 bintang. Lewati pos lentera dan lalui gerbang akhir!',
    understood: 'Paham',

    // QRIS Modal
    qrisTitle: 'Dukung Pengembang 💖',
    qrisSubtitle: 'Scan kode QRIS di bawah ini dengan aplikasi mobile banking atau e-wallet Anda.',
    downloadQr: '📥 Unduh QR Code',
    openPaypal: '🅿️ Buka PayPal (hanafidesar)',
    close: 'Tutup',
  }
};

export function getLocalizedLevel(id: number, lang: Language): LevelText {
  const dict = LEVEL_TRANSLATIONS[lang] || LEVEL_TRANSLATIONS.en;
  return dict[id] || LEVEL_TRANSLATIONS.en[id] || { title: `Level ${id}`, subtitle: '' };
}
