// 🌟 State
let lastSection = '';
let currentMood = null;
const homeCart = [];
const restaurantCart = [];
let previousPage = null;
let currentMode = '';
 // 'restaurant' or 'home'

// 🌟 Festival Dates Mapping
const festivalDates = {
  "01-14": "Makar Sankranti",
  "01-26": "Republic Day",
  "03-08": "Holi",
  "07-15": "Independence Day",
  "07-18": "Raksha Bandhan",
  "09-07": "Janmashtami",
  "10-02": "Gandhi Jayanti",
  "10-12": "Dussehra",
  "10-31": "Diwali",
  "11-15": "Bhai Dooj",
  "12-25": "Christmas"
};


// 🌟 Festival Discounts (auto-applied during Raksha Bandhan)
const discountedPrices = {
  "Pizza": 200,
  "Ice Cream": 70,
  "Brownie": 90
};
// 🌟 Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// 🌟 Lock registration date to today
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const regDate = document.getElementById('regDate');
  if (regDate) {
    regDate.value = today;
    regDate.setAttribute('min', today);
    regDate.setAttribute('max', today);
  }
});

// 🌟 Handle Registration
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  
  if (!email || !password) {
    alert("Email and password are required.");
    return;
  }

  // Check if already registered
  const existingUser = localStorage.getItem(`user_${email}`);
  if (existingUser) {
    alert("This email is already registered. Please login.");
    showSection('loginPage');
    return;
  }

  const userData = {
    name,
    email,
    password,
    phone,
    address,
    regDate: new Date().toISOString()
  };

  // Save user data as JSON
  localStorage.setItem(`user_${email}`, JSON.stringify(userData));

  // Optionally set a flag for "logged in"
  localStorage.setItem('loggedInUser', email);

  alert("Registration successful! Welcome.");
  showSection('mainHome');
});

// 🌟 Handle Login
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const storedData = localStorage.getItem(`user_${email}`);
  if (!storedData) {
    alert("User not found. Please register first.");
    showSection('registerPage');
    return;
  }

  const user = JSON.parse(storedData);

  if (user.password !== password) {
    alert("Invalid password. Please try again.");
    return;
  }

  // Success
  localStorage.setItem('loggedInUser', email);
  alert(`Welcome back, ${user.name}!`);
  showSection('mainHome');
});


//clearform
function clearForms() {
  document.getElementById('registerForm')?.reset();
  document.getElementById('loginForm')?.reset();
}

// 🌟 Section Display
function showSection(idToShow, fromSection = '') {
  document.querySelectorAll('body > div').forEach(div => div.classList.add('hidden'));
  document.getElementById(idToShow).classList.remove('hidden');
  if (fromSection) {
    lastSection = fromSection;
  }
}

function goHome() {
  showSection('entryChoice');
}

function enterMode(mode) {
  currentMode = mode;
  if (mode === 'restaurant') {
    showSection('restaurantChoice');
  } else if (mode === 'home') {
    showSection('registerPage');
    clearForms();
  }
}

function showLogin() {
  showSection('loginPage');
  clearForms();
}

function handleClose() {
  if (lastSection) {
    showSection(lastSection);
  } else {
    goHome();
  }
}


// 🌟 Cart Operations
function addToCart(name, price, refreshPage = '') {
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;
  const existing = targetCart.find(item => item.name === name);
  
  if (existing) {
    existing.qty++;
  } else {
    targetCart.push({ name, price, qty: 1 });
  }

  showToast(`${name} added to cart!`);

  if (refreshPage === 'moodPage' && currentMood) {
    recommendMood(currentMood);
  } else if (refreshPage) {
    openPage(refreshPage);
  }
}

function increaseQty(index, refreshPage = '') {
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;
  targetCart[index].qty++;

  if (refreshPage === 'moodPage' && currentMood) {
    recommendMood(currentMood);
  } else if (refreshPage) {
    openPage(refreshPage);
  }
}

function decreaseQty(index, refreshPage = '') {
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;

  if (targetCart[index].qty > 1) {
    targetCart[index].qty--;
  } else {
    targetCart.splice(index, 1);
  }

  if (refreshPage === 'moodPage' && currentMood) {
    recommendMood(currentMood);
  } else if (refreshPage) {
    openPage(refreshPage);
  }
}


// 🌟 Menu Item Generator
function createMenuItem(name, price, imgSrc) {
  const safeId = name.replace(/\s+/g, '');
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;
  const existing = targetCart.find(item => item.name === name);
  const qty = existing ? existing.qty : 0;

  return `
    <div class="menu-item">
      <img src="${imgSrc}" alt="${name}">
      <p><strong>${name}</strong></p>
      <p style="color:red;">₹${price}</p>
      <div class="quantity-controls">
        <button id="addBtn-${safeId}" onclick="handleAdd('${name}', ${price})" ${qty > 0 ? 'style="display:none;"' : ''}>Add</button>
        <div id="qtyControls-${safeId}" class="quantity" ${qty > 0 ? '' : 'style="display:none;"'}>
          <button onclick="handleDecrease('${name}')">−</button>
          <span id="qty-${safeId}">${qty}</span>
          <button onclick="handleIncrease('${name}')">+</button>
        </div>
      </div>
    </div>
  `;
}

function handleAdd(name, price) {
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;
  let item = targetCart.find(i => i.name === name);
  if (item) {
    item.qty++;
  } else {
    targetCart.push({ name, price, qty: 1 });
  }
  const safeId = name.replace(/\s+/g, '');
  document.getElementById(`qty-${safeId}`).innerText = 1;
  document.getElementById(`addBtn-${safeId}`).style.display = 'none';
  document.getElementById(`qtyControls-${safeId}`).style.display = 'flex';
  showToast(`${name} added to cart!`);
}

function handleIncrease(name) {
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;
  let item = targetCart.find(i => i.name === name);
  if (item) {
    item.qty++;
    const safeId = name.replace(/\s+/g, '');
    document.getElementById(`qty-${safeId}`).innerText = item.qty;
  }
}

function handleDecrease(name) {
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;
  const index = targetCart.findIndex(i => i.name === name);
  if (index !== -1) {
    targetCart[index].qty--;
    const safeId = name.replace(/\s+/g, '');

    if (targetCart[index].qty < 1) {
      targetCart.splice(index, 1); // remove item from cart
      document.getElementById(`addBtn-${safeId}`).style.display = 'inline-block';
      document.getElementById(`qtyControls-${safeId}`).style.display = 'none';
    } else {
      document.getElementById(`qty-${safeId}`).innerText = targetCart[index].qty;
    }
  }
}




// 🌟 Mood Emoji Map
function moodEmoji(mood) {
  const map = {
    happy: '😊', sad: '😢', angry: '😡',
    surprised: '😲', neutral: '😐',
    disgusted: '🤢', fearful: '😨'
  };
  return map[mood] || '🙂';
}

// 🌟 Mood Recommendations
const moodRecommendations = {
  happy: {
    quote: 'Keep smiling and enjoy your meal!',
    dishes: [
      { name: "Pizza", price: 250, img: "images/pizza.jpg" },
      { name: "Ice Cream", price: 90, img: "images/icecream.jpg" },
      { name: "Fries", price: 60, img: "images/fries.jpg" }
    ]
  },
  sad: {
    quote: 'Cheer up with something sweet!',
    dishes: [
      { name: "Chocolate Cake", price: 100, img: "images/chocolatecake.jpg" },
      { name: "Brownie", price: 120, img: "images/brownie.jpg" },
      { name: "Pasta", price: 150, img: "images/pasta.jpg" }
    ]
  },
  angry: {
    quote: 'Cool down with spicy bites!',
    dishes: [
      { name: "Spicy Noodles", price: 140, img: "images/spicynoodles.jpg" },
      { name: "Chilli Paneer", price: 160, img: "images/chillipaneer.jpg" }
    ]
  },
  surprised: {
    quote: 'Let your taste buds be surprised too!',
    dishes: [
      { name: "Tacos", price: 130, img: "images/tacos.jpg" },
      { name: "Bubble Tea", price: 90, img: "images/bubbletea.jpg" }
    ]
  },
  neutral: {
    quote: 'Just a calm meal for a calm mood.',
    dishes: [
      { name: "Veg Thali", price: 300, img: "images/thali.jpg" },
      { name: "Burger", price: 150, img: "images/burger.jpg" }
    ]
  },
  disgusted: {
    quote: 'Time to eat clean and refresh.',
    dishes: [
      { name: "Detox Juice", price: 70, img: "images/juice.jpg" },
      { name: "Salad", price: 90, img: "images/salad.jpg" }
    ]
  },
  fearful: {
    quote: 'Comfort food makes everything better!',
    dishes: [
      { name: "Comfort Soup", price: 100, img: "images/soup.jpg" },
      { name: "Biryani", price: 220, img: "images/biryani.jpg" }
    ]
  }
};

// 🌟 Recommend Mood
function recommendMood(mood) {
  currentMood = mood;
  const moodSuggestion = document.getElementById('moodSuggestion');
  const data = moodRecommendations[mood];
  moodSuggestion.innerHTML = `
    <div class="mood-quote">${data.quote}</div>
    ${data.dishes.map(d => createMenuItem(d.name, d.price, d.img, 'moodPage')).join('')}
  `;
}

// 🌟 Main Navigation
function openPage(pageName) {
    const backSection = currentMode === 'restaurant' ? 'restaurantChoice' : 'mainHome';
  showSection('dynamicPages', backSection);
  const pageTitle = document.getElementById('pageTitle');
  const pageContent = document.getElementById('pageContent');

  if (pageName === 'menuPage') {
    pageTitle.innerText = 'Our Menu';
    pageContent.innerHTML = `
      <div class="menu-section"><h3>🥦 Veg Dishes</h3>
        <div class="menu-grid">
          ${createMenuItem("Misal Pav", 60, "images/misal pav.jpeg", "menuPage")}
          ${createMenuItem("Kadi Chawal", 150, "images/Kadi Chawal.webp", "menuPage")}
          ${createMenuItem("Manchurian", 250, "images/dish3.webp", "menuPage")}
          ${createMenuItem("Veg Thali", 300, "images/thali.jpg", "menuPage")}
        </div>
      </div>
      <div class="menu-section"><h3>🍗 Non-Veg Dishes</h3>
        <div class="menu-grid">
          ${createMenuItem("Chicken Biryani", 220, "images/biryani.jpg", "menuPage")}
          ${createMenuItem("Butter Chicken", 270, "images/Butter Chicken.jpeg", "menuPage")}
          ${createMenuItem("Chicken 65", 190, "images/Chicken 65.jpeg", "menuPage")}
          ${createMenuItem("Egg Curry", 160, "images/Egg Curry.jpeg", "menuPage")}
        </div>
      </div>
      <div class="menu-section"><h3>🍮 Desserts</h3>
        <div class="menu-grid">
          ${createMenuItem("Gulab Jamun", 60, "images/gulab jam.jpeg", "menuPage")}
          ${createMenuItem("Rasmalai", 80, "images/Rasmalai.jpeg", "menuPage")}
          ${createMenuItem("Ice Cream", 90, "images/icecream.jpg", "menuPage")}
          ${createMenuItem("Brownie", 120, "images/brownie.jpg", "menuPage")}
        </div>
      </div>
      <button onclick="openPage('cartPage')">Go to Cart</button>
    `;
  } else if (pageName === 'moodPage') {
    pageTitle.innerText = 'Mood Based Food';
    pageContent.innerHTML = `
      <div class="mood-emojis">
        ${Object.keys(moodRecommendations).map(m => `<button onclick="recommendMood('${m}')">${moodEmoji(m)}</button>`).join('')}
      </div>
      <div id="moodSuggestion" class="menu-grid"></div>
      <button onclick="openPage('cartPage')">🛒 View Cart</button>
    `;
  }  else if (pageName === 'cartPage') {
  pageTitle.innerText = 'Your Cart';
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;
  if (targetCart.length === 0) {
    pageContent.innerHTML = '<p>No items in cart.</p><button onclick="goHome()">Back to Home</button>';
    return;
  }

  const today = new Date();
  const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isFestivalDay = Object.keys(festivalDates).includes(key);

  let total = 0;
  const cartHTML = targetCart.map((item, index) => {
    let finalPrice = item.price;
    let originalPriceText = '';

    // Apply festival discount
    if (isFestivalDay) {
      if (item.name === "Manchurian") finalPrice = 200;
      if (item.name === "Ice Cream") finalPrice = 70;
      if (item.name === "Brownie") finalPrice = 90;
    }

    if (finalPrice < item.price) {
      originalPriceText = `<span class="original-price">₹${item.price}</span> → `;
    }

    const subtotal = finalPrice * item.qty;
    total += subtotal;

    return `
      <div class="cart-item">
        <span>${item.name}</span>
        <div class="quantity">
          <button onclick="decreaseQty(${index}, 'cartPage')">−</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${index}, 'cartPage')">+</button>
        </div>
        <span>${originalPriceText}₹${finalPrice * item.qty}</span>
      </div>
    `;
  }).join('');

  pageContent.innerHTML = `
    <div class="cart-box">
      ${cartHTML}
      <hr />
      <p><strong>Total Bill: ₹${total}</strong></p>
      <div class="payment-methods">
        <h4>Select Payment Method:</h4>
        <label><input type="radio" name="payment" value="UPI" checked> UPI</label><br>
        <label><input type="radio" name="payment" value="Card"> Credit/Debit Card</label><br>
        <label><input type="radio" name="payment" value="Cash"> Cash on Delivery</label>
      </div>

<button onclick="redirectToSuccess()">Pay ₹${total}</button>

    </div>
    <button onclick="goHome()">Back to Home</button>
  `;
}

else if (pageName === 'offersPage') {
    specialOffersPage();
  } 
  else if (pageName === 'aboutPage') {
    document.getElementById('pageTitle').innerText = 'About FoodieFinds';
    showSection('aboutPage');
  }
  else if (pageName === 'contactPage') {
    showSection('contactPage');
  }

  showSection('dynamicPages');
}


// 🌟 Special Festival Offers
function specialOffersPage() {
  const pageTitle = document.getElementById('pageTitle');
  const pageContent = document.getElementById('pageContent');

  pageTitle.innerText = '🎉 Special Festival Offers';

  const today = new Date();
  const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const festivalName = festivalDates[key];

  let offerHTML = '';
  if (festivalName) {
    offerHTML = `
      <h3>🎉 Happy ${festivalName}!</h3>
      <ul class="cart-list">
        <li>🍕 Manchurian - ₹250 → <b>₹200</b></li>
        <li>🍨 Ice Cream - ₹90 → <b>₹70</b></li>
        <li>🍫 Brownie - ₹120 → <b>₹90</b></li>
      </ul>
      <p style="color:green;">* Discounts auto-applied in cart</p>
    `;
  } else {
    offerHTML = `<p>No special offers today. Visit during festivals for exclusive deals!</p>`;
  }

  pageContent.innerHTML = `
    <div class="cart-box">
      ${offerHTML}
      <button onclick="goHome()">Back to Home</button>
    </div>
  `;
}
function redirectToSuccess() {
  const selected = document.querySelector('input[name="payment"]:checked')?.value;
  const targetCart = currentMode === 'restaurant' ? restaurantCart : homeCart;

  if (!selected) {
    alert("Please select a payment method.");
    return;
  }

  if (targetCart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // ✅ Generate order summary
  const orderId = 'FD' + Math.floor(Math.random() * 1000000);
  const today = new Date();
  const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isFestival = Object.keys(festivalDates).includes(key);

  let total = 0;
  const itemsList = targetCart.map(item => {
    let price = item.price;
    if (isFestival) {
      if (item.name === "Manchurian") price = 200;
      if (item.name === "Ice Cream") price = 70;
      if (item.name === "Brownie") price = 90;
    }
    const subtotal = price * item.qty;
    total += subtotal;
    return `<li>${item.name} × ${item.qty} = ₹${subtotal}</li>`;
  }).join('');

  // ✅ Show Order Success Page
    document.getElementById('pageTitle').innerText = '🎉 Order Successful';
  document.getElementById('pageContent').innerHTML = `
    <div class="cart-box" style="text-align:center;">
      <h3>🎉 Thank you for your order!</h3>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Payment Mode:</strong> ${selected}</p>
      <ul style="list-style:none; padding:0;">${itemsList}</ul>
      <p style="margin:10px 0;"><strong>Total Paid:</strong> ₹${total}</p>
      <p>Your delicious food will be on its way soon! 🍽️</p>

      <button onclick="goHome()" class="home-btn">Back to Home</button>
      <button onclick="playFoodPrepVideo()" class="track-btn">Track Food Preparation</button>

      <div id="videoContainer" style="margin-top:20px; display:none; text-align:center;">
  <video id="prepVideo" width="320" height="240" controls autoplay>
    <source src="videos/food-prep.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
  <br />
  <button onclick="cancelVideo()" style="margin-top:10px; padding:6px 12px; background-color:#ff4d4d; color:white; border:none; border-radius:6px; cursor:pointer;">Cancel</button>
</div>


      <div id="chefContainer"></div>
    </div>
  `;

announceChefs(targetCart);
  // ✅ Clear cart
  targetCart.length = 0;


  // ✅ Navigate to success page
  showSection('dynamicPages');

}
function cancelVideo() {
  const video = document.getElementById("prepVideo");
  video.pause();            // Pause the video
  video.currentTime = 0;    // Reset video to start
  document.getElementById("videoContainer").style.display = "none"; // Hide the video container
}





// 🌟 Payment Handler
function processPayment(total) {
  const selected = document.querySelector('input[name="payment"]:checked')?.value;
  if (!selected) {
    alert("Please select a payment method.");
    return;
  }
  alert(`Payment of ₹${total} initiated via ${selected}.`);
}

// 🌟 Booking Prefill
// 🌟 Extended Booking Prefill to include Email
function showBooking() {
  const loggedInEmail = localStorage.getItem('loggedInUser');
  let name = '';
  let email = '';
  let phone = '';

  if (loggedInEmail) {
    const storedData = localStorage.getItem(`user_${loggedInEmail}`);
    if (storedData) {
      const user = JSON.parse(storedData);
      name = user.name || '';
      email = user.email || '';
      phone = user.phone || '';
    }
  }

  if (name && document.getElementById('bookingName')) {
    document.getElementById('bookingName').value = name;
  }
  if (email) {
    const emailField = document.querySelector('#bookingForm input[type="email"]');
    if (emailField) emailField.value = email;
  }
  if (phone && document.getElementById('bookingPhone')) {
    document.getElementById('bookingPhone').value = phone;
  }

  showSection('bookingPage');
}

// === CHEF ANNOUNCEMENT AND STICKERS ===

const chefAssignments = {
  veg: 'Anita',
  nonveg: 'akash',
  dessert: 'vani'
};

const chefVoices = {
  Anita: 'female',
  akash: 'male',
  vani: 'female'
};

function getItemCategory(itemName) {
  const vegItems = ['Misal Pav', 'Kadi Chawal', 'Manchurian', 'Pizza', 'Veg Thali'];
  const nonvegItems = ['Chicken Biryani', 'Butter Chicken', 'Chicken 65', 'Egg Curry', 'Biryani'];
  const dessertItems = ['Gulab Jamun', 'Rasmalai', 'Ice Cream', 'Brownie', 'Chocolate Cake'];

  if (vegItems.includes(itemName)) return 'veg';
  if (nonvegItems.includes(itemName)) return 'nonveg';
  if (dessertItems.includes(itemName)) return 'dessert';
  return 'veg'; // fallback
}

function announceChefs(cartItems) {
  const chefSpeechMap = {};

  cartItems.forEach(item => {
    const category = getItemCategory(item.name);
    const chef = chefAssignments[category];
    if (!chefSpeechMap[chef]) chefSpeechMap[chef] = { items: [], category };
    chefSpeechMap[chef].items.push(item.name);
  });

  let delay = 0;
  let chefHtml = '';

  Object.entries(chefSpeechMap).forEach(([chef, { items, category }]) => {
    const text = `Hi! I am Chef ${chef}. I will prepare your ${items.join('and ')}.`;

    setTimeout(() => speakChef(text, chefVoices[chef]), delay);

    const imgSrc = {
      veg: 'images/Anita.png',
      nonveg: 'images/akash.png',
      dessert: 'images/vani.jpg'
    }[category];

    chefHtml += `
      <div class="chef-box">
        <img src="${imgSrc}" class="chef-sticker" alt="Chef ${chef}" style="width: 120px; height: 120px; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);" />
        <p><strong>Chef ${chef}:</strong> Preparing ${items.join(', ')}</p>
      </div>
    `;

    delay += 4000;
  });

  const page = document.querySelector('#pageContent .cart-box');
  if (page) {
    const chefContainer = document.createElement('div');
    chefContainer.className = 'chef-container';
    chefContainer.innerHTML = chefHtml;
    page.appendChild(chefContainer);
  }
}

function speakChef(text, gender = 'female') {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  function setVoice() {
    const voices = synth.getVoices();
    let preferred;

    if (gender === 'male') {
      preferred = voices.find(v => v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male'));
    } else {
      preferred = voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female'));
    }

    utterance.voice = preferred || voices.find(v => v.lang.startsWith('en')) || voices[0];
    synth.speak(utterance);
  }

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = setVoice;
  } else {
    setVoice();
  }
}
function playFoodPrepVideo() {
  const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('prepVideo');
  videoContainer.style.display = 'block';
  video.play();
}

function logout() {

  showSection('entryChoice', 'mainHome');
}

