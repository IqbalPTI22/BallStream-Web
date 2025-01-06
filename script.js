// Store anime list data
let animeList = [];
let currentPage = 1;
let isLoading = false;
let hasMoreData = true;

// Function to fetch anime data from Jikan API
async function fetchAnimeData(page = 1, append = false) {
    if (isLoading || (!append && !hasMoreData)) return;
    
    try {
        isLoading = true;
        const loadingSpinner = document.getElementById('loading');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        loadingSpinner.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        
        // Add parameters for pagination and limit
        const response = await fetch(`https://api.jikan.moe/v4/seasons/now?limit=15&page=${page}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            hasMoreData = false;
            throw new Error('No more anime data found');
        }

        console.log('Fetched anime data:', data); // Debug log
        
        // Transform the data to match our format
        const newAnimeList = data.data.map(anime => ({
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

        if (append) {
            animeList = [...animeList, ...newAnimeList];
            displayAnime(newAnimeList, true);
        } else {
            animeList = newAnimeList;
            displayAnime(newAnimeList, false);
        }

        // Update page title with count
        const titleElement = document.querySelector('.latest-updates h2');
        if (titleElement) {
            titleElement.textContent = `Latest Updates (${animeList.length} anime)`;
        }

        // Show/hide load more button based on data availability
        hasMoreData = data.pagination.has_next_page;
        loadMoreBtn.style.display = hasMoreData ? 'block' : 'none';
        
    } catch (error) {
        console.error('Error fetching anime:', error);
        if (!append) {
            const animeGrid = document.getElementById('animeList');
            animeGrid.innerHTML = `
                <div class="error-message">
                    Failed to load anime data. Error: ${error.message}<br>
                    Please try again later or contact support.
                </div>
            `;
        }
    } finally {
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
    }
}

// Function to display anime in the grid
function displayAnime(animeData, append = false) {
    const animeGrid = document.getElementById('animeList');
    
    if (!append) {
        animeGrid.innerHTML = '';
    }

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

// Load more function
function loadMore() {
    if (!isLoading && hasMoreData) {
        currentPage++;
        fetchAnimeData(currentPage, true);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchAnimeData(1, false);
    
    // Add load more button event listener
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', loadMore);
});
