import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
export function cn(...inputs:ClassValue[]){return twMerge(clsx(inputs));}
const buttonVariants=cva('ui-button',{variants:{variant:{default:'ui-primary',outline:'ui-outline',ghost:'ui-ghost',destructive:'ui-destructive'},size:{default:'',sm:'ui-sm',icon:'ui-icon'}},defaultVariants:{variant:'default',size:'default'}});
export function Button({className,variant,size,asChild=false,...props}:React.ComponentProps<'button'>&VariantProps<typeof buttonVariants>&{asChild?:boolean}){const Comp=asChild?Slot:'button';return <Comp className={cn(buttonVariants({variant,size}),className)} {...props}/>}
export function Input({className,...props}:React.ComponentProps<'input'>){return <input className={cn('ui-input',className)} {...props}/>}
export function Textarea({className,...props}:React.ComponentProps<'textarea'>){return <textarea className={cn('ui-input ui-textarea',className)} {...props}/>}
export function Badge({children}:React.PropsWithChildren){return <span className="ui-badge">{children}</span>}
