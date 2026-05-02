'use client';

import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {redo, undo} from 'prosemirror-history';
import {BlockNoteView} from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/core/fonts/inter.css";
import blogStyles from '@/styles/pages/BlogPostPage.module.css';

const AdminBlockEditor = forwardRef(function AdminBlockEditor({initialContent, onChange, onUploadImage, theme}, ref) {
    const [editor, setEditor] = useState(null);
    const onUploadImageRef = useRef(onUploadImage);
    const containerRef = useRef(null);

    useEffect(() => {
        onUploadImageRef.current = onUploadImage;
    }, [onUploadImage]);

    // To prevent SSR mismatch
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Load BlockNote dynamically to avoid "window is not defined" server-side
    // Only run once on mount — initialContent is only used for the initial load.
    // Recreating the editor on every content change would destroy menus and reset scroll.
    useEffect(() => {
        if (typeof window === 'undefined') return;

        import('@blocknote/core').then(async ({BlockNoteEditor}) => {
            const tempEditor = BlockNoteEditor.create({
                uploadFile: (file) => onUploadImageRef.current(file),
            });

            // Try formatting initial markdown
            if (initialContent) {
                const blocks = await tempEditor.tryParseMarkdownToBlocks(initialContent);
                tempEditor.replaceBlocks(tempEditor.document, blocks);
            }

            setEditor(tempEditor);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty — editor must only be created once

    // BlockNote's paste handler may truncate multi-paragraph text on some browsers/devices.
    // We intercept paste in the capture phase, and if the clipboard text contains
    // multiple paragraphs we handle insertion ourselves via tryParseMarkdownToBlocks.
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !editor) return;

        const handlePaste = (e) => {
            const html = e.clipboardData?.getData('text/html');
            const text = e.clipboardData?.getData('text/plain');

            if (!html && (!text || !text.includes('\n'))) return;

            e.preventDefault();
            e.stopPropagation();

            let block;
            try {
                block = editor.getTextCursorPosition().block;
            } catch {
                const doc = editor.document;
                block = doc[doc.length - 1];
            }
            if (!block) return;

            if (html) {
                const blocks = editor.tryParseHTMLToBlocks(html);
                if (blocks.length) {
                    editor.insertBlocks(blocks, block, 'after');
                    return;
                }
            }

            if (!text) return;
            const paragraphs = text
                .split('\n')
                .filter((line) => line.trim().length > 0)
                .map((line) => ({type: 'paragraph', content: [{type: 'text', text: line}]}));
            if (!paragraphs.length) return;
            editor.insertBlocks(paragraphs, block, 'after');
        };

        container.addEventListener('paste', handlePaste, true);
        return () => container.removeEventListener('paste', handlePaste, true);
    }, [editor]);

    // Handle drop of orphan images directly onto the editor (when sidebar is closed).
    // Use capture phase so BlockNote's own drag handlers don't interfere.
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !editor) return;

        const onDragOver = (e) => {
            if (e.dataTransfer.types.includes('application/x-orphan-image-url')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }
        };

        const onDrop = (e) => {
            const url = e.dataTransfer.getData('application/x-orphan-image-url');
            if (!url) return;
            e.preventDefault();
            e.stopPropagation();
            const doc = editor.document;
            const lastBlock = doc[doc.length - 1];
            editor.insertBlocks(
                [{type: 'image', props: {url, caption: '', previewWidth: 512}}],
                lastBlock,
                'after'
            );
        };

        container.addEventListener('dragover', onDragOver, true);
        container.addEventListener('drop', onDrop, true);
        return () => {
            container.removeEventListener('dragover', onDragOver, true);
            container.removeEventListener('drop', onDrop, true);
        };
    }, [editor]);

    // Expose insertImage, undo, redo, loadMarkdown so parent can call them
    useImperativeHandle(ref, () => ({
        insertImage: (url) => {
            if (!editor) return;
            const doc = editor.document;
            const lastBlock = doc[doc.length - 1];
            editor.insertBlocks(
                [{type: 'image', props: {url, caption: '', previewWidth: 512}}],
                lastBlock,
                'after'
            );
        },
        undo: () => {
            const view = editor?._tiptapEditor?.view;
            if (!view) return;
            undo(view.state, view.dispatch);
        },
        redo: () => {
            const view = editor?._tiptapEditor?.view;
            if (!view) return;
            redo(view.state, view.dispatch);
        },
        loadMarkdown: async (markdown) => {
            if (!editor) return;
            const blocks = await editor.tryParseMarkdownToBlocks(markdown);
            editor.replaceBlocks(editor.document, blocks);
        },
    }), [editor]);

    // Apply specific Theme for BlockNote to sync colors with our layout
    const editorTheme = useMemo(() => {
        const isDark = theme === 'dark' || (typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark');

        // Generic color map based on globals.css
        const colors = {
            editor: {
                text: 'var(--color-text-primary)',
                background: 'transparent', // Make it transparent to mix with blog background
            },
            menu: {
                text: 'var(--color-text-primary)',
                background: 'var(--color-surface)',
            },
            tooltip: {
                text: 'var(--color-text-primary)',
                background: 'var(--color-surface)',
            },
            hovered: {
                text: 'var(--color-text-primary)',
                background: 'var(--color-base-7)',
            },
            selected: {
                text: 'var(--color-text-primary)',
                background: 'var(--color-base-7)',
            },
            disabled: {
                text: 'var(--color-gray-50)',
                background: 'var(--color-surface)',
            },
            shadow: '0px 4px 12px var(--color-overlay-1)',
            border: 'var(--color-base-9)',
            sideMenu: 'var(--color-text-tertiary)',
            highlights: {} // default
        };
        return isDark ? {dark: {colors}} : {light: {colors}};
    }, [theme]);

    const handleEditorChange = useCallback(async () => {
        if (!editor) return;
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        onChange(markdown);
    }, [editor, onChange]);

    if (!isMounted) return <div style={{padding: 20}}>Loading editor...</div>;
    if (!editor) return <div style={{padding: 20}}>Loading editor...</div>;

    // Apply blog style classes to a wrapper, but note that BlockNote also has its own CSS reset inside `.bn-editor`.
    // By wrapping it here, elements like quotes, links, etc. can inherit some CSS rules if BlockNote doesn't enforce strict selectors.
    return (
        <div className={blogStyles.postContent} ref={containerRef}>
            <BlockNoteView
                editor={editor}
                theme={editorTheme}
                onChange={handleEditorChange}
            />
        </div>
    );
});

export default AdminBlockEditor;
