'use client';

import React, {Fragment} from 'react';
import {type NextRouter, useRouter} from 'next/router';
import SectionHeader from 'components/sections/Header';
import AppWrapper from '@common/AppWrapper';

import type {NextComponentType} from 'next';
import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

type TGetLayout = NextComponentType & {
	getLayout: (p: ReactElement, router: NextRouter) => ReactElement;
};
export function BaseLayout(props: AppProps): ReactElement {
	const router = useRouter();
	const {Component} = props;
	const getLayout = (Component as TGetLayout).getLayout || ((page: ReactElement): ReactElement => page);

	return (
		<Fragment>
			<SectionHeader />
			{getLayout(<AppWrapper {...props} />, router)}
		</Fragment>
	);
}
