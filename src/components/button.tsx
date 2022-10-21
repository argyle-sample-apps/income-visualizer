import { forwardRef, ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  as?: React.ElementType;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef(
  (
    { onClick, href, children, as = "button", disabled = false }: ButtonProps,
    ref
  ) => {
    const Element = as;
    return (
      <Element
        href={href}
        onClick={disabled ? () => {} : onClick}
        ref={ref}
        className={clsx(
          "block rounded-full bg-gray-darkest py-3 px-6 text-xl text-white",
          {
            "opacity-30": disabled,
          }
        )}
        disabled={disabled}
      >
        {children}
      </Element>
    );
  }
);

export const InlineButton = forwardRef(
  (
    {
      onClick,
      href,
      children,
      as = "button",
      disabled = false,
      className,
    }: ButtonProps,
    ref
  ) => {
    const Element = as;
    return (
      <Element
        href={href}
        onClick={disabled ? () => {} : onClick}
        ref={ref}
        className={clsx("block text-xl text-orange-dark", className, {
          "opacity-30": disabled,
        })}
      >
        {children}
      </Element>
    );
  }
);

type PillButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hasBackground?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const PillButton = ({
  children,
  onClick,
  leftIcon,
  rightIcon,
  hasBackground,
}: PillButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-none items-center space-x-2 rounded-full px-3 py-1 text-sm",
        {
          "bg-gray-100": hasBackground,
        }
      )}
    >
      {leftIcon}
      <span className={clsx(hasBackground ? "text-gray-darkest" : "text-gray")}>
        {children}
      </span>
      {rightIcon}
    </button>
  );
};

Button.displayName = "Button";
InlineButton.displayName = "InlineButton";
