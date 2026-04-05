"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';

function remarkSourceLine() {
    return (tree) => {
        function visit(node) {
            if (node.position && node.type !== 'text') {
                node.data = node.data || {};
                node.data.hProperties = node.data.hProperties || {};
                node.data.hProperties['data-line'] = node.position.start.line;
            }
            if (node.children) {
                node.children.forEach(visit);
            }
        }
        visit(tree);
    };
}

export default function MarkdownContent({content}) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkSourceLine]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
        >
            {content || "내용이 없습니다."}
        </ReactMarkdown>
    );
}