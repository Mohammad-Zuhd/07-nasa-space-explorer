// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Modal elements
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

// Notice for invalid date range
let notice = document.getElementById('date-notice');
if (!notice) {
  notice = document.createElement('div');
  notice.id = 'date-notice';
  notice.style.color = '#d32f2f';
  notice.style.fontFamily = "'Public Sans', 'Inter', 'Source Sans Pro', Arial, sans-serif";
  notice.style.margin = '10px 0 0 0';
  notice.style.display = 'none';
  document.querySelector('.filters').appendChild(notice);
}

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// NASA APOD API key (use DEMO_KEY for learning/testing)
const API_KEY = 'DEMO_KEY';

// Show a loading message in the gallery
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading space images...</p>
    </div>
  `;
}

// Show an error message if something goes wrong
function showError() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">❌</div>
      <p>Could not load images. Please try again.</p>
    </div>
  `;
}

// Show the gallery with images and videos
function showGallery(items) {
  gallery.innerHTML = '';
  items.forEach(item => {
    let mediaContent = '';
    if (item.media_type === 'image') {
      mediaContent = `<img src="${item.url}" alt="${item.title}" class="gallery-img" style="cursor:pointer;" />`;
    } else if (item.media_type === 'video') {
      mediaContent = `<a href="${item.url}" target="_blank">Watch Video</a>`;
    }
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      ${mediaContent}
      <p><strong>${item.title}</strong><br>${item.date}</p>
    `;
    if (item.media_type === 'image') {
      div.querySelector('img').addEventListener('click', () => {
        openModal(item);
      });
    }
    gallery.appendChild(div);
  });
}

// Open the modal with image or video details
function openModal(item) {
  let mediaContent = '';
  if (item.media_type === 'image') {
    // Show the image in the modal
    mediaContent = `<img src="${item.hdurl || item.url}" alt="${item.title}" style="width:100%; max-height:400px; object-fit:contain; border-radius:8px; margin-bottom:18px; box-shadow:0 2px 12px rgba(0,0,0,0.15);" />`;
  } else if (item.media_type === 'video') {
    // Show a video link in the modal
    mediaContent = `<a href="${item.url}" target="_blank" style="display:inline-block; margin-bottom:18px; font-size:1.2rem; color:#1976d2; font-weight:bold;">▶ Watch Video</a>`;
  }

  modalContent.innerHTML = `
    <button id="modal-close" style="position:absolute; top:10px; right:10px; font-size:24px; background:none; border:none; cursor:pointer;">&times;</button>
    ${mediaContent}
    <h2 style="font-family:'Public Sans','Inter','Source Sans Pro',Arial,sans-serif; font-size:2rem; margin-bottom:8px; color:#003366;">${item.title}</h2>
    <p style="font-family:'Public Sans','Inter','Source Sans Pro',Arial,sans-serif; color:#1976d2; margin-bottom:12px; font-weight:bold; font-size:1.1rem;">${item.date}</p>
    <p style="font-family:'Source Sans Pro','Inter','Public Sans',Arial,sans-serif; font-size:1.1rem; color:#333; line-height:1.6;">${item.explanation}</p>
  `;
  modal.style.display = 'flex';
  modalContent.querySelector('#modal-close').onclick = closeModal;
}

// Close the modal
function closeModal() {
  modal.style.display = 'none';
}

// Also close modal if user clicks outside the modal content
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    closeModal();
  }
});

// Prevent end date from being before start date and show notice
function validateDates() {
  if (startInput.value > endInput.value) {
    notice.textContent = 'End date cannot be before start date.';
    notice.style.display = 'block';
    button.disabled = true;
    return false;
  } else {
    notice.textContent = '';
    notice.style.display = 'none';
    button.disabled = false;
    return true;
  }
}
startInput.addEventListener('change', validateDates);
endInput.addEventListener('change', validateDates);

// Fetch images from NASA API
async function fetchImages(startDate, endDate) {
  showLoading();
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // If the API returns an error, show error message
    if (data.error) {
      showError();
      return;
    }
    const items = Array.isArray(data) ? data : [data];
    showGallery(items);
  } catch (error) {
    showError();
  }
}

// When the button is clicked, fetch and show images
button.addEventListener('click', () => {
  if (validateDates()) {
    const startDate = startInput.value;
    const endDate = endInput.value;
    fetchImages(startDate, endDate);
  }
});

// Fetch and show images for the initial date range
const initialStartDate = startInput.value;
const initialEndDate = endInput.value;
fetchImages(initialStartDate, initialEndDate);
