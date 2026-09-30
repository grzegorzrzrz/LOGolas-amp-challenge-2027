import React, { FC } from "react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

export type MarkdownProps = {
    className?: string
    children?: string
}

// This component is needed to apply a "react-markdown" class wrapper for all markdown entities.
// This is needed to define default global styles for <p> and <h#> tags only for markdown text.
export const Markdown: FC<MarkdownProps> = ({className, children}) => {
    return (
        <ReactMarkdown className={clsx("react-markdown", className)}>
            {children}
        </ReactMarkdown>
    )
};
