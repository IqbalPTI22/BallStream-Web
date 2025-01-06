// Store anime list data
let animeList = [];
let currentPage = 1;
let isLoading = false;
let hasMoreData = true;

// Function to fetch anime data from otakudesu
async function fetchAnimeData(page = 1, append = false) {
    if (isLoading || (!append && !hasMoreData)) return;
    
    try {
        isLoading = true;
        const loadingSpinner = document.getElementById('loading');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        loadingSpinner.style.display = 'block';
        loadMoreBtn.style.display = 'none';

        // Use a CORS proxy to access otakudesu
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = encodeURIComponent(`https://otakudesu.cloud/ongoing-anime/page/${page}`);
        const response = await fetch(proxyUrl + targetUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract anime data
        const animeElements = doc.querySelectorAll('.venz');
        
        if (!animeElements || animeElements.length === 0) {
            hasMoreData = false;
            throw new Error('No more anime found');
        }

        // Transform the data
        const newAnimeList = Array.from(animeElements).map(element => {
            const titleElement = element.querySelector('.jdlflm');
            const imageElement = element.querySelector('img');
            const episodeElement = element.querySelector('.epz');
            const dateElement = element.querySelector('.newnime');
            const linkElement = element.querySelector('a');
            
            const animeData = {
                title: titleElement ? titleElement.textContent.trim() : 'Unknown Title',
                episode: episodeElement ? episodeElement.textContent.trim() : 'Unknown Episode',
                image: imageElement ? imageElement.src : 'https://via.placeholder.com/200x280',
                date: dateElement ? dateElement.textContent.trim() : '',
                url: linkElement ? linkElement.href : '#'
            };

            // Extract anime ID from URL
            const urlParts = animeData.url.split('/');
            animeData.id = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];

            return animeData;
        });

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
            titleElement.textContent = `Latest Updates from OtakuDesu (${animeList.length} anime)`;
        }

        // Check if there's a next page by looking for pagination
        const nextPageLink = doc.querySelector('.pagination .next');
        hasMoreData = !!nextPageLink;
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
                <p class="episode">${anime.episode}</p>
                ${anime.date ? `<p class="date">${anime.date}</p>` : ''}
            </div>
        `;
        
        animeCard.addEventListener('click', () => {
            window.location.href = `anime-detail.html?id=${anime.id}`;
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
