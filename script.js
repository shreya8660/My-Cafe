// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('nav a');
const loginBtn = document.getElementById('login-btn');
const authModal = document.getElementById('auth-modal');
const closeBtn = document.querySelector('.close-btn');
const modalTabs = document.querySelectorAll('.modal-tab');
const authForms = document.querySelectorAll('.auth-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const orderBtns = document.querySelectorAll('[data-order]');
const orderPage = document.getElementById('order-page');
const orderItemInput = document.getElementById('order-item');
const orderForm = document.getElementById('order-form');
const contactForm = document.getElementById('contact-form');

// Router Implementation
class Router {
    constructor() {
        this.routes = {
            'home': document.getElementById('home-page'),
            'menu': document.getElementById('menu-page'),
            'blog': document.getElementById('blog-page'),
            'media': document.getElementById('media-page'),
            'contact': document.getElementById('contact-page'),
            'order': document.getElementById('order-page')
        };
        
        this.currentPage = 'home';
        
        // Setup route change event listeners
        document.addEventListener('click', (e) => {
            const routeLink = e.target.closest('[data-route]');
            if (routeLink) {
                e.preventDefault();
                const route = routeLink.getAttribute('data-route');
                this.navigate(route);
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page);
            }
        });
        
        // Initial state
        history.replaceState({ page: this.currentPage }, '', `#${this.currentPage}`);
    }
    
    navigate(route) {
        if (this.routes[route]) {
            this.currentPage = route;
            this.showPage(route);
            history.pushState({ page: route }, '', `#${route}`);
        }
    }
    
    showPage(route) {
        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));
        
        // Show the selected page
        if (this.routes[route]) {
            this.routes[route].classList.add('active');
            
            // Update navigation active state
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-route') === route) {
                    link.classList.add('active');
                }
            });
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }
}

// Authentication System
class AuthSystem {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if a user is already logged in
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            this.isLoggedIn = true;
            this.currentUser = JSON.parse(loggedInUser);
            this.updateLoginButton();
        }
    }
    
    register(name, email, password) {
        // Check if email already exists
        const existingUser = this.users.find(user => user.email === email);
        if (existingUser) {
            return { success: false, message: 'Email already registered' };
        }
        
        // Create new user
        const newUser = { id: Date.now(), name, email, password };
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        return { success: true, message: 'Registration successful!' };
    }
    
    login(email, password) {
        const user = this.users.find(user => user.email === email && user.password === password);
        
        if (user) {
            this.isLoggedIn = true;
            this.currentUser = { id: user.id, name: user.name, email: user.email };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateLoginButton();
            return { success: true, message: 'Login successful!' };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    }
    
    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateLoginButton();
    }
    
    updateLoginButton() {
        if (this.isLoggedIn && loginBtn) {
            loginBtn.textContent = `Hi, ${this.currentUser.name}`;
            loginBtn.removeAttribute('data-route');
            
            // Add logout functionality
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                window.location.reload();
            }, { once: true });
        }
    }
}

// Order System
class OrderSystem {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
    }
    
    placeOrder(order) {
        const newOrder = {
            id: Date.now(),
            ...order,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        this.orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(this.orders));
        
        return { success: true, message: 'Order placed successfully!', orderId: newOrder.id };
    }
    
    getOrders(userEmail) {
        if (userEmail) {
            return this.orders.filter(order => order.email === userEmail);
        }
        return this.orders;
    }
}

// Initialize Router
const router = new Router();

// Initialize Auth System
const auth = new AuthSystem();

// Initialize Order System
const orderSystem = new OrderSystem();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Modal functionality
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!auth.isLoggedIn) {
            authModal.classList.add('active');
        }
    });
    
    closeBtn.addEventListener('click', () => {
        authModal.classList.remove('active');
    });
    
    // Close modal on click outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
        }
    });
    
    // Tab switching in modal
    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            modalTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabId}-form`).classList.add('active');
            document.getElementById('modal-title').textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
        });
    });
    
    // Form switch links
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        modalTabs[0].classList.remove('active');
        modalTabs[1].classList.add('active');
        authForms[0].classList.remove('active');
        authForms[1].classList.add('active');
        document.getElementById('modal-title').textContent = 'Register';
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        modalTabs[1].classList.remove('active');
        modalTabs[0].classList.add('active');
        authForms[1].classList.remove('active');
        authForms[0].classList.add('active');
        document.getElementById('modal-title').textContent = 'Login';
    });
    
    // Form submissions
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const result = auth.login(email, password);
        if (result.success) {
            showNotification(result.message, 'success');
            authModal.classList.remove('active');
            
            // Reset form
            loginForm.reset();
        } else {
            showNotification(result.message, 'error');
        }
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        const result = auth.register(name, email, password);
        if (result.success) {
            showNotification(result.message, 'success');
            
            // Auto login after registration
            auth.login(email, password);
            authModal.classList.remove('active');
            
            // Reset form
            registerForm.reset();
        } else {
            showNotification(result.message, 'error');
        }
    });
    
    // Order button handling
    orderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const orderItem = btn.getAttribute('data-order');
            
            // Check if user is logged in
            if (!auth.isLoggedIn) {
                showNotification('Please login to place an order', 'error');
                authModal.classList.add('active');
                return;
            }
            
            // Set order item and navigate to order page
            orderItemInput.value = orderItem;
            router.navigate('order');
        });
    });
    
    // Order form submission
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const orderData = {
                name: document.getElementById('order-name').value,
                email: document.getElementById('order-email').value,
                item: document.getElementById('order-item').value,
                quantity: document.getElementById('order-quantity').value,
                notes: document.getElementById('order-notes').value,
                userId: auth.currentUser ? auth.currentUser.id : null
            };
            
            const result = orderSystem.placeOrder(orderData);
            if (result.success) {
                showNotification(result.message, 'success');
                router.navigate('home');
                orderForm.reset();
            }
        });
    }
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
        });
    }
    
    // Check URL hash on load
    const initialHash = window.location.hash.substring(1);
    if (initialHash && router.routes[initialHash]) {
        router.navigate(initialHash);
    }
});

// Helper functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '5px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '2000',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s'
    });
    
    // Set type-specific styles
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}