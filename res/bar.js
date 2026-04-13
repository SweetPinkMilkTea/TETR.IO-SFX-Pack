const barRoot = document.querySelector('.barcontainer');
const barTrack = document.getElementById('progressbar');
const barText = document.querySelector('.bartextcontainer');

const stateConfig = {
  0: { label: 'Stable', className: 'green' },
  1: { label: 'Unstable', className: 'yellow' },
  2: { label: 'To be replaced', className: 'red' }
};

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function createSegment({ className, width, title }) {
  const segment = document.createElement('div');
  segment.className = `bar-segment ${className}`;
  segment.style.width = `${width}%`;
  segment.title = title;
  return segment;
}

async function renderProgressBar() {
  if (!barRoot || !barTrack || !barText) {
    return;
  }

  let allKeys = [];
  let currentData = {};

  try {
    allKeys = await fetchJson('res/all.json');
    currentData = await fetchJson('res/current.json');
  } catch (error) {
    barText.textContent = `Coverage data unavailable: ${error.message}`;
    barTrack.innerHTML = '';
    return;
  }

  if (!Array.isArray(allKeys)) {
    barText.textContent = 'Coverage data unavailable.';
    barTrack.innerHTML = '';
    return;
  }

  const totalKeys = allKeys.length;
  const counts = { 0: 0, 1: 0, 2: 0 };
  let presentCount = 0;

  for (const key of allKeys) {
    const entry = currentData[key];
    if (entry && typeof entry.state === 'number') {
      const state = entry.state;
      if (state in counts) {
        counts[state] += 1;
      } else {
        counts[state] = (counts[state] || 0) + 1;
      }
      presentCount += 1;
    }
  }

  const segments = [];
  for (const state of [0, 1, 2]) {
    const count = counts[state] || 0;
    if (count > 0) {
      segments.push({
        className: stateConfig[state].className,
        width: (count / totalKeys) * 100,
        title: `${stateConfig[state].label}: ${count} of ${totalKeys}`
      });
    }
  }

  const missingCount = totalKeys - presentCount;
  if (missingCount > 0) {
    segments.push({
      className: 'missing',
      width: (missingCount / totalKeys) * 100,
      title: `Missing: ${missingCount} of ${totalKeys}`
    });
  }

  barTrack.innerHTML = '';
  segments.forEach((segment) => {
    barTrack.appendChild(createSegment(segment));
  });

  barText.innerHTML = `
    <span>${presentCount}/${totalKeys} present</span>
    <span>
      <strong>Stable</strong>: ${counts[0] || 0} -
      <strong>Unstable</strong>: ${counts[1] || 0} -
      <strong>To be replaced</strong>: ${counts[2] || 0}
    </span>
  `;
}

window.addEventListener('DOMContentLoaded', renderProgressBar);
