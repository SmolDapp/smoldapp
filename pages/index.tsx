import React from 'react';
import Balancer from 'react-wrap-balancer';
import Link from 'next/link';
import LogoMigratooor from 'components/icons/LogoMigratooor';
import LogoTokenlistooor from 'components/icons/LogoTokenlistooor';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useClientEffect} from '@yearn-finance/web-lib/hooks/useClientEffect';

import type {ReactElement} from 'react';

const	apps = [
	{
		href: '/migratooor',
		title: 'Migratooor',
		description: 'The easiest way to migrate your tokens from one wallet to another.',
		icon: <LogoMigratooor className={'h-[80px] w-[80px]'} />
	}, {
		href: '/tokenlistooor',
		title: 'Tokenlistooor',
		description: 'Up to date token lists that fulfill your needs! A fork of Uniswap Tokenlists, with focus on adding automation.',
		icon: <LogoTokenlistooor className={'h-[80px] w-[80px]'} />
	}
];

function	AppBox({app}: {app: typeof apps[0]}): ReactElement {
	useClientEffect((): VoidFunction => {
		const featuresEl = document.getElementById(app.href);
		if (featuresEl) {
			const	cleanup = (): void => {
				featuresEl.removeEventListener('pointermove', pointermove);
				featuresEl.removeEventListener('pointerleave', pointerleave);
			};

			const	pointermove = (ev: MouseEvent): void => {
				const rect = featuresEl.getBoundingClientRect();
				if (featuresEl?.style) {
					featuresEl.style.setProperty('--opacity', '0.3');
					featuresEl.style.setProperty('--x', (ev.clientX - rect.left).toString());
					featuresEl.style.setProperty('--y', (ev.clientY - rect.top).toString());
				}
			};

			const	pointerleave = (): void => {
				if (featuresEl?.style) {
					featuresEl.style.setProperty('--opacity', '0');
				}
			};

			featuresEl.addEventListener('pointermove', pointermove);
			featuresEl.addEventListener('pointerleave', pointerleave);
			return cleanup;
		}
		return (): void => undefined;
	}, []);

	return (
		<Link
			prefetch={false}
			key={app.href}
			href={app.href}
			className={'relative z-10 bg-neutral-0'}>
			<div id={app.href} className={'appBox'}>
				<div className={'box-0 !rounded-full p-2'}>
					{app.icon}
				</div>
				<div className={'pt-6 text-left'}>
					<b className={'text-lg'}>{app.title}</b>
					<p>{app.description}</p>
				</div>
			</div>
		</Link>
	);
}

function	Index(): ReactElement {
	return (
		<div className={'mx-auto mt-10 grid w-full max-w-4xl'}>
			<div className={'mx-auto mt-6 mb-10 flex flex-col justify-center md:mt-20 md:mb-14'}>
				<div className={'relative h-12 w-[300px] self-center md:h-[104px] md:w-[600px]'}>
					<div className={'text'}>
						<p className={'wordWrapper'}>
							<span className={'word'} style={{'opacity': 1}}>{'Smol Dapp'}</span>
						</p>
					</div>
				</div>
				<div className={'mt-8 mb-2'}>
					<p className={'text-center text-lg md:text-2xl'}>
						{'The registry for small, simple, and secure dapps for all your needs.'}
					</p>
				</div>
				<div className={'mb-8'}>
					<p className={'text-center text-sm text-neutral-500 md:text-base'}>
						<Balancer>
							{'With an always growing list of dapps, it\'s difficult to find the right one for you. Smol Dapp is a registry of quality dapps build by trusted members of the community.'}
						</Balancer>
					</p>
				</div>
				<div className={'mb-12 flex flex-row items-center justify-center space-x-6'}>
					<Link href={'https://twitter.com/smoldapp'}>
						<Button className={'w-[140px]'}>
							{'Twitter'}
						</Button>
					</Link>
					<Link href={'https://t.me/smoldapp'}>
						<Button className={'w-[140px]'}>
							{'Telegram'}
						</Button>
					</Link>
				</div>
			</div>
			<section className={'grid grid-cols-1 gap-10 md:grid-cols-2'}>
				{apps.map((app): ReactElement => <AppBox key={app.href} app={app} />)}
			</section>
		</div>
	);
}

export default Index;
