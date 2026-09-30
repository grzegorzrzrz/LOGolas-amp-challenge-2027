import React, { FC } from 'react';
import clsx from "clsx";
// import { ReactComponent as Logoc } from "@assets/images/DLFL-LOGO.svg";
import MySuperCustomIconComponent from "@assets/images/DLFL-LOGO.svg?react";


export type LogoProps = {
    className?: string
}

export const Logo: FC<LogoProps> = ({className}) => {
    return (
        <div className={className}>
            <MySuperCustomIconComponent/>
        </div>
    )
};
