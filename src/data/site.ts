export const MAIN_SITE = 'https://qracon.entangletech.tw/2026';

export const mainSite = (path = '/') => `${MAIN_SITE}${path}`;

export type RegistrationStatus = 'soon' | 'open' | 'closed';

export const site = {
  name: 'QRACON 2026 量子塔羅',
  eventName: 'QRACON 2026',
  description: '七張牌，七種量子態。抽一張，看你現在比較像哪一種。',
  dateLabel: '2026.12.13',
  registration: {
    status: 'open' as RegistrationStatus,
    url: 'https://sqcs.kktix.cc/events/qracon2026',
  },
} as const;
