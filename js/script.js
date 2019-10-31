function loading(id, type) {
    if (type) {
        $(id).hide();
        $('#loading').show();
    } else {
        $(id).show();
        $('#loading').hide();
    }
}

function load_home(type, page) {

    $('#cat').empty();
    $('#cat').append(`
        <button class="btn btn-outline-dark" onclick="load_home('popular', 1)">
            <h2>Popular</h2>
        </button>
        <button class="btn btn-outline-dark ml-2 mr-2" onclick="load_home('now_playing', 1)">
            <h2>Now Playing</h2>
        </button>
        <button class="btn btn-outline-dark" onclick="load_home('top_rated', 1)">
            <h2>Top Rated</h2>
        </button>
    `);

    if (type == 'now_playing') {
        $('#cat').children().eq(1).addClass('active');
        document.title = 'Now Playing - MovieLibrary';
    } else if (type == 'top_rated') {
        $('#cat').children().eq(2).addClass('active');
        document.title = 'Top Rated - MovieLibrary';
    } else {
        $('#cat').children().eq(0).addClass('active');
        document.title = 'Popular - MovieLibrary';
    }

    get_list(type, page);
}

async function get_list(type, page) {

    loading('#list', 1);

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`https://api.themoviedb.org/3/movie/${type}?api_key=${key}&page=${page}`);
    console.log(response);
    const data = await response.json();
    console.log(data);
    const list = data.results;

    if (!list.length)
        return;

    $('#list').empty();
    for (const item of list) {

        var rated = '';
        for (i = 0; i < parseInt(item.vote_average / 2); ++i)
            rated += '&#9733';
        for (i = parseInt(item.vote_average / 2); i < 5; ++i)
            rated += '&#9734';
        rated += '(' + item.vote_count + ')';

        $('#list').append(`
            <div class="col-3 mb-3">
                <div class="card bg-dark text-light img-overlay">
                    <img src="https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}" class="card-img" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';">

                    <div class="card-img-overlay d-flex flex-column justify-content-end hide-text text-center">
                        <a class="a-color" href="#" onclick="movie_info(${item.id})">
                            <h4 class="card-title mb-0">${item.title}</h4>
                            <p class="card-text text-white-50 mb-2">${item.release_date}</p>
                            <p class="card-text text-warning">${rated}</p>
                        </a>
                    </div>
                </div>
            </div>
        `);
    }

    if (data.total_pages > 1) {
        $('#list').append(`
            <div class="col-12">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li id="prev" class="page-item">
                            <a class="page-link" href="#" onclick="get_list('${type}', 1)">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `);

        var begin = (page < 6) ? 1 : page - 4;
        var end = (page < 6) ? 10 : page + 5;

        for (i = begin; i <= data.total_pages && i < end; ++i) {

            $('[class="pagination justify-content-center"]').append(`
                <li id="pg${i}" class="page-item">
                    <a class="page-link" href="#" onclick="get_list('${type}', ${i})">${i}</a>
                </li>
            `);
        }

        $('[class="pagination justify-content-center"]').append(`
                    <li id="next" class="page-item">
                        <a class="page-link" href="#" onclick="get_list('${type}', ${data.total_pages})">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
        `);

        let id = "#pg" + page;
        $(id).addClass('active');

        if (page == 1)
            $('#prev').addClass('disabled');
        if (page == data.total_pages)
            $('#next').addClass('disabled');
    }

    loading('#list', 0);
}

function search_input() {

    if (!$('#search').val())
        return;

    document.title = 'Searching for: ' + $('#search').val();

    if ($('select').val() == 'movie')
        search_movie($('#search').val(), 1);
    else
        search_cast($('#search').val());
}

async function search_movie(name, page) {

    $('#cat').empty();
    $('#cat').append(`
        <h2><i>Searching for: ${name}</i></h2>
    `);

    loading('#list', 1);

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${name}&page=${page}`);
    console.log(response);
    const data = await response.json();
    console.log(data);
    const list = data.results;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>Movie not exist!</i></h3>
        `);
        $('#list').empty();
        loading('#list', 0);

        return;
    }

    $('#list').empty();
    for (const item of list) {

        var rated = '';
        for (i = 0; i < parseInt(item.vote_average / 2); ++i)
            rated += '&#9733';
        for (i = parseInt(item.vote_average / 2); i < 5; ++i)
            rated += '&#9734';
        rated += '(' + item.vote_count + ')';

        $('#list').append(`
            <div class="col-3 mb-3">
                <div class="card bg-dark text-light img-overlay">
                    <img src="https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}" class="card-img" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';">

                    <div class="card-img-overlay d-flex flex-column justify-content-end hide-text text-center">
                        <a class="a-color" href="#" onclick="movie_info(${item.id})">
                            <h4 class="card-title mb-0">${item.title}</h4>
                            <p class="card-text text-white-50 mb-2">${item.release_date}</p>
                            <p class="card-text text-warning">${rated}</p>
                        </a>
                    </div>
                </div>
            </div>
        `);
    }

    if (data.total_pages > 1) {
        $('#list').append(`
            <div class="col">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li id="prev" class="page-item">
                            <a class="page-link" href="#" search_movie="get_list('${name}', 1)">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `);

        var begin = (page < 6) ? 1 : page - 4;
        var end = (page < 6) ? 10 : page + 5;

        for (i = begin; i <= data.total_pages && i < end; ++i) {

            $('[class="pagination justify-content-center"]').append(`
                <li id="pg${i}" class="page-item">
                    <a class="page-link" href="#" onclick="search_movie('${name}', ${i})">${i}</a>
                </li>
            `);
        }

        $('[class="pagination justify-content-center"]').append(`
                    <li id="next" class="page-item">
                        <a class="page-link" href="#" onclick="search_movie('${name}', ${data.total_pages})">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
        `);

        let id = "#pg" + page;
        $(id).addClass('active');

        if (page == 1)
            $('#prev').addClass('disabled');
        if (page == data.total_pages)
            $('#next').addClass('disabled');
    }

    loading('#list', 0);
}

async function movie_info(movie_id) {

    $('#cat').empty();
    loading('#list', 1);

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${key}&language=en-US`);
    console.log(response);
    const item = await response.json();
    console.log(item);

    document.title = item.title;

    var genres = '';
    for (i = 0; i < item.genres.length; ++i) {
        genres += item.genres[i].name + ', ';
    }
    genres = genres.substr(0, genres.length - 2) + '.';

    const response2 = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${key}`);
    console.log(response2);
    const credits = await response2.json();
    console.log(credits);

    const response3 = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/reviews?api_key=${key}&language=en-US&page=1`);

    console.log(response3);
    const data = await response3.json();
    console.log(data);
    const review = data.results;

    var rated = '';
    for (i = 0; i < parseInt(item.vote_average / 2); ++i)
        rated += '&#9733';
    for (i = parseInt(item.vote_average / 2); i < 5; ++i)
        rated += '&#9734';
    rated += '(' + item.vote_count + ')';


    $('#list').empty();
    $('#cast').empty();
    $('#list').append(`
        <div class="card mb-3">
            <div class="row no-gutters">
                <div class="col-4">
                    <img src="https://image.tmdb.org/t/p/original${item.poster_path}" class="card-img" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';"></img>
                </div>
                <div class="col-8">
                    <div class="card-body">
                        <h3 class="card-title mb-0">${item.title}</h3>
                        <p class="card-text text-secondary mb-2">${item.release_date}</p>
                        <p class="card-text text-warning">${rated}</p>
                        <p class="card-text"><h5>Length: </h5>${item.runtime} min.</p>
                        <p class="card-text"><h5>Genres: </h5>${genres}</p>
                        <p class="card-text"><h5>Overview: </h5>${item.overview}</p>
                        <h5 class="card-text">Director: </h5>
                        <div id="dir" class="row"></div>
                    </div>
                </div>
                <div class="col-12">
                    <h4 class="card-text pl-5 pt-2 pb-2 bg-dark text-light">Cast:</h4>
                    <div id="cc" class="carousel card-carousel slide" data-ride="carousel" data-interval="false">
                        <ol class="carousel-indicators"></ol>
                        <div class="carousel-inner"></div>
                        <a class="carousel-control-prev" href="#cc" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next" href="#cc" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                </div>
                <div id="rw" class="col-12 mt-5">
                    <h4 class="pl-5 pr-5 pt-2 pb-2 bg-dark text-light">Review:</h4>
                </div>
            </div>
        </div>
    `);

    for (i = 0; i < credits.crew.length; ++i) {

        if (credits.crew[i].job == 'Director') {
            $('#dir').append(`
            <div class="col-2">
                <div class="card img-overlay bg-dark text-light">
                    <img class="card-img" src="https://image.tmdb.org/t/p/h632${credits.crew[i].profile_path}" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';">

                    <div class="card-img-overlay d-flex flex-column justify-content-end hide-text text-center">
                        <a class="a-color" href="#" onclick="cast_info(${credits.crew[i].id})">
                            <h5 class="card-title">${credits.crew[i].name}</h5>
                        </a>
                    </div>
                </div>
            </div>
        `);
        }
    }

    var indicator = parseInt(credits.cast.length / 5) + 1;
    for (i = 0; i < indicator; ++i) {
        $('[class="carousel-indicators"]').append(`
            <li data-target="#cc" data-slide-to="${i}"></li>
        `);
        $('[class="carousel-inner"]').append(`
            <div id="cc${i}" class="carousel-item">
                <div class="row justify-content-center"></div>
            </div>
        `);
        let n = Math.min(i * 5 + 5, credits.cast.length);
        for (j = i * 5; j < n; ++j) {
            $(`#cc${i}`).children().append(`
                <div class="col-2">
                    <div class="card img-overlay bg-dark text-light">
                        <img class="card-img" src="https://image.tmdb.org/t/p/h632${credits.cast[j].profile_path}" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';">
            
                        <div class="card-img-overlay d-flex flex-column justify-content-end hide-text text-center">
                            <a class="a-color" href="#" onclick="cast_info(${credits.cast[j].id})">
                                <h5 class="card-title mb-0">${credits.cast[j].name}</h5>
                                <p class="card-text text-secondary mb-2">${credits.cast[j].character}</p>
                            </a>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    $('[data-slide-to="0"]').addClass('active');
    $('#cc0').addClass('active');

    for (const x of review) {
        $('#rw').append(`
            <div class="p-3 ml-5 mr-5 mb-3 bg-light">
                <h5>${x.author}</h5>
                <p>${x.content}</p>
            </div>
        `);
    }

    loading('#list', 0);
}

async function search_cast(name) {

    $('#cat').empty();
    $('#cat').append(`
        <h2><i>Searching movies for: ${name}</i></h2>
    `);

    loading('#list', 1);

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${key}&language=en-US&query=${name}&page=1`);
    console.log(response);
    const data = await response.json();
    console.log(data);
    const list = data.results;

    if (list.length != 1) {
        $('#cat').append(`
            <h3><i>Star name not exist!</i></h3>
        `);
        $('#list').empty();
        loading('#list', 0);

        return;
    }

    const response2 = await fetch(`https://api.themoviedb.org/3/person/${list[0].id}/movie_credits?api_key=${key}&language=en-US`);
    console.log(response2);
    const credits = await response2.json();
    console.log(credits);

    $('#list').empty();
    for (i = 0; i < credits.cast.length; ++i) {
        let cid = 'cast' + i;
        var rated = '';
        for (j = 0; j < parseInt(credits.cast[i].vote_average / 2); ++j)
            rated += '&#9733';
        for (j = parseInt(credits.cast[i].vote_average / 2); j < 5; ++j)
            rated += '&#9734';
        rated += '(' + credits.cast[i].vote_count + ')';

        $('#list').append(`
            <div id=${cid} class="col-3 mb-1">
                <div class="card bg-dark text-light img-overlay">
                    <img src="https://image.tmdb.org/t/p/h632${credits.cast[i].poster_path}" class="card-img" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';">

                    <div class="card-img-overlay d-flex flex-column justify-content-end hide-text text-center">
                        <a class="a-color" href="#" onclick="movie_info(${credits.cast[i].id})">
                            <h3 class="card-title mb-0">${credits.cast[i].title}</h3>
                            <p class="card-text text-secondary mb-2">${credits.cast[i].release_date}</p>
                            <p class="card-text text-warning">${rated}</p>
                        </a>
                    </div>
                </div>
            </div>
        `);
    }

    loading('#list', 0);
}

async function cast_info(person_id) {

    $('#cat').empty();
    loading('#list', 1);

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`https://api.themoviedb.org/3/person/${person_id}?api_key=${key}&language=en-US`);
    console.log(response);
    const item = await response.json();
    console.log(item);

    document.title = item.name;

    const response2 = await fetch(`https://api.themoviedb.org/3/person/${person_id}/movie_credits?api_key=${key}&language=en-US`);
    console.log(response2);
    const credits = await response2.json();
    console.log(credits);

    $('#list').empty();
    $('#cast').empty();
    $('#list').append(`
        <div class="card mb-3">
            <div class="row no-gutters">
                <div class="col-4">
                    <img src="https://image.tmdb.org/t/p/original${item.profile_path}" class="card-img" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';"></img>
                </div>
                <div class="col-8">
                    <div class="card-body">
                        <h5 class="card-title mb-0">${item.name}</h5>
                        <p class="card-text text-secondary mt-0 mb-2"><small>${item.birthday}</small></p>
                        <p class="card-text"><h5>Biography: </h5>${item.biography}</p>
                        <p class="card-text"><h5>Cast in: </h5></p>
                        <div id="cast" class="row">
                    
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    for (i = 0; i < credits.cast.length; ++i) {
        let cid = 'cast' + i;
        $('#cast').append(`
            <div id=${cid} class="col-2 mb-1">
                <div class="card bg-dark text-light img-overlay">
                    <img src="https://image.tmdb.org/t/p/w185${credits.cast[i].poster_path}" class="card-img" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';">

                    <div class="card-img-overlay d-flex flex-column justify-content-end hide-text text-center">
                        <a class="a-color" href="#" onclick="movie_info(${credits.cast[i].id})">
                            <h5 class="card-title">${credits.cast[i].title}</h5>
                            <p class="card-text"><small>${credits.cast[i].release_date}</small></p>
                        </a>
                    </div>
                </div>
            </div>
        `);
    }

    loading('#list', 0);
}