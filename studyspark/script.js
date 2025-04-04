document.addEventListener("DOMContentLoaded", function () {
  // Get all flashcards
  const flashcards = document.querySelectorAll(".flashcard");

  // Add click event to flip cards manually (in addition to hover)
  flashcards.forEach((card) => {
    card.addEventListener("click", function () {
      const inner = this.querySelector(".flashcard-inner");
      inner.style.transform =
        inner.style.transform === "rotateY(180deg)" ? "" : "rotateY(180deg)";
    });
  });
});
