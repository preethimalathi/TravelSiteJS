document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("bookingForm");
  if(form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      document.getElementById("formMessage").textContent = "Booking successful! We'll contact you soon.";
      form.reset();
    });
  }
});