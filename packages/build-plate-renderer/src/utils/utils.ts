import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react'
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility type to declare the type of a `forwardRef` component so that the type is not "evaluated" in the declaration
 * file.
 */
export type ForwardRefComponent<P, T> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>

// eslint-disable-next-line import/prefer-default-export
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}