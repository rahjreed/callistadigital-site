import { Camera, QrCode } from 'lucide-react';

export const email = 'hello@callistadigital.com';

export const tools = [
  {
    name: 'Mr. Prompterson',
    description: 'A free online teleprompter for video creators.',
    url: 'https://teleprompter.callistadigital.com/',
    icon: Camera,
  },
  {
    name: 'QR Code Generator',
    description: 'Simple QR code creation for creators, businesses, and marketers.',
    icon: QrCode,
  },
];

export const projects = [
  {
    name: tools[0].name,
    category: 'Creator utility',
    description: 'A browser-based video teleprompter that helps creators read a script while recording.',
    url: tools[0].url,
    action: 'Open teleprompter',
    artwork: 'prompter',
    image: '/work/prompterson.svg',
  },
  {
    name: "Kingdom Race: The Lion’s Gate",
    category: 'Interactive game · R2G2',
    description: 'A single-player Scripture trivia game with animated combat, built under Callista Digital’s R2G2 creative gaming label.',
    url: 'https://lionsgate.callistadigital.com/',
    action: 'Play the game',
    artwork: 'kingdom',
    image: '/work/kingdom-race.webp',
  },
  {
    name: 'Close & Relax',
    category: 'Customer portal',
    description: 'A post-closing resource hub that helps real estate agents stay connected with homeowners.',
    url: 'https://www.closeandrelax.com/',
    action: 'Visit Close & Relax',
    artwork: 'close',
  },
  {
    name: 'Roger With Vivint',
    category: 'Business website',
    description: 'A customer hub for smart-home inquiries, referrals, and support resources.',
    url: 'https://www.rogerwithvivint.com/',
    action: 'Visit Roger With Vivint',
    artwork: 'roger',
  },
];
