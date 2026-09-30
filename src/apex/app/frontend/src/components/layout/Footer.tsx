import React, { FC } from 'react';
import clsx from "clsx";
import {appTexts} from "../../texts";
import { Link } from "react-router-dom";

export type FooterProps = {
    className?: string
}

export const Footer: FC<FooterProps> = ({className}) => {
    return (
        <>
            <div className={clsx("bg-gray-100 border-t border-gray-300 p-2 text-center", className)}>
                <div>{appTexts.footerTexts.copyright}</div>
                <div className="mt-1">
                    <Link to="/legal" className="text-blue-600 hover:underline">
                        {appTexts.footerTexts.legalLink}
                    </Link>
                </div>
            </div>
        </>
    )
};
