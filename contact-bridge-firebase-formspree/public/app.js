// TODO: Replace with your Firebase project configuration
  const firebaseConfig = {
  apiKey: "AIzaSyD6710HUXJy9YZnhc0bsA7fhX1AkFyskYU",
  authDomain: "my-portfolio-805fc.firebaseapp.com",
  projectId: "my-portfolio-805fc",
  storageBucket: "my-portfolio-805fc.firebasestorage.app",
  messagingSenderId: "205540800979",
  appId: "1:205540800979:web:58a7b15bc1107b0bb89726",
  measurementId: "G-4130V4R31J"
};



// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- YOUR FORMSPREE ID IS SET HERE ---
const FORMSPREE_FORM_ID = 'manjydwl'; // This is the ID you provided!

// Get DOM elements
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const thankYouPopup = document.getElementById('thankYouPopup');
const closePopupBtns = document.querySelectorAll('.close-btn'); // Select all elements with class 'close-btn'

// --- Handle Form Submission ---
if (contactForm) { // Check if the form element exists on the page
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default browser form submission

        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        formStatus.textContent = 'Sending your message...';
        formStatus.className = 'status-message'; // Reset class for styling to default

        try {
            // 1. Send data to Formspree
            const formspreeResponse = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
                method: 'POST',
                body: formData, // FormData directly works with Formspree
                headers: {
                    'Accept': 'application/json' // Essential for Formspree to return a JSON response
                }
            });

            if (!formspreeResponse.ok) {
                // If Formspree returns an error, try to parse it
                let errorDetails = `Formspree failed with status: ${formspreeResponse.status}`;
                try {
                    const errorData = await formspreeResponse.json();
                    errorDetails = errorData.error || JSON.stringify(errorData);
                } catch (jsonError) {
                    // Ignore if JSON parsing fails, use default message
                }
                throw new Error(errorDetails);
            }

            // 2. Send data to Firebase Firestore
            await db.collection('inquiries').add({
                name: name,
                email: email,
                subject: subject,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Firestore server-side timestamp
                read: false // Default status for your dashboard
            });

            // If both succeeded, show success message and popup
            formStatus.textContent = 'Message sent successfully!';
            formStatus.className = 'status-message success';
            contactForm.reset(); // Clear the form fields

            showThankYouPopup(); // Display the thank you popup

        } catch (error) {
            console.error('Submission error:', error);
            formStatus.textContent = `Error sending message: ${error.message}. Please try again.`;
            formStatus.className = 'status-message error';
        }
    });
}

// --- Popup Functions ---
function showThankYouPopup() {
    thankYouPopup.style.display = 'flex'; // Make the container visible
    // A small delay is added to ensure 'display: flex' takes effect before 'show' class is added
    // This allows CSS transitions to work correctly.
    setTimeout(() => {
        thankYouPopup.classList.add('show'); 
    }, 10); 
}

function hideThankYouPopup() {
    thankYouPopup.classList.remove('show'); // Trigger the hide animation
    // After the animation, hide the container completely
    setTimeout(() => {
        thankYouPopup.style.display = 'none'; 
    }, 300); // This delay should match the CSS transition duration for .popup-content
}

// Add event listeners to close buttons on the popup
closePopupBtns.forEach(button => {
    button.addEventListener('click', hideThankYouPopup);
});

// Close popup if the user clicks outside the content (on the dark overlay)
thankYouPopup.addEventListener('click', (e) => {
    if (e.target === thankYouPopup) { // Check if the click was directly on the container itself
        hideThankYouPopup();
    }
});

// Initialize Firebase
