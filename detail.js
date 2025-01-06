// Get anime ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

async function fetchAnimeDetail() {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = encodeURIComponent(`https://otakudesu.cloud/anime/${animeId}`);
        const response = await fetch(proxyUrl + targetUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Create a DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Extract anime details with better error handling
        const title = doc.querySelector('.jdlrx h1')?.textContent.trim() || 'Unknown Title';
        const image = doc.querySelector('.wp-post-image')?.src;
        const synopsis = doc.querySelector('.sinopc')?.textContent.trim();
        const info = doc.querySelector('.infozingle')?.innerHTML;
        
        if (!title || !image || !synopsis || !info) {
            console.log('Missing required data:', { title, image, synopsis, info });
            throw new Error('Could not find all required anime information');
        }
        
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
                        const episodeUrl = link?.href;
                        if (!episodeUrl) return '';
                        
                        return `
                            <div class="episode-item" onclick="window.location.href='${episodeUrl}'">
                                ${link.textContent || 'Unknown Episode'}
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
                Failed to load anime details. Error: ${error.message}<br>
                Please try again later or contact support.
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
