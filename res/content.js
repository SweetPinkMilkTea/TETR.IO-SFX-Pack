const contentRoot = document.getElementById('contenttable');
const audioCache = new Map();
const audioPlayer = new Audio();

function createCell(tag, className, text) {
    const cell = document.createElement(tag);
    if (className) cell.className = className;
    if (text !== undefined) cell.textContent = text;
    return cell;
}

function createHeaderRow() {
    const headerRow = document.createElement('div');
    headerRow.className = 'contenttable-row header';
    headerRow.appendChild(createCell('span', 'contenttable-key', 'Key'));
    headerRow.appendChild(createCell('span', 'contenttable-status', 'Status'));
    headerRow.appendChild(createCell('span', 'contenttable-source', 'Source'));
    headerRow.appendChild(createCell('span', 'contenttable-note', 'Note'));
    return headerRow;
}

function prepareRow(key, item, missing = false) {
    const row = document.createElement('div');
    row.className = 'contenttable-row' + (missing ? ' missing' : '');

    const keyCell = createCell('div', 'contenttable-key');
    keyCell.title = key;
    if (missing) {
        keyCell.classList.add('missing-key');
        keyCell.textContent = key;
    } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = key;
        button.title = key;
        button.addEventListener('click', async () => {
            button.disabled = true;
            const url = await findAudioUrl(key);
            if (!url) {
                button.textContent = key;
                button.disabled = false;
                window.alert(`Unable to find an SFX file for ${key}.`);
                return;
            }
            try {
                audioPlayer.src = url;
                await audioPlayer.play();
            } catch (error) {
                console.error('Playback failed for', key, url, error);
                window.alert(`Playback failed for ${key}. Please alert the developer.`);
            } finally {
                button.textContent = key;
                button.disabled = false;
            }
        });
        keyCell.appendChild(button);
    }

    const sourceCell = createCell('span', 'contenttable-source', missing ? '-' : (item.source || '-'));
    const noteCell = createCell('span', 'contenttable-note', missing ? '-' : (item.note || '-'));
    let statusCell;
    if (!missing) {
        statusCell = createCell('span', 'contenttable-status', formatState(item.state));
    } else {
        statusCell = createCell('span', 'contenttable-status missingattr', 'Missing');
    }

    row.appendChild(keyCell);
    row.appendChild(statusCell);
    if (!missing) {
        row.appendChild(sourceCell);
        row.appendChild(noteCell);
    }

    return row;
}

function formatState(value) {
    switch (value) {
        case 0:
            return 'Stable';
        case 1:
            return 'Unstable';
        case 2:
            return 'To be replaced';
        default:
            return String(value ?? '-');
    }
}

async function findAudioUrl(key) {
    if (audioCache.has(key)) {
        return audioCache.get(key);
    }

    const extensions = ['.mp3', '.ogg', '.wav'];
    for (const extension of extensions) {
        const candidate = `sfx/${key}${extension}`;
        try {
            const response = await fetch(candidate, { method: 'HEAD' });
            if (response.ok) {
                audioCache.set(key, candidate);
                return candidate;
            }
        } catch {
            // ignore and try next extension
        }
    }

    audioCache.set(key, null);
    return null;
}

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Unable to load ${path}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function renderContent() {
    if (!contentRoot) return;

    contentRoot.innerHTML = '';
    contentRoot.appendChild(createHeaderRow());

    let allKeys = [];
    let currentData = {};

    try {
        allKeys = await fetchJson('res/all.json');
        currentData = await fetchJson('res/current.json');
    } catch (error) {
        contentRoot.innerHTML = `<div class="contenttable-empty">Failed to load data: ${error.message}</div>`;
        return;
    }

    if (!Array.isArray(allKeys)) {
        contentRoot.innerHTML = '<div class="contenttable-empty">Unexpected data format in res/all.json.</div>';
        return;
    }

    for (const key of allKeys) {
        const currentItem = currentData[key];
        if (currentItem) {
            contentRoot.appendChild(prepareRow(key, currentItem, false));
        } else {
            contentRoot.appendChild(prepareRow(key, {}, true));
        }
    }

    if (allKeys.length === 0) {
        contentRoot.innerHTML = '<div class="contenttable-empty">No SFX entries found.</div>';
    }
}

window.addEventListener('DOMContentLoaded', renderContent);
