import React, {FC} from 'react';
import {Markdown} from "../dumb-components/Markdown";
import {appTexts} from "../../texts";

export type AboutProps = {}

export const About: FC<AboutProps> = ({}) => {
    const {title, text} = appTexts.aboutTexts;

    return (
        <div className="mx-auto max-w-4xl py-16 px-4">
            <h1 className="text-4xl font-bold mb-6 text-center">{title}</h1>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
                <Markdown>{text}</Markdown>
            </div>
        </div>
    )
};
