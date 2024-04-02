import React, {Fragment} from 'react';
import {Wallet} from 'components/sections/Wallet';

import type {ReactElement} from 'react';

export default function Index(): ReactElement {
	return <Wallet />;
}

Index.AppName = 'Wallet';
Index.AppDescription = 'If you want to see tokens form another chains - switch chain in the side bar.';
Index.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};
