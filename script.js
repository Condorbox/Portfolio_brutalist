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

// Form submission email
const emailjsUserID = 'placeholder'; 
const emailjsServiceID = 'placeholder'; 
const emailjsTemplateID = 'placeholder';

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get the form by its ID
const form = document.getElementById('contactForm');
const msg = document.createElement('div'); // Create a message element
msg.id = 'responseMessage';
msg.style.marginTop = '1rem';
form.parentNode.insertBefore(msg, form.nextSibling); // Insert after the form

// Initialize EmailJS
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init(emailjsUserID);
});
  

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic form validation
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    let isValid = true;
    
    // Check name
    if (!name.value.trim()) {
      document.getElementById('nameError').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('nameError').style.display = 'none';
    }
    
    // Check email
    if (!email.value.trim() || !isValidEmail(email.value)) {
      document.getElementById('emailError').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('emailError').style.display = 'none';
    }
    
    // Check message
    if (!message.value.trim()) {
      document.getElementById('messageError').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('messageError').style.display = 'none';
    }
    
    if (!isValid) return;
    
    // Disable the submit button and show sending status
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Send the form using EmailJS
    emailjs.sendForm(
      emailjsServiceID, 
      emailjsTemplateID, 
      form
    )
    .then(function(response) {
      console.log('Message sent successfully', response);
      msg.innerHTML = "Message sent successfully!";
      msg.style.color = 'green';
      form.reset();
    })
    .catch(function(error) {
      console.error('Error when sending mail', error);
      msg.innerHTML = "Error when sending message. Please try again.";
      msg.style.color = 'red';
    })
    .finally(function() {
      // Re-enable the button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      
      // Clear the response message after 5 seconds
      setTimeout(function() {
        msg.innerHTML = "";
      }, 5000);
    });
});
  