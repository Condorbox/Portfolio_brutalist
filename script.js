// Custom cursor
const customCursor = document.getElementById('customCursor');
const cursorDot = document.getElementById('cursorDot');

document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    
    // Add slight delay for trailing effect
    requestAnimationFrame(() => {
        customCursor.style.left = `${clientX}px`;
        customCursor.style.top = `${clientY}px`;
    }, 50);
    
    cursorDot.style.left = `${clientX}px`;
    cursorDot.style.top = `${clientY}px`;
});

// Expand cursor on interactive elements
const interactiveElements = document.querySelectorAll('a, button, input, textarea');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        customCursor.style.width = '40px';
        customCursor.style.height = '40px';
        customCursor.style.borderWidth = '3px';
        customCursor.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
    });
    
    el.addEventListener('mouseleave', () => {
        customCursor.style.width = '20px';
        customCursor.style.height = '20px';
        customCursor.style.borderWidth = '2px';
        customCursor.style.backgroundColor = 'transparent';
    });
});

// menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            menuToggle.classList.add('smash');
            setTimeout(() => {
                menuToggle.classList.remove('smash');
            }, 500);
        });
        
        // Close menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });

        // Close menu when a navigation link is clicked
        navLinks.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navLinks.classList.remove('active');
            }
        });
    }
});

// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Function to apply the theme
const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark-theme');
        themeToggle.textContent = '🌙';
    }
};

// Check localStorage first, then system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    applyTheme(savedTheme);
} else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemPrefersDark ? 'dark' : 'light');
}

// Toggle theme and save preference
themeToggle.addEventListener('click', () => {
    const newTheme = body.classList.toggle('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    });
});

// Form submission (prevent default for demo)
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // In a real application, you would send this data to your server
    console.log('Form submitted:', { name, email, message });
    
    // Show submission feedback
    alert('Thanks for your message! I\'ll get back to you soon.');
    contactForm.reset();
});

// Simple animation for project cards
const boxes = document.querySelectorAll('.brutal-box');

const fadeInOnScroll = () => {
    boxes.forEach(box => {
        const boxTop = box.getBoundingClientRect().top;
        const triggerBottom = window.innerHeight * 0.8;
        
        if (boxTop < triggerBottom) {
            box.style.opacity = '1';
            box.style.transform = 'translateY(0)';
        }
    });
};

// Set initial styles for animation
boxes.forEach(box => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(20px)';
    box.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Run on page load and scroll
window.addEventListener('load', fadeInOnScroll);
window.addEventListener('scroll', fadeInOnScroll);