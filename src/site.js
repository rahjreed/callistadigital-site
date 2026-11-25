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
    name: 'PRESSURE',
    category: 'Health & wellness app',
    description: 'A free blood pressure tracking app with guided logging, trends, measurement history and export tools.',
    url: 'https://pressure.callistadigital.com/',
    action: 'Open PRESSURE',
    artwork: 'pressure',
  },
  {
    name: tools[0].name,
    category: 'Creator utility · Presented by Travel Pro X',
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
    name: 'Travel Pro X',
    category: 'Travel technology · A Callista Digital Company',
    description: 'Our independent travel marketing technology brand, offering creator tools, marketing resources and an upcoming personalized funnel builder.',
    url: 'https://www.travelprox.com/',
    action: 'Visit Travel Pro X',
    artwork: 'travel',
  },
];
