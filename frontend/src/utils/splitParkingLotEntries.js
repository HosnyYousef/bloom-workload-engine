export const splitEntries = (draft) => draft
    .split(/\n+/)
    .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

const ALLOWED_TAGS = new Set(['B', 'BR', 'DIV', 'EM', 'I', 'LI', 'OL', 'P', 'STRONG', 'UL']);

export const sanitizeEditorHtml = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html || '';

    const cleanNode = (node) => {
        for (const child of [...node.children]) {
            cleanNode(child);
            if (!ALLOWED_TAGS.has(child.tagName)) {
                child.replaceWith(...child.childNodes);
                continue;
            }
            for (const attribute of [...child.attributes]) {
                child.removeAttribute(attribute.name);
            }
        }
    };

    cleanNode(template.content);
    return template.innerHTML;
};

export const editorTextFromElement = (element) => {
    if (!element) return '';

    const readNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
        if (node.nodeName === 'BR') return '\n';

        const text = [...node.childNodes].map(readNode).join('');
        return ['DIV', 'LI', 'P'].includes(node.nodeName) ? `${text}\n` : text;
    };

    return [...element.childNodes].map(readNode).join('').replace(/\n{3,}/g, '\n\n').trimEnd();
};
