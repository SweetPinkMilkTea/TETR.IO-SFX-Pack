async function getLatestRelease() {
    const repo = "SweetPinkMilkTea/sfxpack";
    const versionElement = document.getElementById('versionid');
    const downloadButton = document.querySelector('.linkbutton[href=""]');

    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
        const data = await response.json();

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
        versionElement.innerText = "Error loading";
    }
}

getLatestRelease();