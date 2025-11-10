// -------------------- SIDEBAR MENU --------------------
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }
  
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
  }
  
  // -------------------- CONTACT FORM (SAFE CHECK) --------------------
  const form = document.getElementById("contact-form");
  
  if (form) {
    const msg = document.createElement("p");
    msg.style.display = "none";
    msg.style.color = "green";
    msg.style.fontWeight = "bold";
    form.parentNode.insertBefore(msg, form.nextSibling);
  
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      msg.style.display = "block";
      msg.textContent = "Submitting...";
  
      // Combine first + last name for the 'name' field
      this.querySelector("[name='name']")?.setAttribute(
        "value",
        document.getElementById("firstname").value +
          " " +
          document.getElementById("lastname").value
      );
  
      // Send form using EmailJS
      emailjs.sendForm("service_vgu1nt9", "template_form25", this).then(
        function () {
          msg.textContent = "Form submitted successfully!";
          form.reset();
          setTimeout(() => {
            msg.style.display = "none";
          }, 3000);
        },
        function (error) {
          msg.textContent = "Error sending message. Please try again.";
          console.error(error);
          setTimeout(() => {
            msg.style.display = "none";
          }, 3000);
        }
      );
    });
  }
  
  // -------------------- SLIDESHOW --------------------
  var slideIndex = 1;
  var weekTitles = ["Week 5: Menu", "Week 6: Menu", "Week 7: Menu", "Week 8: Menu"];
  
  // Show the first slide on page load
  window.onload = function () {
    showSlides(slideIndex);
  };
  
  // Next/previous controls
  function plusSlides(n) {
    showSlides((slideIndex += n));
  }
  
  // Thumbnai
  