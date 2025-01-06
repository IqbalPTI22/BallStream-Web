// Get anime ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

async function fetchAnimeDetail() {
    try {
        const corsProxy = 'https://corsproxy.io/?';
        const response = await fetch(corsProxy + encodeURIComponent(`https://otakudesu.cloud/anime/${animeId}`));
        const text = await response.text();
        
        // Create a DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Extract anime details
        const title = doc.querySelector('.jdlrx h1')?.textContent.trim() || 'Unknown Title';
        const image = doc.querySelector('.wp-post-image')?.src || 'https://via.placeholder.com/300x400';
        const synopsis = doc.querySelector('.sinopc')?.textContent.trim() || 'No synopsis available';
        const info = doc.querySelector('.infozingle')?.innerHTML || '';
        
        // Display anime details
        const animeDetailElement = document.getElementById('animeDetail');
        animeDetailElement.innerHTML = `
            <img src="${image}" alt="${title}" class="anime-detail-image">
            <div class="anime-detail-info">
                <h1>${title}</h1>
                <div class="anime-info">${info}</div>
                <h2>Synopsis</h2>
                <p>${synopsis}</p>
            </div>
        `;
        
        // Extract and display episode list
        const episodes = Array.from(doc.querySelectorAll('#venkonten .episodelist ul li'));
        const episodeListElement = document.getElementById('episodeList');
        
        if (episodes.length > 0) {
            episodeListElement.innerHTML = `
                <h2>Episodes</h2>
                <div class="episode-grid">
                    ${episodes.map(episode => {
                        const link = episode.querySelector('a');
                        return `
                            <div class="episode-item" onclick="window.location.href='${link?.href || '#'}'" data-url="${link?.href || '#'}">
                                ${link?.textContent || 'Unknown Episode'}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            episodeListElement.innerHTML = '<p>No episodes available.</p>';
        }
        
    } catch (error) {
        console.error('Error fetching anime details:', error);
        document.getElementById('animeDetail').innerHTML = `
            <div class="error-message">
                Failed to load anime details. Please try again later.
            </div>
        `;
    }
}

// Update the click handler in script.js to include the anime ID
document.addEventListener('DOMContentLoaded', () => {
    if (animeId) {
        fetchAnimeDetail();
    } else {
        document.getElementById('animeDetail').innerHTML = `
            <div class="error-message">
                No anime selected. Please return to the <a href="index.html">home page</a>.
            </div>
        `;
    }
});
