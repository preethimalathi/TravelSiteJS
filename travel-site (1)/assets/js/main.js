
// initialize DOM references
// Waits until the entire webpage (HTML) is fully loaded before running any JavaScript.
//That ensures all elements like buttons, inputs, etc., are available in the DOM.
document.addEventListener('DOMContentLoaded', ()=> {
// These constants store references to specific HTML elements:
// destListEl: container that will hold all destination cards.
// filterRegion: <select> dropdown for filtering by region.
// searchInput: text box for searching destinations.
// priceRange: range slider for filtering by price.
  const destListEl = document.getElementById('dest-list');
  const filterRegion = document.getElementById('filter-region');
  const searchInput = document.getElementById('filter-search');
  const priceRange = document.getElementById('filter-price');
// Checks if there’s a modal element with ID destinationModal.
// If yes, creates a new Bootstrap modal instance for it; if not, sets it to null.
  const bookModal = document.getElementById('destinationModal') ? new bootstrap.Modal(document.getElementById('destinationModal')) : null;
// will later hold all destination data from the JSON file.
  let destinations = [];

  // fetch local JSON data or else give API link
  fetch('assets/data/destinations.json').then(r=>{
    if(!r.ok) throw new Error('fetch failed');
    return r.json();  // Converts the response into a JavaScript object (from JSON format).
    //Once the JSON is loaded:
//Saves it into the global destinations array.
//Calls populateRegionOptions() to fill region dropdown.
//Calls renderList() to display destination cards.
  }).then(data=>{
    destinations = data;
    populateRegionOptions();
    renderList(destinations);
    //If something goes wrong while fetching, logs the error and shows an empty list.
  }).catch(e=>{
    console.error('Failed to load destinations, using fallback.', e);
    destinations = [];
    renderList(destinations);
  });
  //Populate Filter Dropdowns
  function populateRegionOptions(){
    if(!filterRegion) return;
    // To extract unique regions from the destinations data. 
    // map() to get all regions.
  //Set() to remove duplicates.
  //Array.from() to convert Set back to array.
    const regions = Array.from(new Set(destinations.map(d=>d.region)));
    //Loops through each region and creates <option> elements to add to the dropdown.
    regions.forEach(r=>{
      const opt = document.createElement('option'); opt.value = r; opt.textContent = r;
      filterRegion.appendChild(opt);
    });
    //Finds the maximum price among all destinations. Defaults to 1000 if empty.
    const maxPrice = Math.max(...destinations.map(d=>d.price),1000);
    //Sets the maximum and current value of the price slider.
    if(priceRange){ priceRange.max = maxPrice; priceRange.value = maxPrice; }
    // Updates the displayed price label ($value) next to the slider.
    if(document.getElementById('price-value')) document.getElementById('price-value').textContent = '$' + (priceRange?priceRange.value:maxPrice);
  }
  // Render Destination Cards
  function renderList(list){
    //Clears any existing content in the destination list container.
    if(!destListEl) return;
    destListEl.innerHTML = '';
    //If the list is empty, shows a placeholder message.
    if(list.length===0) destListEl.innerHTML = '<p class="text-muted">No destinations yet.</p>';
    //Loops through each destination and creates a Bootstrap grid column.
    list.forEach(d=>{
      const card = document.createElement('div'); card.className='col-md-6 col-lg-4 mb-4';
      //Creates a Bootstrap card.
      //The image uses the first image in the destination’s images[] list.
      //loading="lazy" improves performance by loading only when visible.
      card.innerHTML = `
        <div class="card card-custom h-100">
          <img src="${d.images[0]}" class="card-img-top" alt="${d.name}" loading="lazy">
          <!--Adds name, price badge, and a short description.-->
          <div class="card-body">
            <h5 class="card-title">${d.name} <span class="float-end price-badge">$${d.price}</span></h5>
            <p class="card-text">${d.shortDescription}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">${d.duration} days • ${d.region}</small>
              <!--Adds two buttons:
              “Details” → opens modal.
              “Book” → takes to booking page.
              Finally appends each card to the destination container.-->
              <div>
                <button class="btn btn-sm btn-outline-primary me-2" data-id="${d.id}" data-action="details">Details</button>
                <button class="btn btn-sm btn-primary" data-id="${d.id}" data-action="book">Book</button>
              </div>
            </div>
          </div>
        </div>
      `;
      destListEl.appendChild(card);
    });
  }

  // Filters (Region, Search, Price)
  function applyFilters(){
    //Makes sure filters exist before applying.
    if(!filterRegion && !searchInput && !priceRange) return;
    //Region filter value.
    //Search keyword (lowercased for case-insensitive match).
    //Maximum allowed price.
    const region = filterRegion?.value || '';
    const search = searchInput?.value?.toLowerCase() || '';
    const maxPrice = Number(priceRange?.value || 999999);
    //Filters the destinations array based on region, price, and search keyword.and re-renders the filtered list.
    const filtered = destinations.filter(d=>{
      return (region===''||d.region===region) &&
             (d.price<=maxPrice) &&
             (d.name.toLowerCase().includes(search) || d.shortDescription.toLowerCase().includes(search));
    });
    renderList(filtered);
  }
  //Whenever the user:
  //Changes region → updates results.
  //Types in search → updates results.
  //Moves price slider → updates price display and results.
  filterRegion?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);
  priceRange?.addEventListener('input', ()=>{ document.getElementById('price-value').textContent = '$'+priceRange.value; applyFilters(); });

  // delegate clicks for details and book buttons
  //Adds one global listener to handle all button clicks efficiently.
  //closest('button') ensures even if you click the icon/text inside a button, it still works.
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    //Reads the button’s data-id (destination id) and data-action (details/book).
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    //If it’s a “Details” button - finds that destination and opens modal.
    if(action==='details'){
      const d = destinations.find(x=>x.id===id);
      if(!d) return;
      showDetails(d);
    } 
    //If it’s a “Book” button - stores destination info in localStorage and redirects to booking page.
    else if(action==='book'){
      const d = destinations.find(x=>x.id===id);
      if(!d) return;
      //If already on booking page → prefill it directly.
    //Otherwise → navigate to booking.html with query parameter.
      localStorage.setItem('prefillDestination', JSON.stringify({id:d.id,name:d.name}));
      if(window.location.pathname.includes('booking.html')){
        if(window.prefillBooking) window.prefillBooking();
      } else {
        window.location.href = 'booking.html?prefill=' + encodeURIComponent(d.id);
      }
    } 
    //If booking modal exists, it opens that instead of navigating (alternative behavior).
    else if(btn.getAttribute('data-action')==='book' && bookModal){
      bookModal.show();
    }
  });
// Show Details Modal
  function showDetails(d){
    //Gets the modal element. If it’s missing, stops.
    const modalEl = document.getElementById('destinationModal');
    if(!modalEl) return;
    //Retrieves existing Bootstrap modal instance, or creates a new one.
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    //Sets modal title to the destination’s name.
    modalEl.querySelector('.modal-title').textContent = d.name;
    //Fills modal body with:Long description,Duration and price,Image thumbnails and Displays the modal on screenby show().
    modalEl.querySelector('.modal-body').innerHTML = `
      <p>${d.longDescription}</p>
      <p><strong>Duration:</strong> ${d.duration} days • <strong>Price:</strong> $${d.price}</p>
      <div class="d-flex gap-2">${d.images.map(i=>`<img src="${i}" style="width:80px;height:60px;object-fit:cover;border-radius:8px">`).join('')}</div>
    `;
    modal.show();
  }

  // prefill booking on booking page after clicking book

  //Runs this block only when the user is on booking.html.
  if(window.location.pathname.includes('booking.html')){

    function prefillBooking(){
      //Reads the destination id from the page URL (like booking.html?prefill=1).
      const qs = new URLSearchParams(location.search);
      const pid = qs.get('prefill');
      //If there’s a matching ID, find that destination in the data.
      let pre = null;
      if(pid){
        pre = destinations.find(d=>d.id===pid);
      }
      //If not found via URL, tries getting it from localStorage
      if(!pre){
        const stored = localStorage.getItem('prefillDestination');
        if(stored) pre = JSON.parse(stored);
      }
      //If a destination is found, prefill the booking form.
      if(pre){
        const el = document.getElementById('booking-destination');
        if(el) el.value = pre.name || pre;
      }
    }
    //Makes the function globally accessible and runs it after a short delay (so form loads first).
    window.prefillBooking = prefillBooking;
    setTimeout(prefillBooking, 600);
  }

  // counters on scroll

  //Selects all number elements that should count up.
  const counters = document.querySelectorAll('.counter');
  //When user scrolls:
  //Checks if counter is visible.
  //If visible and not already animated - starts animation.
  //Marks it as animated so it doesn’t repeat.
  function revealCounters(){
    counters.forEach(c=>{
      if(c.dataset.animated) return;
      const rect = c.getBoundingClientRect();
      if(rect.top < window.innerHeight - 50){
        animateNumber(c, Number(c.dataset.to || 100));
        c.dataset.animated = '1';
      }
    });
  }
  //Smoothly counts from 0 to the target number (data-to) by updating text every 20ms.
  function animateNumber(el, to){
    let start = 0; const dur=900; const step = Math.ceil(to/(dur/20));
    const iv = setInterval(()=>{
      start += step;
      if(start>=to){ start=to; clearInterval(iv);}
      el.textContent = start;
    },20);
  }
  //Adds .visible class to faded elements that come into view (for animations).Runs the counter reveal logic.
  window.addEventListener('scroll', ()=>{ 
    document.querySelectorAll('.fade-in')
    .forEach(el=>{ if(el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add('visible'); 
  }); 
    revealCounters();});
  //Runs animations on page load as well (after small delay).
  setTimeout(()=>{ document.querySelectorAll('.fade-in')
    .forEach(el=> el.classList.add('visible'));
     revealCounters(); },200);
  // form -----email in contact us

  //Selects the contact form if present.
  const contactForm = document.getElementById('contact-form');
  //Adds submit event handler; preventDefault() stops page reload.
  contactForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    //Gets user input values and trims extra spaces.
    const name = contactForm.querySelector('[name=name]').value.trim();
    const email = contactForm.querySelector('[name=email]').value.trim();
    const msg = contactForm.querySelector('[name=message]').value.trim();
    //Validates all fields are filled.
    if(!name||!email||!msg){ alert('Please fill all fields.'); return; }
    //If there’s a Bootstrap toast component, show it as success message; otherwise use alert.
    const t = document.getElementById('contact-toast');
    if(t){ const bs = new bootstrap.Toast(t); bs.show(); contactForm.reset(); } else alert('Message sent (mock).');
  });

});
