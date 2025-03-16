const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc";
const omdbApiKey = "c409b61f";

async function loadWatchlist() {
    const moviesContainer = document.getElementById("movies-watchlist");
    const seriesContainer = document.getElementById("series-watchlist");
    const emptyMessage = document.getElementById("empty-watchlist");
    
    if (!moviesContainer || !seriesContainer) {
        console.error("عناصر واچ‌لیست در HTML یافت نشدند.");
        return;
    }

    moviesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';
    seriesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';

    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
    if (!watchlist.movies || !watchlist.series) {
        watchlist = { movies: [], series: [] };
    }

    if (watchlist.movies.length === 0 && watchlist.series.length === 0) {
        moviesContainer.innerHTML = "";
        seriesContainer.innerHTML = "";
        emptyMessage.classList.remove("hidden");
        return;
    }

    emptyMessage.classList.add("hidden");
    moviesContainer.innerHTML = "";
    seriesContainer.innerHTML = "";

    try {
        for (const movieId of watchlist.movies) {
            await fetchAndDisplayItem(movieId, "movie", moviesContainer, "tmdb");
        }
        for (const seriesId of watchlist.series) {
            await fetchAndDisplayItem(seriesId, "tv", seriesContainer, "omdb");
        }
    } catch (error) {
        console.error("خطا در دریافت اطلاعات واچ‌لیست:", error);
        moviesContainer.innerHTML = '<div class="text-red-400">خطا در بارگذاری فیلم‌ها</div>';
        seriesContainer.innerHTML = '<div class="text-red-400">خطا در بارگذاری سریال‌ها</div>';
    }
}

async function fetchAndDisplayItem(itemId, type, container, apiSource) {
    try {
        let item;
        if (apiSource === "tmdb") {
            const res = await fetch(`https://api.themoviedb.org/3/${type}/${itemId}?api_key=${tmdbApiKey}&language=fa-IR`);
            if (!res.ok) throw new Error("پاسخ API TMDB ناموفق بود.");
            item = await res.json();
        } else if (apiSource === "omdb") {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbApiKey}&i=${itemId}&plot=full`);
            if (!res.ok) throw new Error("پاسخ API OMDb ناموفق بود.");
            const data = await res.json();
            if (data.Response === "False") throw new Error(data.Error);
            item = {
                id: itemId,
                title: data.Title,
                name: data.Title,
                overview: data.Plot,
                poster_path: data.Poster !== "N/A" ? data.Poster : null
            };
        }

        const itemCard = `
            <div class="group relative">
                ${item.poster_path ? `<img src="${item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`}" alt="${item.title || item.name}" class="w-full h-auto rounded-lg shadow-lg">` : '<div class="w-full h-64 bg-gray-300 rounded-lg"></div>'}
                <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                    <h3 class="text-lg font-bold">${item.title || item.name || "بدون عنوان"}</h3>
                    <p class="text-sm">${item.overview ? item.overview.slice(0, 100) + '...' : 'بدون توضیحات'}</p>
                    <a href="/freemovie/${type}/index.html?id=${item.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                    <button class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onclick="removeFromWatchlist('${item.id}', '${type}')">حذف از واچ‌لیست</button>
                </div>
            </div>
        `;
        container.innerHTML += itemCard;
    } catch (error) {
        console.error(`خطا در دریافت اطلاعات ${type === "movie" ? "فیلم" : "سریال"} با شناسه ${itemId}:`, error);
        container.innerHTML += '<div class="text-red-400">خطا در بارگذاری آیتم</div>';
    }
}

function removeFromWatchlist(itemId, type) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
    
    if (type === "movie") {
        watchlist.movies = watchlist.movies.filter(id => String(id) !== String(itemId));
    } else if (type === "tv") {
        watchlist.series = watchlist.series.filter(id => String(id) !== String(itemId));
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert("آیتم از واچ‌لیست حذف شد!");
    loadWatchlist();
}

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
});

document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
    loadWatchlist();
});