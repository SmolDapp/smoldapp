import {useEffect, useRef} from 'react';

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

import type {RefObject} from 'react';

// Window Event based useEventListener interface
function useEventListener<TK extends keyof WindowEventMap>(
	eventName: TK,
	handler: (event: WindowEventMap[TK]) => void,
	element?: undefined,
	options?: boolean | AddEventListenerOptions,
): void

// Element Event based useEventListener interface
function useEventListener<
	TK extends keyof HTMLElementEventMap,
	T extends HTMLElement = HTMLDivElement
>(
	eventName: TK,
	handler: (event: HTMLElementEventMap[TK]) => void,
	element: RefObject<T>,
	options?: boolean | AddEventListenerOptions,
): void

// Document Event based useEventListener interface
function useEventListener<TK extends keyof DocumentEventMap>(
	eventName: TK,
	handler: (event: DocumentEventMap[TK]) => void,
	element: RefObject<Document>,
	options?: boolean | AddEventListenerOptions,
): void

function useEventListener<
	TKW extends keyof WindowEventMap,
	TKH extends keyof HTMLElementEventMap,
	T extends HTMLElement | void = void
>(
	eventName: TKW | TKH,
	handler: (
		event: WindowEventMap[TKW] | HTMLElementEventMap[TKH] | Event,
	) => void,
	element?: RefObject<T>,
	options?: boolean | AddEventListenerOptions
): void {
	// Create a ref that stores handler
	const savedHandler = useRef(handler);

	useIsomorphicLayoutEffect((): void => {
		savedHandler.current = handler;
	}, [handler]);

	useEffect((): void | VoidFunction => {
		// Define the listening target
		const targetElement: T | Window = element?.current || window;
		if (!(targetElement?.addEventListener)) {
			return;
		}

		// Create event listener that calls handler function stored in ref
		const eventListener: typeof handler = (event): any => savedHandler.current(event);

		targetElement.addEventListener(eventName, eventListener, options);

		// Remove event listener on cleanup
		return (): void => {
			targetElement.removeEventListener(eventName, eventListener);
		};
	}, [eventName, element, options]);
}

export default useEventListener;
