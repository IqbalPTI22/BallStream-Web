// Get anime ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

async function fetchAnimeDetail() {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const anime = data.data;
        
        if (!anime) {
            throw new Error('No anime data found');
        }

        console.log('Fetched anime details:', anime); // Debug log
        
        // Display anime details
        const animeDetailElement = document.getElementById('animeDetail');
        animeDetailElement.innerHTML = `
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" class="anime-detail-image">
            <div class="anime-detail-info">
                <h1>${anime.title}</h1>
                <div class="anime-info">
                    <p><strong>Score:</strong> ${anime.score || 'N/A'}</p>
                    <p><strong>Status:</strong> ${anime.status}</p>
                    <p><strong>Episodes:</strong> ${anime.episodes || 'Unknown'}</p>
                    <p><strong>Aired:</strong> ${anime.aired.string}</p>
                    <p><strong>Rating:</strong> ${anime.rating}</p>
                    <p><strong>Duration:</strong> ${anime.duration}</p>
                    <p><strong>Genres:</strong> ${anime.genres.map(g => g.name).join(', ')}</p>
                </div>
                <h2>Synopsis</h2>
                <p>${anime.synopsis || 'No synopsis available.'}</p>
                ${anime.trailer.embed_url ? `
                    <h2>Trailer</h2>
                    <div class="video-container">
                        <iframe src="${anime.trailer.embed_url}" 
                                frameborder="0" 
                                allowfullscreen>
                        </iframe>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Fetch and display episodes
        const episodeResponse = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`);
        const episodeData = await episodeResponse.json();
        const episodes = episodeData.data;
        
        const episodeListElement = document.getElementById('episodeList');
        
        if (episodes && episodes.length > 0) {
            episodeListElement.innerHTML = `
                <h2>Episodes</h2>
                <div class="episode-grid">
                    ${episodes.map(episode => `
                        <div class="episode-item">
                            <h3>Episode ${episode.episode_id}</h3>
                            <p>${episode.title || 'No title'}</p>
                            ${episode.score ? `<p class="score"> ${episode.score}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            episodeListElement.innerHTML = '<p>No episodes information available.</p>';
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
