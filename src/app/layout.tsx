import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Script from 'next/script';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DHLM 로또 번호 생성기 | 행운의 번호를 뽑아보세요',
  description:
    '무료 로또 번호 생성기. 랜덤, 꿈해몽, 고정수 포함, 제외수, 홀짝비율 등 다양한 방식으로 로또 번호를 생성하세요. 당첨번호 조회와 통계까지!',
  metadataBase: new URL('https://lotto.dhlm-studio.com'),
  openGraph: {
    title: 'DHLM 로또 번호 생성기',
    description: '행운의 로또 번호를 뽑아보세요! 무료 번호 생성기',
    url: 'https://lotto.dhlm-studio.com',
    siteName: 'DHLM 로또',
    locale: 'ko_KR',
    type: 'website',
  },
  keywords: [
    '로또',
    '로또번호',
    '번호생성기',
    '로또당첨',
    '꿈해몽',
    'DHLM',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full`}>
      <head>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakNGPyZR"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5182634360822108"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-white"
        style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
      >
        <div className="flex-1 max-w-[480px] mx-auto w-full pb-16">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}
