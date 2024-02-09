import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react'

/**
 * Utility type to declare the type of a `forwardRef` component so that the type is not "evaluated" in the declaration
 * file.
 */
export type ForwardRefComponent<P, T> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>