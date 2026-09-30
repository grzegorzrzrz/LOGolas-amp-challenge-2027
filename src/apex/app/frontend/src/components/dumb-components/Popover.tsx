import { FC, ReactNode, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface PopoverProps {
    content: string | ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const Popover: FC<PopoverProps> = ({
    content,
    children,
    position = 'bottom',
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(!isOpen);
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const positionClasses = {
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    return (
        <div ref={popoverRef} className={clsx('relative inline-flex items-center', className)}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="cursor-pointer"
            >
                {children}
            </div>

            {isOpen && (
                <div
                    role="tooltip"
                    className={clsx(
                        'absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-700 max-w-xs min-w-60 z-50',
                        'transition-opacity duration-200',
                        positionClasses[position]
                    )}
                >
                    {typeof content === 'string' ? <p>{content}</p> : content}
                </div>
            )}
        </div>
    );
};
