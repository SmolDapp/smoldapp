import React, {useState} from 'react';
import Image from 'next/image';

import type {ImageProps} from 'next/image';
import type {CSSProperties, ReactElement} from 'react';

function NFTWithFallback(props: ImageProps): ReactElement {
	const {alt, src, ...rest} = props;
	const [imageSrc, set_imageSrc] = useState(`${src}`);
	const [imageStyle, set_imageStyle] = useState<CSSProperties>({});

	return (
		<Image
			alt={alt}
			src={imageSrc}
			style={imageStyle}
			loading={'eager'}
			onError={(): void => {
				set_imageSrc('/placeholder-nft.png');
				set_imageStyle({filter: 'contrast(0.9)', borderRadius: 4});
			}}
			{...rest}
		/>
	);
}

export {NFTWithFallback};
