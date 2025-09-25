gsap.registerPlugin(ScrollTrigger);

// Pin the intro text section
ScrollTrigger.create({
  trigger: ".intro-wrapper",
  start: "top top",
  end: "bottom top",
  pin: ".text-align-center",
  pinSpacing: false
});

document.addEventListener("scroll", function () {
  let scrollPosition = window.scrollY;
  let windowHeight = window.innerHeight;
  let scrollDistance = windowHeight * 2; // Adjust this value to set the desired scroll distance for each section
  let sections = document.querySelectorAll('.tabs_let-content');
  let videos = document.querySelectorAll('.tabs_video');
  let lastSectionIndex = sections.length - 1;

  sections.forEach((section, index) => {
    if (index === 0) {
      // Adjust the scroll position for the first section
      let adjustedScrollPosition = scrollPosition - (scrollDistance - windowHeight);
      if (adjustedScrollPosition >= 0 &&
        adjustedScrollPosition < scrollDistance) {
        section.classList.add('is-1');
        videos[index].classList.add('is-1');
      } else {
        section.classList.remove('is-1');
        videos[index].classList.remove('is-1');
      }
    } else {
      if (scrollPosition >= (index * scrollDistance) &&
        scrollPosition < ((index + 1) * scrollDistance)) {
        section.classList.add('is-1');
        videos[index].classList.add('is-1');
      } else {
        section.classList.remove('is-1');
        videos[index].classList.remove('is-1');
      }
    }
  });

  // Keep is-1 class on the last section until user scrolls past it
  if (scrollPosition > (lastSectionIndex * scrollDistance)) {
    sections[lastSectionIndex].classList.add('is-1');
    videos[lastSectionIndex].classList.add('is-1');
  } else {
    sections[lastSectionIndex].classList.remove('is-1');
    videos[lastSectionIndex].classList.remove('is-1');
  }
});