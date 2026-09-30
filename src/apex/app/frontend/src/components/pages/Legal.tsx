import React, { FC } from 'react';
import { appTexts } from "../../texts";
import { Markdown } from "../dumb-components/Markdown";

export type LegalProps = {}

export const Legal: FC<LegalProps> = ({}) => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">{appTexts.legalTexts.pageTitle}</h1>
            <Markdown className="prose prose-gray max-w-none">
                {appTexts.legalTexts.content}
            </Markdown>
        </div>
    );
};

export default Legal;
