import Layout from 'components/designSystem/Layout';

import type {ReactElement} from 'react';

export default function Component(): ReactElement {
	return (
		<div className={'fixed inset-0 flex items-center justify-center'}>
			<Layout />
		</div>
	);
}
