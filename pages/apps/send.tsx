import {Fragment} from 'react';
import {SmolAddressInput} from 'components/designSystem/SmolAddressInput';
import {Button} from '@common/Primitives/Button';

import type {ReactElement} from 'react';

function SendPage(): ReactElement {
	return (
		<Fragment>
			<div className={'mb-6'}>
				<p className={'font-medium'}>{'Receiver'}</p>
				<SmolAddressInput />
			</div>
			<div className={'mb-4'}>
				<p className={'font-medium'}>{'Token'}</p>
				<SmolAddressInput />
			</div>
			<div className={'w-full max-w-[442px]'}>
				<Button className={'w-full'}>
					<b>{'Send'}</b>
				</Button>
			</div>
		</Fragment>
	);
}

SendPage.AppName = 'Send';
SendPage.AppDescription = 'Deliver any of your tokens anywhere';
SendPage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default SendPage;
