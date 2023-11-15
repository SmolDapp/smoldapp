import React, {useState} from 'react';
import Image from 'next/image';
import {useUpdateEffect} from '@react-hookz/web';

import type {ImageProps} from 'next/image';
import type {CSSProperties, ReactElement} from 'react';

function ImageWithFallback(props: ImageProps & {altSrc?: string}): ReactElement {
	const {alt, src, altSrc, ...rest} = props;
	const [imageSrc, set_imageSrc] = useState(altSrc ? src : `${src}?fallback=true`);
	const [imageStyle, set_imageStyle] = useState<CSSProperties>({});

	useUpdateEffect((): void => {
		set_imageSrc(altSrc ? src : `${src}?fallback=true`);
		set_imageStyle({});
	}, [src]);

	return (
		<Image
			alt={alt}
			src={imageSrc}
			loading={'eager'}
			className={'animate-fadeIn'}
			style={{
				minWidth: props.width,
				minHeight: props.height,
				maxWidth: props.width,
				maxHeight: props.height,
				...imageStyle
			}}
			onError={(): void => {
				if (altSrc && imageSrc !== `${altSrc}?fallback=true`) {
					set_imageSrc(`${altSrc}?fallback=true`);
					return;
				}
				set_imageSrc('/placeholder.png');
				set_imageStyle({filter: 'opacity(0.2)'});
			}}
			{...rest}
		/>
	);
}

export {ImageWithFallback};
