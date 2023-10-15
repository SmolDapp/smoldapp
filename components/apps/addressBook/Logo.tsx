import React from 'react';

import type {ReactElement} from 'react';

function	LogoAddressBook(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg {...props} width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
			<line y1="-15" x2="203.242" y2="-15" transform="matrix(0.942525 -0.334135 0.350041 0.936734 73.4377 157.91)" stroke="black" stroke-width="30"/>
			<line y1="-15" x2="203.242" y2="-15" transform="matrix(0.942525 0.334135 -0.350041 0.936734 245.204 90)" stroke="black" stroke-width="30"/>
			<line y1="-15" x2="305.354" y2="-15" transform="matrix(0.265245 -0.964181 0.96759 0.252526 366.006 426.702)" stroke="black" stroke-width="30"/>
			<line y1="-15" x2="305.354" y2="-15" transform="matrix(0.265245 0.964181 -0.96759 0.252526 64 132.285)" stroke="black" stroke-width="30"/>
			<line y1="-15" x2="122.127" y2="-15" transform="matrix(0.910489 0.413533 -0.431815 0.901962 145.164 426.442)" stroke="black" stroke-width="30"/>
			<line y1="-15" x2="120.588" y2="-15" transform="matrix(0.907864 -0.419265 0.437686 0.899128 256.529 477)" stroke="black" stroke-width="30"/>
			<path d="M196.6 246.195C189.836 241.411 180.339 242.917 175.388 249.559C170.436 256.2 171.905 265.463 178.668 270.246L196.6 246.195ZM178.668 270.246L257.945 326.32L275.876 302.269L196.6 246.195L178.668 270.246Z" fill="black"/>
			<path d="M346.973 214.677C352.057 208.136 350.773 198.848 344.105 193.931C337.437 189.015 327.911 190.332 322.827 196.873L346.973 214.677ZM259.975 326.612L346.973 214.677L322.827 196.873L235.829 308.808L259.975 326.612Z" fill="black"/>
		</svg>
	);
}

export default LogoAddressBook;
