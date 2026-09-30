import { FC, ReactNode } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { Popover } from './Popover';

interface InfoIconProps {
    tooltip: string | ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoIcon: FC<InfoIconProps> = ({ tooltip, position = 'bottom' }) => {
    return (
        <Popover content={tooltip} position={position}>
            <AiOutlineQuestionCircle className="w-4 h-4 text-gray-500 hover:text-primary-500 transition-colors" />
        </Popover>
    );
};
