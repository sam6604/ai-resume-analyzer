import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

interface AccordionContextType {
    activeItems: string[];
    toggleItem: (id: string) => void;
    isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
    const ctx = useContext(AccordionContext);
    if (!ctx) throw new Error("Accordion components must be used within an Accordion");
    return ctx;
};

interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string;
    allowMultiple?: boolean;
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    children,
    defaultOpen,
    allowMultiple = false,
    className = "",
}) => {
    const [activeItems, setActiveItems] = useState<string[]>(defaultOpen ? [defaultOpen] : []);
    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
            }
            return prev.includes(id) ? [] : [id];
        });
    };
    const isItemActive = (id: string) => activeItems.includes(id);

    return (
        <AccordionContext.Provider value={{ activeItems, toggleItem, isItemActive }}>
            <div className={cn("flex flex-col gap-2", className)}>{children}</div>
        </AccordionContext.Provider>
    );
};

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ id, children, className = "" }) => (
    <div
        className={cn("rounded-xl overflow-hidden", className)}
        style={{
            background: "var(--color-card-bg)",
            border: "1px solid var(--color-border)",
        }}
    >
        {children}
    </div>
);

interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({ itemId, children, className = "" }) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <button
            type="button"
            onClick={() => toggleItem(itemId)}
            className={cn(
                "w-full text-left flex items-center justify-between gap-3 transition-colors duration-150 cursor-pointer",
                "hover:bg-[var(--color-card-bg-elevated)]",
                className
            )}
            style={{ padding: "16px 20px" }}
            aria-expanded={isActive}
        >
            <div className="flex-1 min-w-0">{children}</div>
            <svg
                className={cn("transition-transform duration-200 text-text-tertiary flex-shrink-0", {
                    "rotate-180": isActive,
                })}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </button>
    );
};

interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({ itemId, children, className = "" }) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);
    return (
        <div
            className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
        >
            <div className="overflow-hidden">
                <div
                    className={cn(className)}
                    style={{ padding: "20px", borderTop: "1px solid var(--color-border)" }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
