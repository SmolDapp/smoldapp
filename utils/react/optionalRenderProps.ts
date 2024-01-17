import type {ReactNode} from 'react';

export type TOptionalRenderProps<TProps, TChildren = ReactNode> = TChildren | ((renderProps: TProps) => TChildren);

export const optionalRenderProps = <TProps>(children: TOptionalRenderProps<TProps>, renderProps: TProps): ReactNode =>
	typeof children === 'function' ? children(renderProps) : children;
