async function getLatestRelease() {
    const repo = "SweetPinkMilkTea/sfxpack";
    const versionElement = document.getElementById('versionid');
    const downloadButton = document.querySelector('.linkbutton[href=""]');

    // DEBUG: Interupt the function to not spam GitHub API during development
    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
        versionElement.innerText = "N/A";
        downloadButton.href = `#`;
        return;
    }


    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
        const data = await response.json();

        // Before continuing, check if API returned an error (e.g., rate limit exceeded)
        if (response.status !== 200) {
            throw new Error(`GitHub API error: ${data.message || 'Unknown error'}`);
        }

        // 1. Insert the release name (e.g., "v1.0.2")
        versionElement.innerText = data.tag_name;

        // 2. Find the specific zip created by workflow
        // Looking for the asset named "sfx-assets.zip"
        const sfxAsset = data.assets.find(asset => asset.name === 'sfx-assets.zip');

        if (sfxAsset) {
            downloadButton.href = sfxAsset.browser_download_url;
        } else {
            // Fallback: If the zip isn't found, link to the release page
            downloadButton.href = data.html_url;
        }

    } catch (error) {
        console.error("Error fetching release:", error);
        versionElement.innerText = "---";
        versionElement.title = "Failed to fetch latest release. Click to view releases on GitHub yourself.";
    }
}

function loadDownloadStats() {
    const statsElement = document.getElementById('download_stats');
    if (!statsElement) return;

    const saved = localStorage.getItem('sfxpack_last_download');
    if (!saved) {
        statsElement.style.display = 'none';
        return;
    }

    try {
        const { version, downloadTime } = JSON.parse(saved);
        if (!version || !downloadTime) {
            throw new Error('Invalid download stats');
        }

        const date = new Date(downloadTime);
        statsElement.textContent = `You last downloaded ${version} on ${date.toLocaleString()}.`;
        statsElement.style.display = '';
    } catch (error) {
        console.warn('Could not load download stats:', error);
        statsElement.style.display = 'none';
    }
}

function saveDownloadStats() {
    const versionElement = document.getElementById('versionid');
    if (!versionElement) return;

    const version = versionElement.innerText.trim();
    if (!version) return;

    const downloadTime = new Date().toISOString();
    localStorage.setItem('sfxpack_last_download', JSON.stringify({ version, downloadTime }));
}

const downloadButton = document.getElementById('dlpack');
if (downloadButton) {
    downloadButton.addEventListener('click', saveDownloadStats);
}

loadDownloadStats();
getLatestRelease();