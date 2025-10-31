

var slideIndex = 1;


function plusSlides(n) {
    slideIndex = slideIndex + n;
    showSlides();
}

function currentSlide(thumbnailID) {
    slideIndex = thumbnailID;
    showSlides();
}
function showSlides() {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var thumbnails = document.getElementsByClassName("myThumbnail");
    var dots = document.getElementsByClassName("dot");  
    var captionText = document.getElementById("caption");

    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    if (slideIndex < 1) {
        slideIndex = slides.length;
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (i = 0; i < thumbnails.length; i++) {
        thumbnails[i].className = thumbnails[i].className.replace(" active", "");
    }

    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex - 1].style.display = "block";

    if(thumbnails[slideIndex - 1]){
        thumbnails[slideIndex - 1].className += " active";
        captionText.innerHTML = thumbnails[slideIndex - 1].alt;
    }

    if(dots[slideIndex - 1]){
        dots[slideIndex - 1].className += " active";
    }
}

window.onload = showSlides;




  
