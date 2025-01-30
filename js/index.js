// Api urls
const ProxyApi = "https://proxyfn.shubhamkr-sk8016.workers.dev/?u=";
const IndexApi = "/home";
const recentapi = "/recent/";

// Api Server Manager
const AvailableServers = ["https://api3.electraop09.workers.dev"];

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Useful functions
async function getJson(path, errCount = 0) {
    const ApiServer = getApiServer();

    let url = ApiServer + path;

    if (errCount > 2) {
        throw `Too many errors while fetching ${url}`;
    }

    if (errCount > 0) {
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const _url_of_site = new URL(window.location.href);
        const referer = _url_of_site.origin;
        const response = await fetch(url, { headers: { referer: referer } });
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1);
    }
}

function genresToString(genres) {
    return genres.join(", ");
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

// Adding slider animes (trending animes from anilist)
async function getTrendingAnimes(data) {
    let SLIDER_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        let anime = data[pos];
        let title = anime["title"]["userPreferred"];
        let type = anime["format"];
        let status = anime["status"];
        let genres = genresToString(anime["genres"]);
        let description = anime["description"];
        let url = "./anime.html?anime_id=" + encodeURIComponent(title);

        let poster = anime["bannerImage"] || anime["coverImage"]["extraLarge"];

        SLIDER_HTML += `<div class="mySlides fade"> 
            <div class="data-slider"> 
                <p class="spotlight">#${pos + 1} Spotlight</p>
                <h1>${title}</h1> 
                <div class="extra1"> 
                    <span class="year"><i class="fa fa-play-circle"></i>${type}</span> 
                    <span class="year year2"><i class="fa fa-calendar"></i>${status}</span> 
                    <span class="cbox cbox1">${genres}</span> 
                    <span class="cbox cbox2">HD</span> 
                </div>
                <p class="small-synop">${description}</p>
                <div id="watchh"> 
                    <a href="${url}" class="watch-btn"> 
                        <i class="fa fa-play-circle"></i> Watch Now 
                    </a> 
                    <a href="${url}" class="watch-btn watch-btn2"> 
                        <i class="fa fa-info-circle"></i> Details<i class="fa fa-angle-right"></i> 
                    </a> 
                </div>
            </div>
            <div class="shado"> <a href="${url}"></a> </div>
            <img src="${poster}">
        </div>`;
    }

    const container = document.querySelector(".slideshow-container");
    if (container) {
        container.innerHTML =
            SLIDER_HTML +
            '<a class="prev" onclick="plusSlides(-1)">&#10094;</a><a class="next" onclick="plusSlides(1)">&#10095;</a>';
    } else {
        console.error("Slideshow container not found.");
    }
}

// Adding popular animes
async function getPopularAnimes(data) {
    let POPULAR_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        let anime = data[pos];
        let title = anime["title"];
        let id = anime["id"];
        let url = "./anime.html?anime_id=" + id;
        let image = anime["image"];
        let subOrDub = title.toLowerCase().includes("dub") ? "DUB" : "SUB";

        POPULAR_HTML += `<a href="${url}">
            <div class="poster la-anime">
                <div id="shadow1" class="shadow">
                    <div class="dubb"># ${pos + 1}</div> 
                    <div class="dubb dubb2">${subOrDub}</div>
                </div>
                <div id="shadow2" class="shadow"> 
                    <img class="lzy_img" src="./static/loading1.gif" data-src="${image}">
                </div>
                <div class="la-details"> 
                    <h3>${title}</h3>
                </div>
            </div>
        </a>`;
    }

    const container = document.querySelector(".popularg");
    if (container) {
        container.innerHTML = POPULAR_HTML;
    } else {
        console.error("Popular animes container not found.");
    }
}

// Adding recent animes
async function getRecentAnimes(page = 1) {
    const data = (await getJson(recentapi + page))["results"];
    let RECENT_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        let anime = data[pos];
        let title = anime["title"];
        let id = anime["id"].split("-episode-")[0];
        let url = "./anime.html?anime_id=" + id;
        let image = anime["image"];
        let ep = anime["episode"].split(" ")[1];
        let subOrDub = title.toLowerCase().includes("dub") ? "DUB" : "SUB";

        RECENT_HTML += `<a href="${url}">
            <div class="poster la-anime">
                <div id="shadow1" class="shadow">
                    <div class="dubb">${subOrDub}</div>
                    <div class="dubb dubb2">EP ${ep}</div>
                </div>
                <div id="shadow2" class="shadow">
                    <img class="lzy_img" src="./static/loading1.gif" data-src="${image}">
                </div>
                <div class="la-details">
                    <h3>${title}</h3>
                </div>
            </div>
        </a>`;
    }

    const container = document.querySelector(".recento");
    if (container) {
        container.innerHTML += RECENT_HTML;
    } else {
        console.error("Recent animes container not found.");
    }
}

// Add other fixes as necessary...

// DOMContentLoaded wrapper
document.addEventListener("DOMContentLoaded", () => {
    getJson(IndexApi).then((data) => {
        const anilistTrending = shuffle(data["results"]["anilistTrending"]);
        const gogoanimePopular = shuffle(data["results"]["gogoPopular"]);

        getTrendingAnimes(anilistTrending);
        getPopularAnimes(gogoanimePopular);
        getRecentAnimes(1);
    });
});
