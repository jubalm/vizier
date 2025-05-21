import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isBusy?: boolean
}

const Button = ({ children, className, isBusy, disabled, ...props }: ButtonProps) => (
  <button
    type="submit"
    className={cn("bg-primary text-loud-foreground px-5 py-2 rounded font-bold hover:bg-[oklch(from_var(--color-primary)_calc(l_+_0.05)_c_h)] transition-colors hover:cursor-pointer", className)}
    disabled={disabled}
    {...props}
  >
    {isBusy ? (
      <span className='relative flex items-center justify-center'>
        {/* Spinner icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin opacity-50"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        {/* Stop (square) icon overlay */}
        <svg width="8" height="8" viewBox="0 0 0.188 0.188" xmlns="http://www.w3.org/2000/svg" className="absolute mx-auto"><path d="M0.163 0.175H0.025a0.013 0.013 0 0 1 -0.013 -0.013V0.025a0.013 0.013 0 0 1 0.013 -0.013h0.138a0.013 0.013 0 0 1 0.013 0.013v0.138a0.013 0.013 0 0 1 -0.013 0.013" fill='currentColor' /></svg>
      </span>
    ) : children}
  </button>
)

export default Button
