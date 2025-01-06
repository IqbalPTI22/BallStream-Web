// Sample data structure for anime
let animeList = [];

// Function to fetch anime data from otakudesu
async function fetchAnimeData() {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = encodeURIComponent('https://otakudesu.cloud/ongoing-anime/');
        const response = await fetch(proxyUrl + targetUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Create a DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Extract anime data from the parsed HTML
        const animeElements = doc.querySelectorAll('.venz');
        
        if (!animeElements || animeElements.length === 0) {
            console.log('No anime elements found in parsed HTML');
            console.log('Parsed HTML:', doc.documentElement.innerHTML);
            throw new Error('No anime data found');
        }
        
        const animeData = Array.from(animeElements).map(element => {
            const titleElement = element.querySelector('.jdlflm');
            const imageElement = element.querySelector('img');
            const episodeElement = element.querySelector('.epz');
            const linkElement = element.querySelector('a');
            
            return {
                title: titleElement ? titleElement.textContent.trim() : 'Unknown Title',
                episode: episodeElement ? episodeElement.textContent.trim() : 'Unknown Episode',
                image: imageElement ? imageElement.src : 'https://via.placeholder.com/200x280',
                url: linkElement ? linkElement.href : '#'
            };
        });

        if (animeData.length === 0) {
            throw new Error('No anime data could be extracted');
        }

        console.log('Fetched anime data:', animeData); // Debug log
        animeList = animeData;
        displayAnime(animeList);
    } catch (error) {
        console.error('Error fetching anime:', error);
        // Show detailed error message to user
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
        
        // Extract anime ID from URL
        const animeId = anime.url.split('/').filter(Boolean).pop();
        
        animeCard.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}">
            <div class="anime-info">
                <h3>${anime.title}</h3>
                <p>${anime.episode}</p>
            </div>
        `;
        
        animeCard.addEventListener('click', () => {
            window.location.href = `anime-detail.html?id=${animeId}`;
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
