// Custom cursor
const customCursor = document.getElementById('customCursor');
const cursorDot = document.getElementById('cursorDot');

document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    
    // Add slight delay for trailing effect
    setTimeout(() => {
        customCursor.style.left = `${clientX}px`;
        customCursor.style.top = `${clientY}px`;
    }, 50);
    
    cursorDot.style.left = `${clientX}px`;
    cursorDot.style.top = `${clientY}px`;
});

// menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Optional: Add "smash" animation to the menu button when clicked
            menuToggle.classList.add('smash');
            setTimeout(() => {
                menuToggle.classList.remove('smash');
            }, 500);
        });
        
        // Close menu when a nav link is clicked
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
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


// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    themeToggle.textContent = body.classList.contains('dark-theme') ? '☀️' : '🌙';
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

console.log("Hello");