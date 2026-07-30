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

const cleanEntryText = (text) => text
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '')
    .trim();

const visibleTextWithoutNestedLists = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeName === 'BR') return '\n';
    if (['UL', 'OL'].includes(node.nodeName)) return '';

    const text = [...node.childNodes].map(visibleTextWithoutNestedLists).join('');
    return ['DIV', 'P'].includes(node.nodeName) ? `${text}\n` : text;
};

const listItemOwnLines = (item) => splitEntries(
    [...item.childNodes].map(visibleTextWithoutNestedLists).join('')
);

const nestedStepTexts = (item) => [...item.children]
    .filter(child => ['UL', 'OL'].includes(child.tagName))
    .flatMap(list => [...list.children].flatMap(step => {
        return [...listItemOwnLines(step), ...nestedStepTexts(step)].filter(Boolean);
    }));

const allListItemTexts = (list) => [...list.children].flatMap(child => {
    if (child.tagName === 'LI') {
        return [...listItemOwnLines(child), ...nestedStepTexts(child)].filter(Boolean);
    }
    return ['UL', 'OL'].includes(child.tagName) ? allListItemTexts(child) : [];
});

export const structuredEntriesFromElement = (element) => {
    if (!element) return [];
    const entries = [];

    const addPlainText = (text) => {
        for (const line of splitEntries(text)) entries.push({ text: line, steps: [] });
    };

    for (const node of element.childNodes) {
        if (['UL', 'OL'].includes(node.nodeName)) {
            let previousEntry = null;
            for (const item of node.children) {
                if (item.tagName === 'LI') {
                    const lines = listItemOwnLines(item);
                    if (lines.length > 0) {
                        previousEntry = { text: cleanEntryText(lines[0]), steps: nestedStepTexts(item) };
                        entries.push(previousEntry);
                        for (const text of lines.slice(1)) entries.push({ text: cleanEntryText(text), steps: [] });
                    }
                } else if (['UL', 'OL'].includes(item.tagName) && previousEntry) {
                    previousEntry.steps.push(...allListItemTexts(item));
                }
            }
        } else if (node.nodeName === 'BR') {
            continue;
        } else {
            addPlainText(visibleTextWithoutNestedLists(node));
        }
    }

    return entries;
};
