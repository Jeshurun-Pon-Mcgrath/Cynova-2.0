import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const styles = cva("button", { variants: { variant: { primary: "button-primary", secondary: "button-secondary", ghost: "button-ghost", danger: "button-danger" }, size: { md: "button-md", sm: "button-sm", icon: "button-icon" } }, defaultVariants: { variant: "primary", size: "md" } });
export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof styles>) { return <button className={cn(styles({ variant, size }), className)} {...props} />; }
