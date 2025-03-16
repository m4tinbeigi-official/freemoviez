<?php
// TMDB API Key
const TMDB_API_KEY = "1dc4cbf81f0accf4fa108820d551dafc";

// Function to fetch data from TMDB API
function fetchTmdbData($endpoint) {
    $url = "https://api.themoviedb.org/3/{$endpoint}?api_key=" . TMDB_API_KEY . "&language=fa-IR";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response !== false) {
        return json_decode($response, true);
    }
    error_log("Error fetching TMDB data from {$endpoint}: HTTP {$httpCode}");
    return null;
}

// Function to get featured movies (slider)
function getFeaturedMovies() {
    $data = fetchTmdbData("movie/popular");
    if ($data && isset($data['results'])) {
        return array_slice($data['results'], 0, 5);
    }
    return [];
}

// Function to get new movies
function getNewMovies() {
    $data = fetchTmdbData("movie/now_playing");
    if ($data && isset($data['results'])) {
        return $data['results'];
    }
    return [];
}

// Determine theme and menu state from GET parameters
$theme = isset($_GET['theme']) && $_GET['theme'] === 'dark' ? 'dark' : '';
$menuVisible = isset($_GET['menu']) && $_GET['menu'] === 'show' ? '' : 'hidden';

// Fetch movie data
$featuredMovies = getFeaturedMovies();
$newMovies = getNewMovies();

?>
<!DOCTYPE html>
<html lang="fa" class="<?php echo htmlspecialchars($theme); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فیری موویز - صفحه اصلی</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@latest/dist/font-face.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="icon" href="/fav/favicon.ico" type="favicon/ico">
    <style>
        body { font-family: 'Vazir', sans-serif; direction: rtl; }
        .skeleton { background: #333; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-gray-800 p-4 shadow-md">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center">
                <a href="index.php">
                    <img src="logo.png" alt="لوگو" class="h-10 mr-2">
                </a>
                <h1 class="text-xl font-bold">فیری موویز</h1>
            </div>
            <nav class="hidden md:flex space-x-4 space-x-reverse">
                <a href="index.php" class="hover:text-gray-300">خانه</a>
                <a href="search/index.html" class="hover:text-gray-300">جستجو</a>
                <a href="watchlist/index.html" class="hover:text-gray-300">واچ لیست</a>
                <a href="index.php?theme=<?php echo $theme === 'dark' ? '' : 'dark'; ?>" class="hover:text-gray-300">
                    <i class="fas <?php echo $theme === 'dark' ? 'fa-sun' : 'fa-moon'; ?>"></i>
                </a>
            </nav>
            <a href="index.php?menu=<?php echo $menuVisible === '' ? 'hide' : 'show'; ?>" class="md:hidden">
                <i class="fas fa-bars"></i>
            </a>
        </div>
        <div id="mobile-menu" class="md:hidden bg-gray-700 p-4 mt-2 <?php echo htmlspecialchars($menuVisible); ?>">
            <a href="index.php" class="block py-2 hover:text-gray-300">خانه</a>
            <a href="search/index.html" class="block py-2 hover:text-gray-300">جستجو</a>
            <a href="watchlist/index.html" class="block py-2 hover:text-gray-300">واچ لیست</a>
        </div>
    </header>

    <!-- Slider -->
    <section class="relative">
        <div id="slider" class="flex flex-col md:flex-row overflow-x-auto snap-x snap-mandatory gap-2 p-2 text-center pt-4">
            <?php if (empty($featuredMovies)): ?>
                <div class="skeleton w-full h-96"></div>
            <?php else: ?>
                <?php foreach ($featuredMovies as $movie): ?>
                    <div class="w-full flex-auto h-96 bg-cover bg-center snap-start" 
                         style="background-image: url('https://image.tmdb.org/t/p/original<?php echo htmlspecialchars($movie['backdrop_path']); ?>')">
                        <div class="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center">
                            <h2 class="text-3xl font-bold"><?php echo htmlspecialchars($movie['title']); ?></h2>
                            <p class="mt-2"><?php echo htmlspecialchars(substr($movie['overview'], 0, 100)) . '...'; ?></p>
                            <a href="/movie/index.html?id=<?php echo htmlspecialchars($movie['id']); ?>" 
                               class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </section>

    <!-- New Movies -->
    <section class="container mx-auto py-8">
        <h2 class="text-2xl font-bold mb-8 text-center">جدیدترین فیلم‌ها</h2>
        <div id="new-movies" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 m-4">
            <?php if (empty($newMovies)): ?>
                <div class="skeleton w-full h-64"></div>
                <div class="skeleton w-full h-64"></div>
                <div class="skeleton w-full h-64"></div>
                <div class="skeleton w-full h-64"></div>
            <?php else: ?>
                <?php foreach ($newMovies as $movie): ?>
                    <div class="group relative">
                        <img src="https://image.tmdb.org/t/p/w500<?php echo htmlspecialchars($movie['poster_path']); ?>" 
                             alt="<?php echo htmlspecialchars($movie['title']); ?>" 
                             class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold"><?php echo htmlspecialchars($movie['title']); ?></h3>
                            <p class="text-sm"><?php echo htmlspecialchars(substr($movie['overview'], 0, 100)) . '...'; ?></p>
                            <a href="/movie/index.html?id=<?php echo htmlspecialchars($movie['id']); ?>" 
                               class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 p-4 mt-auto">
        <div class="container mx-auto text-center">
            <p>
                فیری مووی - ساخته شده توسط 
                <a href="https://x.com/m4tinbeigi" class="hover:text-gray-300">ریک سانچز</a> و 
                <a href="https://x.com/armin_np_" class="hover:text-gray-300">ارمین جوان</a> با 🤍 | 
                استفاده از فونت 
                <a href="https://rastikerdar.github.io/vazir-font/" class="hover:text-gray-300">وزیر</a> به یاد 
                <a href="https://example.com/saber-rastikerdar" class="hover:text-gray-300">صابر راستی کردار</a><br>
                در این وبسایت از وب سرویس 
                <a href="https://www.omdbapi.com/" class="hover:text-gray-300">OMDB</a> و 
                <a href="https://www.themoviedb.org/" class="hover:text-gray-300">TMDB</a> برای جستجو و اطلاعات فیلم‌ها و از 
                <a href="https://almasmovie.website/" class="hover:text-gray-300">الماس مووی</a> برای دانلود فیلم‌ها استفاده می‌شود.
            </p>
            <div class="social-icons mb-2">
                <a class="github-button" href="https://github.com/m4tinbeigi-official/freemovie" 
                   data-icon="octicon-star" data-show-count="true" 
                   aria-label="Star m4tinbeigi-official/freemovie on GitHub">Star</a>
                <script async defer src="https://buttons.github.io/buttons.js"></script>
            </div>
        </div>
    </footer>
</body>
</html>