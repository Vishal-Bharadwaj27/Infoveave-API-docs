import Image from 'next/image';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import logo from '@/app/logo/infoveave_logo.jpg';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    links: [
      {
        type: 'icon',
        label: 'Infoveave',
        text: 'Infoveave',
        url: 'https://infoveave.com',
        external: true,
        icon: (
          <Image
            src={logo}
            alt="Infoveave"
            width={28}
            height={28}
            className="object-contain"
          />
        ),
      },
    ],
  };
}
