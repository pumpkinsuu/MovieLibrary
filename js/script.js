function hiding(id) {

    $(id).hide();
    $('#loading').show();
}

function showing(id) {

    $(id).show();
    $('#loading').hide();
}

function loaded(img, src) {

    let dl = new Image();
    dl.onload = () => {

        img.onload = null;
        img.src = dl.src;
    };
    dl.onerror = () => {

        img.onload = null;
        img.src = 'img/No_picture_available.png';
    };
    dl.src = src;
}

async function get_list(type, page, cb) {

    $('#cat').empty();
    $('#cat').append(`
        <button class="btn btn-outline-light text-3d" onclick="get_list('popular', 1, showing)">
            <h1>Popular</h1>
        </button>
        <button class="btn btn-outline-light text-3d ml-2 mr-2" onclick="get_list('now_playing', 1, showing)">
            <h1>Now Playing</h1>
        </button>
        <button class="btn btn-outline-light text-3d" onclick="get_list('top_rated', 1, showing)">
            <h1>Top Rated</h1>
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

    hiding('mid');
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/movie/${type}?api_key=${key}&page=${page}
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb('mid');
        return;
    }

    const data = await response.json();
    const list = data.results;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>No movies.</i></h3>
        `);
        cb('mid');
        return;
    }

    let k = 0;
    for (const item of list) {

        if (k % 5 == 0) {
            $('#list').append(`
                <div id="row${parseInt(k / 5)}" class="row justify-content-center w-100"></div>
            `);
        }

        let date = 'Unknown';
        if (item.release_date) {
            date = new Date(item.release_date).toLocaleString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        let rated = '';
        let n = Math.round(item.vote_average / 2)
        for (i = 0; i < n; ++i)
            rated += '&#9733';
        for (i = n; i < 5; ++i)
            rated += '&#9734';
        rated += '(' + item.vote_count + ')';

        $(`#row${parseInt(k / 5)}`).append(`
            <div class="col-2 mb-4">
                <div class="card sd border-dark cur-select hl h-100" onclick="movie_info(${item.id}, showing)">
                    <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w300_and_h450_bestv2${item.poster_path}')">
                    
                    <div class="card-img-overlay d-flex flex-column justify-content-end">
                        <a class="a-img text-center" href="#">
                            <h5 class="card-title mb-0">${item.title}</h5>
                            <p class="card-text text-white-50 mb-1">${date}</p>
                            <p class="card-text text-warning">${rated}</p>
                        </a>
                    </div>
                </div>
            </div>
        `);
        ++k;
    }

    if (data.total_pages > 1) {
        $('#list').append(`
            <div class="col-12">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li id="prev" class="page-item" data-toggle="tooltip" title="Page 1">
                            <a class="page-link" href="#" onclick="get_list('${type}', 1, showing)">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `);

        let begin = (page < 6) ? 1 : page - 4;
        let end = (page < 6) ? 10 : page + 5;

        for (i = begin; i <= data.total_pages && i < end; ++i) {
            $('[class="pagination justify-content-center"]').append(`
                <li id="pg${i}" class="page-item">
                    <a class="page-link" href="#" onclick="get_list('${type}', ${i}, showing)">${i}</a>
                </li>
            `);
        }

        $('[class="pagination justify-content-center"]').append(`
            <li id="next" class="page-item" data-toggle="tooltip" title="Page ${data.total_pages}">
                <a class="page-link" href="#" onclick="get_list('${type}', ${data.total_pages}, showing)">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `);

        $(`#pg${page}`).addClass('active');

        if (page == 1)
            $('#prev').addClass('disabled');
        if (page == data.total_pages)
            $('#next').addClass('disabled');
    }

    cb('mid');
}

function search_input() {

    if (!$('#search').val())
        return;

    if ($('select').val() == 'movie') {
        document.title = 'Search movies by title';
        search_movie($('#search').val(), 1, showing);
    } else {
        document.title = 'Searching movies by cast';
        search_cast($('#search').val(), 1, showing);
    }
}

async function search_movie(name, page, cb) {

    $('#cat').empty();
    $('#cat').append(`
        <h2><i>Searching for: '${name}'</i></h2>
    `);

    hiding('list');
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${name}&page=${page}
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb('list');
        return;
    }

    const data = await response.json();
    const list = data.results;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>There are no results that match your search.</i></h3>
        `);
        cb('list');
        return;
    }

    if (list.length == '1') {
        movie_info(list[0].id, 1, showing);
        return;
    }

    let k = 0;
    for (const item of list) {

        if (k % 5 == 0) {
            $('#list').append(`
                <div id="row${parseInt(k / 5)}" class="row justify-content-center w-100"></div>
            `);
        }

        let date = 'Unknown';
        if (item.release_date) {
            date = new Date(item.release_date).toLocaleString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        let rated = '';
        let n = Math.round(item.vote_average / 2)
        for (i = 0; i < n; ++i)
            rated += '&#9733';
        for (i = n; i < 5; ++i)
            rated += '&#9734';
        rated += '(' + item.vote_count + ')';

        $(`#row${parseInt(k / 5)}`).append(`
            <div class="col-2 mb-4">
                <div class="card sd border-dark cur-select hl h-100" onclick="movie_info(${item.id}, showing)">
                    <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w300_and_h450_bestv2${item.poster_path}')">
                    
                    <div class="card-img-overlay d-flex flex-column justify-content-end">
                        <a class="a-img text-center" href="#">
                            <h5 class="card-title mb-0">${item.title}</h5>
                            <p class="card-text text-white-50 mb-1">${date}</p>
                            <p class="card-text text-warning">${rated}</p>
                        </a>
                    </div>
                </div>
            </div>
        `);
        ++k;
    }

    if (data.total_pages > 1) {
        $('#list').append(`
            <div class="col-12">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li id="prev" class="page-item" data-toggle="tooltip" title="Page 1">
                            <a class="page-link" href="#" onclick="search_movie('${name}', 1, showing)">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `);

        let begin = (page < 6) ? 1 : page - 4;
        let end = (page < 6) ? 10 : page + 5;

        for (i = begin; i <= data.total_pages && i < end; ++i) {
            $('[class="pagination justify-content-center"]').append(`
                <li id="pg${i}" class="page-item">
                    <a class="page-link" href="#" onclick="search_movie('${name}', ${i}, showing)">${i}</a>
                </li>
            `);
        }

        $('[class="pagination justify-content-center"]').append(`
            <li id="next" class="page-item" data-toggle="tooltip" title="Page ${data.total_pages}">
                <a class="page-link" href="#" onclick="search_movie('${name}', ${data.total_pages}, showing)">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `);

        $(`#pg${page}`).addClass('active');

        if (page == 1)
            $('#prev').addClass('disabled');
        if (page == data.total_pages)
            $('#next').addClass('disabled');
    }

    cb('list');
}

async function movie_info(movie_id, cb) {

    $('#cat').empty();
    hiding('list');
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${key}&language=en-US&append_to_response=credits`);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb('list');
        return;
    }

    const item = await response.json();
    const credits = item.credits;
    document.title = item.title;

    let date = '';
    if (item.release_date) {
        date = new Date(item.release_date).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    let rated = '';
    let n = Math.round(item.vote_average / 2)
    for (i = 0; i < n; ++i)
        rated += '&#9733';
    for (i = n; i < 5; ++i)
        rated += '&#9734';
    rated += '(' + item.vote_count + ')';

    let genres = '';
    for (i = 0; i < item.genres.length; ++i) {
        genres += item.genres[i].name + ', ';
    }

    if (genres == '')
        genres = 'Unknown';
    else
        genres = genres.substr(0, genres.length - 2);

    let length = 'Unknown';
    if (item.runtime)
        length = item.runtime + ' min';

    let ov = (item.overview) ? item.overview : 'Unknown.';

    $('#list').append(`
        <div class="card sd border-dark bg-tran-1 mb-3 w-100">
            <div class="row">
                <div class="col-4">
                    <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}')">
                </div>
                <div class="col-8">
                    <div class="card-body">
                        <h3 class="card-title text-success mb-0">${item.title}</h3>
                        <p class="card-text text-white-50 mb-1">${date}</p>
                        <p class="card-text text-warning">${rated}</p>
                        <p class="card-text"><strong class="text-info">Length: </strong>${length}</p>
                        <p class="card-text"><strong class="text-info">Genres: </strong>${genres}</p>
                        <p class="card-text mb-0"><strong class="text-info">Overview: </strong></p>
                        <p class="card-text">${ov}</p>
                        <p class="card-text"><strong class="text-info">Director: </strong></p>
                        <div id="dir" class="row no-gutters"></div>
                    </div>
                </div>
                <div class="col-12">
                    <h4 class="card-text mt-0 mb-0 pl-5 pt-2 pb-2 text-info bg-tran-2">Cast:</h4>
                    <div id="cc" class="carousel card-carousel slide" data-ride="carousel" data-interval="false">
                        
                    </div>
                </div>
                <div class="col-12 mt-5">
                    <h4 class="pl-5 pt-2 pb-2 text-info bg-tran-2">Review:</h4>
                    <div id="rw"></div>
                </div>
            </div>
        </div>
    `);

    if (!credits.crew.length)
        $('#dir').append('<p class="card-text">Unknown</p>');
    else {
        for (const x of credits.crew) {

            if (x.job == 'Director') {
                $('#dir').append(`
                    <div class="col-2">
                        <div class="card sd bg-dark cur-select hl h-100" onclick="cast_info(${x.id}, showing)">
                            <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w300_and_h450_bestv2${x.profile_path}')">
    
                            <div class="card-img-overlay d-flex flex-column justify-content-end">
                                <a class="a-img text-center" href="#">
                                    <h5 class="card-title">${x.name}</h5>
                                </a>
                            </div>
                        </div>
                    </div>
                `);
            }
        }
    }

    if (!credits.cast.length) {
        $('#cc').empty();
        $('#cc').append('<p class="card-text ml-5">Unknown</p>');
    } else {
        $('#cc').append(`
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
        `);

        let indicator = Math.ceil(credits.cast.length / 5);
        for (i = 0; i < indicator; ++i) {
            $('[class="carousel-indicators"]').append(`
                <li data-target="#cc" data-slide-to="${i}"></li>
            `);
            $('[class="carousel-inner"]').append(`
                <div id="cc${i}" class="carousel-item">
                    <div class="row no-gutters justify-content-center"></div>
                </div>
            `);
            let n = Math.min(i * 5 + 5, credits.cast.length);
            for (j = i * 5; j < n; ++j) {

                let char = 'Unknown';
                if (credits.cast[j].character != '')
                    char = credits.cast[j].character;

                $(`#cc${i}`).children().append(`
                    <div class="col-2">
                        <div class="card sd bg-dark cur-select hl h-100" onclick="cast_info(${credits.cast[j].id}, showing)">
                            <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w300_and_h450_bestv2${credits.cast[j].profile_path}')">
                
                            <div class="card-img-overlay d-flex flex-column justify-content-end">
                                <a class="a-img text-center" href="#">
                                    <h5 class="card-title mb-0">${credits.cast[j].name}</h5>
                                    <p class="card-text text-warning mb-2"><small class="text-white-50">as</small> ${char}</p>
                                </a>
                            </div>
                        </div>
                    </div>
                `);
            }
        }

        $('[data-slide-to="0"]').addClass('active');
        $('#cc0').addClass('active');
    }

    get_review(movie_id, 1, showing);

    cb('list');
}

async function get_review(movie_id, page, cb) {

    hiding('rw');
    $('#rw').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/movie/${movie_id}/reviews?api_key=${key}&language=en-US&page=${page}
    `);

    if (response.status != 200) {
        $('#rw').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb('rw');
        return;
    }

    const data = await response.json();
    const list = data.results;

    if (!list.length) {
        $('#rw').append(`
            <div class="p-3 ml-5 mr-5 mb-3 bg-tran-1 text-center">
                <h5>No user reviews.</h5>
            </div>
        `);
        cb('rw');
        return;
    }

    if (list.length > 2) {
        $('#rw').addClass('scroll');
    }

    for (const item of list) {
        $('#rw').append(`
            <div class="p-3 ml-5 mb-3 bg-tran-1 m-s">
                <h5 class="text-danger">${item.author}</h5>
                <p>${item.content}</p>
            </div>
        `);
    }

    if (data.total_pages > 1) {
        $('#list').append(`
            <div class="col-12">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li id="prev" class="page-item" data-toggle="tooltip" title="Page 1">
                            <a class="page-link" href="#" onclick="get_review(${movie_id}, 1, showing)">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `);

        let begin = (page < 6) ? 1 : page - 4;
        let end = (page < 6) ? 10 : page + 5;

        for (i = begin; i <= data.total_pages && i < end; ++i) {
            $('[class="pagination justify-content-center"]').append(`
                <li id="pg${i}" class="page-item">
                    <a class="page-link" href="#" onclick="get_review(${movie_id}, ${i}, showing)">${i}</a>
                </li>
            `);
        }

        $('[class="pagination justify-content-center"]').append(`
            <li id="next" class="page-item" data-toggle="tooltip" title="Page ${data.total_pages}">
                <a class="page-link" href="#" onclick="get_review(${movie_id}, ${data.total_pages}, showing)">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `);

        $(`#pg${page}`).addClass('active');

        if (page == 1)
            $('#prev').addClass('disabled');
        if (page == data.total_pages)
            $('#next').addClass('disabled');
    }

    cb('rw');
}

async function search_cast(name, page, cb) {

    $('#cat').empty();
    $('#cat').append(`
        <h2><i>Searching for: '${name}'</i></h2>
    `);

    hiding('list');
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/search/person?api_key=${key}&language=en-US&query=${name}&page=${page}
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb('list');
        return;
    }

    const data = await response.json();
    const list = data.results;
    if (!list.length) {
        $('#cat').append(`
            <h3><i>There are no results that match your search.</i></h3>
        `);
        cb('list');
        return;
    }

    if (list.length == 1) {
        cast_movie(list[0].name, list[0].id, 1, showing);
        return;
    }

    for (const item of list) {

        let films = '';
        for (const x of item.known_for) {
            films += (x.original_title) ? x.original_title : x.original_name;
            films += ', ';
        }

        if (films == '')
            films = 'Nothing.'
        else
            films = films.substr(0, films.length - 2) + '.';

        $('#list').append(`
            <div class="card sd border-dark bg-tran-1 cur-select hl w-50" onclick="cast_movie('${item.name}', ${item.id}, 1, showing)">
                <div class="row">
                    <div class="col-2">
                        <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w185_and_h278_bestv2${item.profile_path}')">
                    </div>
                    <div class="col-10">
                        <div class="card-body">
                            <a class="a-img" href="#">
                                <h4 class="card-title">${item.name}</h4>
                            </a>
                            <p class="card-text text-truncate"><strong class="text-info">Known for: </strong>${films}</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    if (data.total_pages > 1) {
        $('#list').append(`
            <div class="col-12 mt-5">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li id="prev" class="page-item" data-toggle="tooltip" title="Page 1">
                            <a class="page-link" href="#" onclick="search_cast('${name}', 1, showing)">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `);

        let begin = (page < 6) ? 1 : page - 4;
        let end = (page < 6) ? 10 : page + 5;

        for (i = begin; i <= data.total_pages && i < end; ++i) {
            $('[class="pagination justify-content-center"]').append(`
                <li id="pg${i}" class="page-item">
                    <a class="page-link" href="#" onclick="search_cast('${name}', ${i}, showing)">${i}</a>
                </li>
            `);
        }

        $('[class="pagination justify-content-center"]').append(`
            <li id="next" class="page-item" data-toggle="tooltip" title="Page ${data.total_pages}">
                <a class="page-link" href="#" onclick="search_cast('${name}', ${data.total_pages}, showing)">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `);

        $(`#pg${page}`).addClass('active');

        if (page == 1)
            $('#prev').addClass('disabled');
        if (page == data.total_pages)
            $('#next').addClass('disabled');
    }

    cb('list');
}

async function cast_movie(name, person_id, page, cb) {

    $('#cat').empty();
    $('#cat').append(`
        <h2><i>'${name}' movies:</i></h2>
    `);

    hiding('list');
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/person/${person_id}/movie_credits?api_key=${key}&language=en-US
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb('list');
        return;
    }

    const data = await response.json();
    const list = (data.cast.length) ? data.cast : data.crew;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>There are no results that match your search.</i></h3>
        `);
        cb('list');
        return;
    }

    if (list.length == '1') {
        movie_info(list[0].id, showing);
        return;
    }

    let l = (page - 1) * 20;

    for (k = l; k < list.length && k < l + 20; ++k) {

        if (k % 5 == 0) {
            $('#list').append(`
            <div id="row${parseInt(k / 5)}" class="row justify-content-center w-100"></div>
        `);
        }

        let date = '';
        if (list[k].release_date) {
            date = new Date(list[k].release_date).toLocaleString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        let rated = '';
        let n = Math.round(list[k].vote_average / 2)
        for (i = 0; i < n; ++i)
            rated += '&#9733';
        for (i = n; i < 5; ++i)
            rated += '&#9734';
        rated += '(' + list[k].vote_count + ')';

        $(`#row${parseInt(k / 5)}`).append(`
        <div class="col-2 mb-4">
            <div class="card sd border-dark cur-select hl h-100" onclick="movie_info(${list[k].id}, showing)">
                <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w300_and_h450_bestv2${list[k].poster_path}')">
                
                <div class="card-img-overlay d-flex flex-column justify-content-end">
                    <a class="a-img text-center" href="#">
                        <h4 class="card-title mb-0">${list[k].title}</h4>
                        <p class="card-text text-white-50 mb-1">${date}</p>
                        <p class="card-text text-warning">${rated}</p>
                    </a>
                </div>
            </div>
        </div>
    `);
    }

    if (list.length > 20) {
        $('#list').append(`
            <div class="col-12">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li id="prev" class="page-item" data-toggle="tooltip" title="Page 1">
                            <a class="page-link" href="#" onclick="cast_movie('${name}', ${person_id}, 1, showing)">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `);

        let begin = (page < 6) ? 1 : page - 4;
        let end = (page < 6) ? 10 : page + 5;
        let l = parseInt(list.length / 20) + 1;

        for (i = begin; i <= l && i < end; ++i) {
            $('[class="pagination justify-content-center"]').append(`
                <li id="pg${i}" class="page-item">
                    <a class="page-link" href="#" onclick="cast_movie('${name}', ${person_id}, ${i}, showing)">${i}</a>
                </li>
            `);
        }

        $('[class="pagination justify-content-center"]').append(`
            <li id="next" class="page-item" data-toggle="tooltip" title="Page ${l}">
                <a class="page-link" href="#" onclick="cast_movie('${name}', ${person_id}, ${l}, showing)">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `);

        $(`#pg${page}`).addClass('active');

        if (page == 1)
            $('#prev').addClass('disabled');
        if (page == l)
            $('#next').addClass('disabled');
    }

    cb('list');
}

async function cast_info(person_id, cb) {

    $('#cat').empty();
    hiding('list');
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/person/${person_id}?api_key=${key}&language=en-US&append_to_response=movie_credits
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb('list');
        return;
    }

    const item = await response.json();
    const credits = (item.movie_credits.cast.length) ? item.movie_credits.cast : item.movie_credits.crew;

    document.title = item.name;

    let date = '';
    if (item.birthday) {
        date = new Date(item.birthday).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    let bio = (item.biography) ? item.biography : 'Unknown.';

    $('#list').append(`
        <div class="card sd border-dark bg-tran-1 mb-3 w-100">
            <div class="row no-gutters">
                <div class="col-4">
                    <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.profile_path}')">
                </div>
                <div class="col-8">
                    <div class="card-body">
                        <h3 class="card-title text-success mb-0">${item.name}</h3>
                        <p class="card-text text-white-50 ">${date}</p>
                        <h5 class="card-text text-info">Biography: </h5>
                        <p class="card-text">${bio}</p>
                        <h5 class="card-text text-info">Known for: </h5>
                        <div id="ml" class="scroll mt-3"></div>
                    </div>
                </div>
            </div>
        </div>
    `);

    if (!credits.length) {
        $('#ml').empty();
        $('#ml').append('<p class="card-text ml-5">Nothing.</p>');
    } else {

        for (const item of credits) {

            let date = '';
            if (item.release_date) {
                date = new Date(item.release_date).toLocaleString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            var rated = '';
            for (k = 0; k < parseInt(item.vote_average / 2); ++k)
                rated += '&#9733';
            for (k = parseInt(item.vote_average / 2); k < 5; ++k)
                rated += '&#9734';
            rated += '(' + item.vote_count + ')';

            let as = (item.character) ? item.character : item.job;
            if (!as)
                as = 'Unknown';

            let ov = (item.overview) ? item.overview : 'Unknown.';

            $('#ml').append(`
                <div class="card sd border-dark bg-tran-1 m-s">
                    <div class="row">
                        <div class="col-2 cur-select" onclick="movie_info(${item.id}, showing)">
                            <img class="card-img" src="img/loading.gif" alt="Poster" onload="loaded(this, 'https://image.tmdb.org/t/p/w185_and_h278_bestv2${item.poster_path}')">
                        </div>
                        <div class="col-4">
                            <div class="card-body">
                                <a class="a-img" href="#" onclick="movie_info(${item.id}, showing)">
                                    <h5 class="card-title mb-0">${item.title}</h5>
                                </a>
                                <p class="card-text text-white-50 mb-1">${date}</p>
                                <p class="card-text text-warning">${rated}</p>
                                <p class="card-text text-danger"><small class="text-white-50">as </small>${as}</p>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card-body">
                                <h5 class="card-text text-info">Overview: </h5>
                                <p class="card-text text-truncate">${ov}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    cb('list');
}