import React, {useState} from 'react';
import Image from 'next/image';
import {useUpdateEffect} from '@react-hookz/web';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ImageProps} from 'next/image';
import type {CSSProperties, ReactElement} from 'react';

function ImageWithFallback(props: ImageProps): ReactElement {
	const {alt, src, ...rest} = props;
	const [imageSrc, set_imageSrc] = useState(`${src}?fallback=true`);
	const [imageStyle, set_imageStyle] = useState<CSSProperties>({});

	useUpdateEffect((): void => {
		set_imageSrc(`${src}?fallback=true`);
		set_imageStyle({});
	}, [src]);

	return (
		<Image
			alt={alt}
			src={imageSrc}
			style={imageStyle}
			loading={'eager'}
			onError={(): void => {
				performBatchedUpdates((): void => {
					set_imageSrc('/placeholder.png');
					set_imageStyle({filter: 'opacity(0.2)'});
				});
			}}
			{...rest}
		/>
	);
}

export {ImageWithFallback};
