// Store anime list data
let animeList = [];

// Function to fetch anime data from Jikan API
async function fetchAnimeData() {
    try {
        // Add parameters for pagination and limit
        const response = await fetch('https://api.jikan.moe/v4/seasons/now?limit=25&page=1');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('No anime data found');
        }

        console.log('Fetched anime data:', data); // Debug log
        
        // Transform the data to match our format
        animeList = data.data.map(anime => ({
            title: anime.title || anime.title_english || 'Unknown Title',
            episode: `Episodes: ${anime.episodes || '?'}`,
            image: anime.images.jpg.large_image_url || 'https://via.placeholder.com/200x280',
            url: anime.mal_id,
            synopsis: anime.synopsis,
            score: anime.score,
            status: anime.status,
            aired: anime.aired.string,
            rating: anime.rating,
            type: anime.type,
            season: anime.season,
            year: anime.year
        }));

        displayAnime(animeList);

        // Update page title with count
        const titleElement = document.querySelector('.latest-updates h2');
        if (titleElement) {
            titleElement.textContent = `Latest Updates (${animeList.length} anime)`;
        }
    } catch (error) {
        console.error('Error fetching anime:', error);
        const animeGrid = document.getElementById('animeList');
        animeGrid.innerHTML = `
            <div class="error-message">
                Failed to load anime data. Error: ${error.message}<br>
                Please try again later or contact support.
            </div>
        `;
    }
}

// Function to display anime in the grid
function displayAnime(animeData) {
    const animeGrid = document.getElementById('animeList');
    animeGrid.innerHTML = '';

    animeData.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.className = 'anime-card';
        
        animeCard.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}">
            <div class="anime-info">
                <h3>${anime.title}</h3>
                <p>${anime.episode}</p>
                ${anime.score ? `<p class="score">⭐ ${anime.score}</p>` : ''}
                <p class="type">${anime.type || 'TV'}</p>
            </div>
        `;
        
        animeCard.addEventListener('click', () => {
            window.location.href = `anime-detail.html?id=${anime.url}`;
        });

        animeGrid.appendChild(animeCard);
    });
}

// Search function
function searchAnime() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredAnime = animeList.filter(anime => 
        anime.title.toLowerCase().includes(searchTerm)
    );
    displayAnime(filteredAnime);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchAnimeData();
});
