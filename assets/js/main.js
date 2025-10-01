// Modern Portfolio JavaScript - Henry Zheng

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.skill-card, .project-card, .stat, .contact-method');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Form submission handling
    const contactForm = document.querySelector('.form');
    if (contactForm) {
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.style.cssText = `
            color: #10b981;
            font-size: 0.9rem;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 8px;
            display: none;
        `;
        successMessage.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        
        // Insert success message after the form
        contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // Simple validation
            if (!name || !email || !subject || !message) {
                showErrorMessage('Please fill in all fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showErrorMessage('Please enter a valid email address.');
                return;
            }

            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            // Send email using EmailJS
            sendEmail(name, email, subject, message)
                .then(() => {
                    // Show success message
                    successMessage.style.display = 'block';
                    this.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 5000);
                })
                .catch((error) => {
                    console.error('Error sending email:', error);
                    showErrorMessage('Sorry, there was an error sending your message. Please try again.');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                });
        });

        // Function to show error messages
        function showErrorMessage(message) {
            // Remove any existing error messages
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.cssText = `
                color: #ef4444;
                font-size: 0.9rem;
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
            `;
            errorMessage.textContent = message;
            
            contactForm.parentNode.insertBefore(errorMessage, contactForm.nextSibling);
            
            // Hide error message after 5 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        }

        // Function to send email using EmailJS
        async function sendEmail(name, email, subject, message) {
            // EmailJS configuration - Replace these with your actual values
            const serviceID = 'service_henry_portfolio'; // Replace with your EmailJS service ID
            const templateID = 'template_contact_form'; // Replace with your EmailJS template ID
            const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with your EmailJS public key
            
            // Initialize EmailJS
            emailjs.init(publicKey);
            
            // Prepare template parameters
            const templateParams = {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
                to_email: 'henry.zheng@example.com' // Replace with your actual email address
            };
            
            try {
                // Send email using EmailJS
                const response = await emailjs.send(serviceID, templateID, templateParams);
                console.log('Email sent successfully:', response);
                return response;
            } catch (error) {
                console.error('EmailJS error:', error);
                throw error;
            }
        }
    }

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Typing animation for hero title
    const heroTitle = document.querySelector('.hero-title .name');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = function() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing animation after a short delay
        setTimeout(typeWriter, 1000);
    }

    // Project card hover effects
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Skill card animations
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Smooth reveal animation for sections
    const revealElements = document.querySelectorAll('.section-header, .about-content, .contact-content');
    revealElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Back to top functionality
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add ripple effect to buttons
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});