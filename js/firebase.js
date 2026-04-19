// Firebase Configuration and Helpers
window.firebaseReady = false;

// Wait for Firebase to initialize
setTimeout(() => {
    if (window.firebaseApp) {
        window.firebaseReady = true;
        console.log('Firebase ready');
    }
}, 500);

// Auth Functions
window.handleLogin = async function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('Please enter email and password');
        return;
    }
    
    try {
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        await signInWithEmailAndPassword(window.firebaseAuth, email, password);
        showToast('Welcome to the House of Wisdom');
        window.checkAuthState();
    } catch (error) {
        showToast('Login failed: ' + error.message);
    }
};

window.handleSignup = async function() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    if (!name || !email || !password) {
        showToast('Please fill all fields');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters');
        return;
    }
    
    try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        const userCred = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        
        // Create user document
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await setDoc(doc(window.firebaseDb, 'users', userCred.user.uid), {
            name: name,
            email: email,
            createdAt: new Date(),
            progress: {
                'listening-heart': { currentDay: 1, completedDays: [] }
            }
        });
        
        showToast('Your journey begins. Welcome.');
        window.checkAuthState();
    } catch (error) {
        showToast('Signup failed: ' + error.message);
    }
};

window.logout = async function() {
    try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        await signOut(window.firebaseAuth);
        showToast('Peace be with you. Return soon.');
        window.checkAuthState();
    } catch (error) {
        showToast('Error signing out');
    }
};

window.checkAuthState = function() {
    const { onAuthStateChanged } = window.firebaseAuth ? 
        window.firebaseAuth.constructor.prototype : null;
    
    if (window.firebaseAuth) {
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js').then(({ onAuthStateChanged }) => {
            onAuthStateChanged(window.firebaseAuth, (user) => {
                if (user) {
                    window.currentUser = user;
                    document.getElementById('user-greeting') && 
                        (document.getElementById('user-greeting').textContent = `Shalom, ${user.displayName || 'Pilgrim'}`);
                    window.showScreen('courtyard');
                    window.loadUserProgress();
                } else {
                    window.currentUser = null;
                    window.showScreen('auth');
                }
                document.getElementById('loading-screen').classList.remove('active');
            });
        });
    } else {
        // Demo mode - no Firebase
        setTimeout(() => {
            window.showScreen('auth');
            document.getElementById('loading-screen').classList.remove('active');
        }, 1000);
    }
};

// Toast Notification
window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Load User Progress from Firestore
window.loadUserProgress = async function() {
    if (!window.currentUser) return;
    
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const userDoc = await getDoc(doc(window.firebaseDb, 'users', window.currentUser.uid));
        
        if (userDoc.exists()) {
            window.userProgress = userDoc.data().progress || {};
            window.updateCourtyardProgress();
        }
    } catch (error) {
        console.log('Using local progress');
        window.userProgress = JSON.parse(localStorage.getItem('mishleh-progress') || '{"listening-heart":{"currentDay":1,"completedDays":[]}}');
        window.updateCourtyardProgress();
    }
};

window.updateCourtyardProgress = function() {
    const progress = window.userProgress?.['listening-heart'];
    if (progress) {
        const completed = progress.completedDays?.length || 0;
        document.getElementById('upper-room-progress').textContent = 
            `📖 Day ${progress.currentDay} of 21 · ${completed} completed`;
        
        // Unlock Workshop if journey complete
        if (completed >= 21) {
            document.getElementById('workshop-status').textContent = '🔓 UNLOCKED';
            document.getElementById('workshop-door').classList.remove('door-locked');
            window.WORKSHOP_DATA.unlocked = true;
        } else {
            document.getElementById('workshop-status').textContent = '🔒 Complete Upper Room to unlock';
            document.getElementById('workshop-door').classList.add('door-locked');
        }
    }
    
    // Random daily verse
    const verse = window.DAILY_VERSES[Math.floor(Math.random() * window.DAILY_VERSES.length)];
    document.getElementById('daily-verse').innerHTML = `"${verse.text}"<br>— ${verse.ref}`;
};
