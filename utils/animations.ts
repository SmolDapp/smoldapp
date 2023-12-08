const transition = {duration: 0.6, ease: [0.17, 0.67, 0.83, 1], height: {duration: 0}};
const thumbnailVariants = {
	initial: {y: 0, opacity: 0, transition},
	enter: {y: 0, opacity: 1, transition},
	exit: {y: 0, opacity: 1, transition}
};

const initial = {duration: 0.6, ease: 'easeInOut', delay: 0.2};
const animate = {duration: 0.6, ease: 'easeInOut'};
const out = {duration: 0.2, ease: 'easeInOut'};
export const appWrapperVariants = {
	initial: {scale: 0.9, opacity: 0, transition: initial},
	animate: (isReady: boolean) => ({scale: 1, opacity: 1, transition: isReady ? animate : initial}),
	exit: {scale: 0.9, opacity: 0, transition: out}
};

export function scrollToTargetAdjusted(element: HTMLElement): void {
	const headerOffset = 32;
	if (!element) {
		return;
	}
	const elementPosition = element.getBoundingClientRect().top;
	const offsetPosition = elementPosition + window.scrollY - headerOffset;
	window.scrollTo({
		top: Math.round(offsetPosition),
		behavior: 'smooth'
	});
}

export default thumbnailVariants;
