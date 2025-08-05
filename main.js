// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const header = document.querySelector('.header');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in class to elements and observe them
const animateElements = document.querySelectorAll('.news-item, .value-card, .about-text, .service-text, .strength-text, .contact-item');
animateElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Initialize Slick Slider for Works section
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Slick Slider for Works Section
    const worksSlider = document.querySelector('.works-slider');
    if (worksSlider) {
        $(worksSlider).slick({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                    }
                }
            ]
        });
    }

    // microCMS Config
    const serviceDomain = 'iymoqayrww';
    const apiKey = 'rTWbnMYGrd4MTgyuFOLytuDtxWWxPVSb43Zc';

    // Fetch News from microCMS
    const newsListContainer = document.getElementById('news-list-container');
    if (newsListContainer) {
        fetch(`https://${serviceDomain}.microcms.io/api/v1/news?limit=4`, {
            headers: {
                'X-MICROCMS-API-KEY': apiKey,
            },
        })
        .then(response => response.json())
        .then(data => {
            newsListContainer.innerHTML = ''; // Clear loading message
            data.contents.forEach(article => {
                const publishedAt = new Date(article.publishedAt).toLocaleDateString('ja-JP').replace(/\//g, '.');
                const category = article.category || 'お知らせ';
                const title = article.title;
                const link = `news-detail.html?id=${article.id}`;

                const item = document.createElement('div');
                item.className = 'news-item';
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    window.location.href = link;
                });

                item.innerHTML = `
                    <span class="news-date">${publishedAt}</span>
                    <span class="news-category">${category}</span>
                    <a href="${link}" class="news-title">${title}</a>
                `;
                newsListContainer.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsListContainer.innerHTML = '<p>ニュースの読み込みに失敗しました。</p>';
        });
    }

    // Fetch Portfolio from microCMS
    const portfolioGridContainer = document.getElementById('portfolio-grid-container');
    if (portfolioGridContainer) {
        fetch(`https://${serviceDomain}.microcms.io/api/v1/works`, {
            headers: {
                'X-MICROCMS-API-KEY': apiKey,
            },
        })
        .then(response => response.json())
        .then(data => {
            portfolioGridContainer.innerHTML = ''; // Clear loading message
            data.contents.forEach(work => {
                const imageUrl = work.list_image ? work.list_image.url : 'https://via.placeholder.com/400x300';
                const category = work.category || '実績';
                const title = work.title;
                const description = work.short_description;
                const completedDate = work.completed_date || 'N/A';
                const area = work.area || 'N/A';
                const link = `works-detail.html?id=${work.id}`;

                const item = document.createElement('article');
                item.className = 'portfolio-card';
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
        })
        .catch(error => {
            console.error('Error fetching portfolio:', error);
            portfolioGridContainer.innerHTML = '<p>実績の読み込みに失敗しました。</p>';
        });
    }
});


// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background img');
    
    if (heroBackground) {
        const speed = scrolled * 0.3;
        heroBackground.style.transform = `translateY(${speed}px)`;
    }
});

// Loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Lazy loading images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Scroll to top button functionality
const createScrollToTopButton = () => {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #224053;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(34, 64, 83, 0.3);
    `;
    
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    document.body.appendChild(button);
};

// Initialize scroll to top button
createScrollToTopButton();

// Performance optimization: Debounce scroll events
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
    // Additional scroll-related operations can be added here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Map click handler
document.querySelector('.map-overlay')?.addEventListener('click', () => {
    // Here you would typically open Google Maps or another map service
    console.log('Map clicked - would open map application');
});

// Form validation helper (for future contact forms)
const validateForm = (form) => {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
};

// Add smooth hover effects to interactive elements
document.querySelectorAll('.btn-primary, .hero-cta, .works-detail-btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Enhanced mobile menu animation
hamburger.addEventListener('click', () => {
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Add entrance animations to sections
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.8s ease';
    sectionObserver.observe(section);
});