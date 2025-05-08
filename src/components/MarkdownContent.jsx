"use client";

import {useRef} from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function MarkdownContent({content}) {
    // Create ref for heading counters
    const headingCounterRef = useRef(0);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                h1: ({node, ...props}) => {
                    const id = `heading-${headingCounterRef.current++}`;
                    return <h1 id={id} {...props} />;
                },
                h2: ({node, ...props}) => {
                    const id = `heading-${headingCounterRef.current++}`;
                    return <h2 id={id} {...props} />;
                },
                h3: ({node, ...props}) => {
                    const id = `heading-${headingCounterRef.current++}`;
                    return <h3 id={id} {...props} />;
                },
                h4: ({node, ...props}) => {
                    const id = `heading-${headingCounterRef.current++}`;
                    return <h4 id={id} {...props} />;
                },
                h5: ({node, ...props}) => {
                    const id = `heading-${headingCounterRef.current++}`;
                    return <h5 id={id} {...props} />;
                },
                h6: ({node, ...props}) => {
                    const id = `heading-${headingCounterRef.current++}`;
                    return <h6 id={id} {...props} />;
                }
            }}
        >
            {content || "내용이 없습니다."}
        </ReactMarkdown>
    );
}