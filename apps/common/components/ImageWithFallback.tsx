import React, {useState} from 'react';
import Image from 'next/image';

import type {ImageProps} from 'next/image';
import type {ReactElement} from 'react';

function	ImageWithFallback(props: ImageProps): ReactElement {
	const {alt, src, ...rest} = props;
	const [imageSrc, set_imageSrc] = useState(src);

	return (
		<Image
			alt={alt}
			src={imageSrc}
			loading={'eager'}
			onError={(): void => {
				set_imageSrc('/placeholder.png');
			}}
			{...rest}
		/>
	);
}

export {ImageWithFallback};
