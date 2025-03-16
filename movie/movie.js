const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc";
const movieId = new URLSearchParams(window.location.search).get("id");

async function getMovieDetails() {
  try {
    if (!movieId) {
      throw new Error("شناسه فیلم در URL وجود ندارد!");
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&language=fa-IR`
    );
    const movie = await res.json();

    const externalIdsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${tmdbApiKey}`
    );
    const externalIds = await externalIdsRes.json();
    const imdbID = externalIds.imdb_id ? externalIds.imdb_id.replace("tt", "") : "";
    const year = movie.release_date ? movie.release_date.split("-")[0] : "نامشخص";

    document.getElementById("title").textContent = movie.title || "نامشخص";
    document.getElementById("overview").textContent =
      movie.overview || "خلاصه‌ای در دسترس نیست.";
    document.getElementById("genre").innerHTML = `<strong>ژانر:</strong> ${
      movie.genres ? movie.genres.map((g) => g.name).join(", ") : "نامشخص"
    }`;
    document.getElementById(
      "year"
    ).innerHTML = `<strong>سال تولید:</strong> ${year}`;
    document.getElementById(
      "rating"
    ).innerHTML = `<strong>امتیاز:</strong> ${movie.vote_average || "بدون امتیاز"}/10`;
    document.getElementById("poster").src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/500";
    document.getElementById("movie-bg").style.backgroundImage = movie.backdrop_path
      ? `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`
      : "url('https://via.placeholder.com/1920x1080')";

    const trailerRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`
    );
    const trailerData = await trailerRes.json();
    const trailerContainer = document.getElementById("trailer");
    if (trailerData.results && trailerData.results.length > 0) {
      trailerContainer.src = `https://www.youtube.com/embed/${trailerData.results[0].key}`;
    } else {
      trailerContainer.innerHTML = '<p class="text-yellow-500">تریلر در دسترس نیست</p>';
    }

    const downloadLinks = `
      <a href="https://berlin.saymyname.website/Movies/${year}/${imdbID}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">دانلود فیلم (لینک اصلی)</a>
      <a href="https://tokyo.saymyname.website/Movies/${year}/${imdbID}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">دانلود فیلم (لینک کمکی)</a>
      <button id="add-to-watchlist" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">افزودن به واچ لیست</button>
    `;
    document.getElementById("download-links").innerHTML = downloadLinks;

    document
      .getElementById("add-to-watchlist")
      .addEventListener("click", () => {
        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
        if (!watchlist.movies.includes(movieId)) {
          watchlist.movies.push(movieId);
          localStorage.setItem("watchlist", JSON.stringify(watchlist));
          alert("فیلم به واچ لیست اضافه شد!");
        } else {
          alert("فیلم قبلاً در واچ لیست است!");
        }
      });
  } catch (error) {
    console.error("خطا در دریافت اطلاعات:", error);
    document.getElementById("download-links").innerHTML = `<p class="text-red-500">خطا در دریافت اطلاعات: ${error.message}</p>`;
  }
}

getMovieDetails();

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const icon = document.querySelector("#theme-toggle i");
  icon.classList.toggle("fa-sun");
  icon.classList.toggle("fa-moon");
});

document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");
});