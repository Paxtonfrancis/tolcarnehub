function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }
  
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
  }

  const form = document.getElementById("contact-form");
  const msg = document.createElement("p");
  msg.style.display = "none";
  msg.style.color = "green";
  msg.style.fontWeight = "bold";
  form.parentNode.insertBefore(msg, form.nextSibling); 
  
  form.addEventListener("submit", function(event) {
      event.preventDefault(); 
      msg.style.display = "block";
      msg.textContent = "Submitting...";
  
      this.querySelector("[name='name']")?.setAttribute('value', 
          document.getElementById("firstname").value + " " + document.getElementById("lastname").value
      );
  
      emailjs.sendForm('service_vgu1nt9', 'template_form25', this)
          .then(function() {
              msg.textContent = "Form submitted successfully!";
              form.reset();
              setTimeout(() => { msg.style.display = "none"; }, 3000);
          }, function(error) {
              msg.textContent = "Error sending message. Please try again.";
              console.error(error);
              setTimeout(() => { msg.style.display = "none"; }, 3000);
          });
  });
  

















  
  var slideIndex = 1;
var weekTitles = [
    "Week 5: Menu",
    "Week 6: Menu",
    "Week 7: Menu",
    "Week 8: Menu"
];

// Show the first slide on page load
window.onload = function() {
    showSlides(slideIndex);
};

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail/dot controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    var caption = document.getElementById("week-caption");

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    // Hide all slides
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // Remove "active" from all dots
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // Show the current slide
    slides[slideIndex - 1].style.display = "block";

    // Set the active dot
    if(dots[slideIndex - 1]){
        dots[slideIndex - 1].className += " active";
    }

    // Update week title
    if(caption){
        caption.innerHTML = weekTitles[slideIndex - 1];
    }
}
