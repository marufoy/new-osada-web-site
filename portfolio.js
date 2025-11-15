document.addEventListener('DOMContentLoaded', function() {
    // microCMS Config
    const serviceDomain = 'iymoqayrww';
    const apiKey = 'rTWbnMYGrd4MTgyuFOLytuDtxWWxPVSb43Zc';

    let allWorks = [];
    let filteredWorks = [];
    let currentSort = 'newest';
    let currentYearFilter = 'all';

    // 元号から西暦に変換する関数（ソート用）
    function convertEraToYear(eraString) {
        if (!eraString) return null;
        
        // 令和の処理
        const reiwaMatch = eraString.match(/令和(\d+)年?/);
        if (reiwaMatch) {
            return 2018 + parseInt(reiwaMatch[1]);
        }
        
        // 平成の処理
        const heiseiMatch = eraString.match(/平成(\d+)年?/);
        if (heiseiMatch) {
            return 1988 + parseInt(heiseiMatch[1]);
        }
        
        // 昭和の処理
        const showaMatch = eraString.match(/昭和(\d+)年?/);
        if (showaMatch) {
            return 1925 + parseInt(showaMatch[1]);
        }
        
        // 西暦の処理
        const yearMatch = eraString.match(/(\d{4})年?/);
        if (yearMatch) {
            return parseInt(yearMatch[1]);
        }
        
        return null;
    }

    // DOM Elements
    const portfolioGridContainer = document.getElementById('portfolio-grid-container');
    const sortSelect = document.getElementById('sort-select');
    const yearFilter = document.getElementById('year-filter');

    // Initialize
    loadPortfolioData();

    // Event Listeners
    sortSelect.addEventListener('change', handleSortChange);
    
    // Load portfolio data from microCMS
    function loadPortfolioData() {
        fetch(`https://${serviceDomain}.microcms.io/api/v1/works`, {
            headers: { 'X-MICROCMS-API-KEY': apiKey },
        })
        .then(response => response.json())
        .then(data => {
            allWorks = data.contents;
            
            // Set initial state - ensure "すべて" is active
            currentYearFilter = 'all';
            
            // Generate year filter buttons (this will create the "すべて" button with active class)
            generateYearFilter();
            
            // Apply initial sort and filter
            applySortAndFilter();
            
            // Render portfolio
            renderPortfolio();
        })
        .catch(error => {
            console.error('Error fetching portfolio:', error);
            portfolioGridContainer.innerHTML = '<div class="no-results">実績の読み込みに失敗しました。</div>';
        });
    }

    // Generate year filter buttons based on available years
    function generateYearFilter() {
        const years = new Set();
        
        allWorks.forEach(work => {
            if (work.completed_date) {
                // Extract year from completed_date and convert to era
                const year = convertEraToYear(work.completed_date);
                if (year) {
                    years.add(year);
                }
            }
        });

        // Convert to array and sort descending
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        
        // Clear existing buttons except "すべて"
        const allButton = yearFilter.querySelector('[data-year="all"]');
        yearFilter.innerHTML = '';
        
        // Recreate all button
        const newAllButton = document.createElement('button');
        newAllButton.className = 'year-button active';
        newAllButton.dataset.year = 'all';
        newAllButton.textContent = 'すべて';
        yearFilter.appendChild(newAllButton);

        // Add year buttons with era display
        sortedYears.forEach(year => {
            const button = document.createElement('button');
            button.className = 'year-button';
            
            // Convert year to era for display
            let eraDisplay;
            if (year >= 2019) {
                eraDisplay = `令和${year - 2018}年`;
            } else if (year >= 1989) {
                eraDisplay = `平成${year - 1988}年`;
            } else if (year >= 1926) {
                eraDisplay = `昭和${year - 1925}年`;
            } else {
                eraDisplay = `${year}年`;
            }
            
            button.textContent = eraDisplay;
            button.dataset.year = year;
            yearFilter.appendChild(button);
        });
    }

    // Handle year filter selection
    function handleYearFilter(year) {
        // Update active button
        document.querySelectorAll('.year-button').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetButton = document.querySelector(`[data-year="${year}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
        
        currentYearFilter = year === 'all' ? 'all' : year;
        applySortAndFilter();
        renderPortfolio();
    }

    // Handle sort change
    function handleSortChange() {
        currentSort = sortSelect.value;
        applySortAndFilter();
        renderPortfolio();
    }

    // Apply sorting and filtering
    function applySortAndFilter() {
        console.log('applySortAndFilter called with:', { currentYearFilter, currentSort, allWorksCount: allWorks.length });
        
        // Filter by year
        if (currentYearFilter === 'all' || currentYearFilter === null || currentYearFilter === undefined) {
            filteredWorks = [...allWorks];
            console.log('Filtered to all works:', filteredWorks.length);
        } else {
            filteredWorks = allWorks.filter(work => {
                if (!work.completed_date) return false;
                const year = convertEraToYear(work.completed_date);
                return year && year.toString() === currentYearFilter.toString();
            });
            console.log('Filtered to year', currentYearFilter, ':', filteredWorks.length);
        }

        // Apply sorting
        filteredWorks.sort((a, b) => {
            switch (currentSort) {
                case 'newest':
                    return compareByDate(b, a); // Newest first
                case 'oldest':
                    return compareByDate(a, b); // Oldest first
                case 'title':
                    return a.title.localeCompare(b.title, 'ja');
                default:
                    return 0;
            }
        });
        
        console.log('Final filtered works count:', filteredWorks.length);
    }

    // Compare works by date
    function compareByDate(a, b) {
        const dateA = extractDate(a.completed_date);
        const dateB = extractDate(b.completed_date);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return dateA - dateB;
    }

    // Extract date from completed_date string (supports era format)
    function extractDate(dateString) {
        if (!dateString) return null;
        
        // First try to convert era to year
        const year = convertEraToYear(dateString);
        if (year) {
            // Try to extract month from the string
            const monthPatterns = [
                /令和\d+年(\d{1,2})月/,
                /平成\d+年(\d{1,2})月/,
                /昭和\d+年(\d{1,2})月/,
                /(\d{4})年(\d{1,2})月/,
                /(\d{4})-(\d{1,2})/,
                /(\d{4})\/(\d{1,2})/,
            ];
            
            for (const pattern of monthPatterns) {
                const match = dateString.match(pattern);
                if (match) {
                    const month = parseInt(match[1]) || 1;
                    return new Date(year, month - 1);
                }
            }
            
            // If no month found, use January
            return new Date(year, 0);
        }
        
        // Fallback to original patterns for non-era formats
        const patterns = [
            /(\d{4})年(\d{1,2})月/,  // 2024年3月
            /(\d{4})-(\d{1,2})/,     // 2024-03
            /(\d{4})\/(\d{1,2})/,    // 2024/03
        ];
        
        for (const pattern of patterns) {
            const match = dateString.match(pattern);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) || 1;
                return new Date(year, month - 1);
            }
        }
        
        return null;
    }

    // Render portfolio grid
    function renderPortfolio() {
        console.log('renderPortfolio called with', filteredWorks.length, 'works');
        
        if (filteredWorks.length === 0) {
            portfolioGridContainer.innerHTML = '<div class="no-results">該当する実績が見つかりませんでした。</div>';
            return;
        }

        portfolioGridContainer.innerHTML = '';
        
        filteredWorks.forEach((work, index) => {
            const imageUrl = work.list_image ? work.list_image.url : 'https://via.placeholder.com/400x300';
            const category = work.category || '実績';
            const title = work.title;
            const description = work.short_description || work.description || '詳細はこちらをご覧ください。';
            const completedDate = work.completed_date || 'N/A';
            const area = work.area || 'N/A';
            const link = `works-detail.html?id=${work.id}`;

            const item = document.createElement('article');
            item.className = 'portfolio-card';
            item.style.animationDelay = `${index * 0.1}s`;
            
            item.innerHTML = `
                <a href="${link}" class="portfolio-card-link">
                    <div class="portfolio-image">
                        <img src="${imageUrl}" alt="${title}">
                        <div class="portfolio-overlay">
                            <span class="portfolio-category">${category}</span>
                        </div>
                    </div>
                    <div class="portfolio-content">
                        <h4 class="portfolio-title">${title}</h4>
                        <p class="portfolio-description">${description}</p>
                        <div class="portfolio-meta">
                            <span class="portfolio-date">${completedDate}</span>
                            <span class="portfolio-area">${area}</span>
                        </div>
                    </div>
                </a>
            `;
            
            portfolioGridContainer.appendChild(item);
        });

        // Animate cards with intersection observer
        animateCards();
    }

    // Animate cards on scroll
    function animateCards() {
        const cards = document.querySelectorAll('.portfolio-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // Add click handler for year filter buttons (event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('year-button')) {
            const year = e.target.dataset.year;
            // Convert to number if it's not 'all'
            const yearValue = year === 'all' ? 'all' : (isNaN(year) ? year : parseInt(year));
            if (yearValue !== currentYearFilter) {
                handleYearFilter(yearValue);
            }
        }
    });
});