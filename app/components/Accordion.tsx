import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

interface AccordionContextType {
    activeItems: string[];
    toggleItem: (id: string) => void;
    isItemActive: (id: string) => boolean;
}

<<<<<<< Updated upstream
const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
    const ctx = useContext(AccordionContext);
    if (!ctx) throw new Error("Accordion components must be used within an Accordion");
    return ctx;
=======
const AccordionContext = createContext<AccordionContextType | undefined>(
    undefined
);

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion");
    }
    return context;
>>>>>>> Stashed changes
};

interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string;
    allowMultiple?: boolean;
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
<<<<<<< Updated upstream
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
=======
                                                        children,
                                                        defaultOpen,
                                                        allowMultiple = false,
                                                        className = "",
                                                    }) => {
    const [activeItems, setActiveItems] = useState<string[]>(
        defaultOpen ? [defaultOpen] : []
    );

    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id];
            } else {
                return prev.includes(id) ? [] : [id];
            }
        });
    };

    const isItemActive = (id: string) => activeItems.includes(id);

    return (
        <AccordionContext.Provider
            value={{ activeItems, toggleItem, isItemActive }}
        >
            <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
>>>>>>> Stashed changes
        </AccordionContext.Provider>
    );
};

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

<<<<<<< Updated upstream
export const AccordionItem: React.FC<AccordionItemProps> = ({ id, children, className = "" }) => (
    <div
        className={cn("bg-white rounded-xl overflow-hidden", className)}
        style={{ border: "1px solid var(--color-border)" }}
    >
        {children}
    </div>
);
=======
export const AccordionItem: React.FC<AccordionItemProps> = ({
                                                                id,
                                                                children,
                                                                className = "",
                                                            }) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(id);

    return (
        <div className={`glass-card !rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-indigo-500/20' : 'hover:border-indigo-100'} ${className}`}>
            {children}
        </div>
    );
};
>>>>>>> Stashed changes

interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
<<<<<<< Updated upstream
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({ itemId, children, className = "" }) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <button
            type="button"
            onClick={() => toggleItem(itemId)}
            className={cn(
                "w-full text-left flex items-center justify-between gap-3 transition-colors duration-150 cursor-pointer hover:bg-gray-50",
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
=======
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
                                                                    itemId,
                                                                    children,
                                                                    className = "",
                                                                    icon,
                                                                    iconPosition = "right",
                                                                }) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    const defaultIcon = (
        <div className={cn("size-8 rounded-full bg-slate-100 flex items-center justify-center transition-all duration-300", {
            "bg-indigo-600 rotate-180": isActive,
        })}>
            <svg
                className={cn("w-4 h-4 transition-colors", {
                    "text-white": isActive,
                    "text-slate-400": !isActive,
                })}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </div>
    );

    const handleClick = () => {
        toggleItem(itemId);
    };

    return (
        <button
            onClick={handleClick}
            className={`
        w-full px-6 py-5 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer
        hover:bg-slate-50/50
        ${isActive ? 'bg-slate-50/50' : ''}
        ${className}
      `}
        >
            <div className="flex items-center space-x-3 flex-1">
                {iconPosition === "left" && (icon || defaultIcon)}
                <div className="flex-1">{children}</div>
            </div>
            {iconPosition === "right" && (icon || defaultIcon)}
>>>>>>> Stashed changes
        </button>
    );
};

interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

<<<<<<< Updated upstream
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
=======
export const AccordionContent: React.FC<AccordionContentProps> = ({
                                                                      itemId,
                                                                      children,
                                                                      className = "",
                                                                  }) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <div
            className={`
        overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isActive ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        ${className}
      `}
        >
            <div className="px-6 pb-6 pt-2">{children}</div>
>>>>>>> Stashed changes
        </div>
    );
};
