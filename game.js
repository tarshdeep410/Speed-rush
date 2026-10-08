const playButton = document.querySelector("button");
const title = document.querySelector("h1");

playButton.addEventListener("click", function() {
    playButton.style.display = "none";

    let count = 3;
    title.textContent = count;

    const countdown = setInterval(function() {
        count--;

        if (count > 0) {
            title.textContent = count;
        } else {
            clearInterval(countdown);
            title.textContent = "GO!";
        }
    }, 1000);
});
