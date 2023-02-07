
const transition = {duration: 0.3, ease: [0.17, 0.67, 0.83, 1], height: {duration: 0}};
const thumbnailVariants = {
	initial: {y: 20, opacity: 0, transition, height: 0},
	enter: {y: 0, opacity: 1, transition, height: 'auto'},
	exit: {y: -20, opacity: 1, transition, height: 'auto'}
};

export default thumbnailVariants;
