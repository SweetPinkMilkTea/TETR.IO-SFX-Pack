// Volume control for SFX pack
(function () {
    function setVolumeFromSliderValue(value) {
        const num = Number(value);
        const vol = isNaN(num) ? 1 : Math.max(0, Math.min(100, num)) / 100;
        if (window.audioPlayer) {
            window.audioPlayer.volume = vol;
        }
        try {
            localStorage.setItem('sfxpack_volume', String(Math.round(vol * 100)));
        } catch (e) {
            // ignore storage errors
        }
    }

    function init() {
        const slider = document.getElementById('volume-slider');
        if (!slider) return;
        try {
            const saved = localStorage.getItem('sfxpack_volume');
            if (saved !== null && !Number.isNaN(Number(saved))) {
                slider.value = saved;
            }
        } catch (e) {
            // ignore
        }
        setVolumeFromSliderValue(slider.value);
        slider.addEventListener('input', (e) => {
            setVolumeFromSliderValue(e.target.value);
        });
    }

    window.addEventListener('DOMContentLoaded', init);
})();
