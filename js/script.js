function hiding() {

    $('#list').hide();
    $('#loading').show();
}

function showing() {

    $('#list').show();
    $('#loading').hide();
}

async function get_list(type, page, cb) {

    $('#cat').empty();
    $('#cat').append(`
        <button class="btn btn-outline-light" onclick="get_list('popular', 1, showing)">
            <h2>Popular</h2>
        </button>
        <button class="btn btn-outline-light ml-2 mr-2" onclick="get_list('now_playing', 1, showing)">
            <h2>Now Playing</h2>
        </button>
        <button class="btn btn-outline-light" onclick="get_list('top_rated', 1, showing)">
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

    hiding();
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/movie/${type}?api_key=${key}&page=${page}
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb();
        return;
    }

    const data = await response.json();
    const list = data.results;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>No movies.</i></h3>
        `);
        cb();
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

        let img = new Image();
        img.src = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${item.poster_path}`;

        $(`#row${parseInt(k / 5)}`).append(`
            <div class="col-2 mb-4">
                <div class="card shadow border-dark cur-select hl h-100" onclick="movie_info(${item.id}, showing)">
                    <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_picture_available.png'">
                    
                    <div class="card-img-overlay d-flex flex-column justify-content-end">
                        <a class="a-img text-center" href="#">
                            <h5 class="card-title mb-0">${item.title}</h5>
                            <p class="card-text text-light mb-1">${date}</p>
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

    cb();
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

    hiding();
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${name}&page=${page}
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb();
        return;
    }

    const data = await response.json();
    const list = data.results;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>There are no results that match your search.</i></h3>
        `);
        cb();
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

        let img = new Image();
        img.src = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${item.poster_path}`;

        $(`#row${parseInt(k / 5)}`).append(`
            <div class="col-2 mb-4">
                <div class="card shadow border-dark cur-select hl h-100" onclick="movie_info(${item.id}, showing)">
                    <img class="card-img" src=${img.src} alt="Poster">
                    
                    <div class="card-img-overlay d-flex flex-column justify-content-end">
                        <a class="a-img text-center" href="#">
                            <h5 class="card-title mb-0">${item.title}</h5>
                            <p class="card-text text-light mb-1">${date}</p>
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

    cb();
}

async function movie_info(movie_id, cb) {

    $('#cat').empty();
    hiding();
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${key}&language=en-US&append_to_response=credits,reviews`);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb();
        return;
    }

    const item = await response.json();
    const credits = item.credits;
    const reviews = item.reviews.results;

    document.title = item.title;

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

    let img = new Image();
    img.src = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}`;

    $('#list').append(`
        <div class="card shadow border-dark bg-tran-1 mb-3 w-100">
            <div class="row">
                <div class="col-4">
                    <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_picture_available.png'">
                </div>
                <div class="col-8">
                    <div class="card-body">
                        <h3 class="card-title text-success mb-0">${item.title}</h3>
                        <p class="card-text text-secondary mb-1">${date}</p>
                        <p class="card-text text-danger">${rated}</p>
                        <p class="card-text"><strong>Length: </strong>${length}</p>
                        <p class="card-text"><strong>Genres: </strong>${genres}</p>
                        <p class="card-text mb-0"><strong>Overview: </strong></p>
                        <p class="card-text">${item.overview}</p>
                        <p class="card-text"><strong>Director: </strong></p>
                        <div id="dir" class="row no-gutters"></div>
                    </div>
                </div>
                <div class="col-12">
                    <h4 class="card-text mt-0 mb-0 pl-5 pt-2 text-light bg-tran-2">Cast:</h4>
                    <div id="cc" class="carousel card-carousel slide" data-ride="carousel" data-interval="false">
                        
                    </div>
                </div>
                <div id="rw" class="col-12 mt-5">
                    <h4 class="pl-5 pt-2 pb-2 text-light bg-tran-2">Review:</h4>
                </div>
            </div>
        </div>
    `);

    if (!credits.crew.length)
        $('#dir').append('<p class="card-text">Unknown</p>');
    else {
        for (const x of credits.crew) {

            let img = new Image();
            img.src = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${x.profile_path}`;

            if (x.job == 'Director') {
                $('#dir').append(`
                    <div class="col-2">
                        <div class="card bg-dark cur-select hl h-100">
                            <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_profile_available.png'">
    
                            <div class="card-img-overlay d-flex flex-column justify-content-end">
                                <a class="a-img text-center" href="#">
                                    <h5 class="card-title text-warning">${x.name}</h5>
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

                let img = new Image();
                img.src = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${credits.cast[j].profile_path}`;

                $(`#cc${i}`).children().append(`
                    <div class="col-2">
                        <div class="card bg-dark cur-select hl h-100" onclick="cast_info(${credits.cast[j].id}, showing)">
                            <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_profile_available.png'">
                
                            <div class="card-img-overlay d-flex flex-column justify-content-end">
                                <a class="a-img text-center" href="#">
                                    <h5 class="card-title text-warning mb-0">${credits.cast[j].name}</h5>
                                    <p class="card-text text-light mb-2">as ${char}</p>
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

    if (!reviews.length) {
        $('#rw').append(`
            <div class="p-3 ml-5 mr-5 mb-3 bg-tran-1">
                <h5>No user reviews.</h5>
            </div>
        `);
    } else {
        for (const x of reviews) {
            $('#rw').append(`
                <div class="p-3 ml-5 mr-5 mb-3 bg-tran-1">
                    <h5>${x.author}</h5>
                    <p>${x.content}</p>
                </div>
            `);
        }
    }

    cb();
}

async function search_cast(name, page, cb) {

    $('#cat').empty();
    $('#cat').append(`
        <h2><i>Searching for: '${name}'</i></h2>
    `);

    hiding();
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/search/person?api_key=${key}&language=en-US&query=${name}&page=${page}
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb();
        return;
    }

    const data = await response.json();
    const list = data.results;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>There are no results that match your search.</i></h3>
        `);
        cb();
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
            films = 'nothing.'
        else
            films = films.substr(0, films.length - 2) + '.';

        let img = new Image();
        img.src = `https://image.tmdb.org/t/p/w185_and_h278_bestv2${item.profile_path}`;

        $('#list').append(`
            <div class="card shadow border-dark bg-tran-1 cur-select hl w-50" onclick="cast_movie('${item.name}', ${item.id}, 1, showing)">
                <div class="row">
                    <div class="col-2">
                        <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_profile_available.png'">
                    </div>
                    <div class="col-10">
                        <div class="card-body">
                            <a class="a-img" href="#">
                                <h4 class="card-title">${item.name}</h4>
                            </a>
                            <p class="card-text text-truncate"><strong>Known for: </strong>${films}</p>
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

    cb();
}

async function cast_movie(name, person_id, page, cb) {

    $('#cat').empty();
    $('#cat').append(`
        <h2><i>'${name}' movies:</i></h2>
    `);

    hiding();
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/person/${person_id}/movie_credits?api_key=${key}&language=en-US
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb();
        return;
    }

    const data = await response.json();
    const list = data.cast;

    if (!list.length) {
        $('#cat').append(`
            <h3><i>There are no results that match your search.</i></h3>
        `);
        cb();
        return;
    }

    if (list.length == '1') {
        movie_info(list[0].id, showing);
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

        let img = new Image();
        img.src = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${item.poster_path}`;

        $(`#row${parseInt(k / 5)}`).append(`
            <div class="col-2 mb-4">
                <div class="card shadow border-dark cur-select hl h-100" onclick="movie_info(${item.id}, showing)">
                    <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_picture_available.png'">
                    
                    <div class="card-img-overlay d-flex flex-column justify-content-end">
                        <a class="a-img text-center" href="#">
                            <h4 class="card-title mb-0">${item.title}</h4>
                            <p class="card-text text-light mb-1">${date}</p>
                            <p class="card-text text-warning">${rated}</p>
                        </a>
                    </div>
                </div>
            </div>
        `);
        ++k;
    }

    cb();
}

async function cast_info(person_id, cb) {

    $('#cat').empty();
    hiding();
    $('#list').empty();

    const key = 'c35160a326e0344de330c917e176e250';
    const response = await fetch(`
        https://api.themoviedb.org/3/person/${person_id}?api_key=${key}&language=en-US&append_to_response=movie_credits
    `);

    if (response.status != 200) {
        $('#cat').append(`
            <h3><i>${response.status}</i></h3>
        `);
        cb();
        return;
    }

    const item = await response.json();
    const credits = item.movie_credits.cast;

    document.title = item.name;

    let date = 'Unknown';
    if (item.birthday) {
        date = new Date(item.birthday).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    let img = new Image();
    img.src = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.profile_path}`;

    $('#list').append(`
        <div class="card shadow border-dark bg-tran-1 mb-3 w-100">
            <div class="row no-gutters">
                <div class="col-4">
                    <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_profile_available.png'">
                </div>
                <div class="col-8">
                    <div class="card-body">
                        <h3 class="card-title text-success mb-0">${item.name}</h3>
                        <p class="card-text text-secondary ">${date}</p>
                        <p class="card-text"><h5>Biography: </h5>${item.biography}</p>
                        <p class="card-text"><h5>Known for: </h5></p>
                        <div id="cc" class="carousel card-carousel slide mt-5" data-ride="carousel" data-interval="false">
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
                </div>
            </div>
        </div>
    `);

    if (!credits.length) {
        $('#cc').empty();
        $('#cc').append('<p class="card-text ml-5">Unknown</p>');
    } else {
        var indicator = Math.ceil(credits.length / 2);
        for (i = 0; i < indicator; ++i) {
            $('[class="carousel-inner"]').append(`
                <div id="cc${i}" class="carousel-item">
                    <div class="row"></div>
                </div>
            `);
            let n = Math.min(i * 2 + 2, credits.length);
            for (j = i * 2; j < n; ++j) {

                let date = 'Unknown';
                if (credits[j].release_date) {
                    date = new Date(credits[j].release_date).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }

                var rated = '';
                for (k = 0; k < parseInt(credits[j].vote_average / 2); ++k)
                    rated += '&#9733';
                for (k = parseInt(credits[j].vote_average / 2); k < 5; ++k)
                    rated += '&#9734';
                rated += '(' + credits[j].vote_count + ')';

                let as = (credits[j].character) ? credits[j].character : credits[j].job;
                if (!as)
                    as = 'Unknown';

                let img = new Image();
                img.src = `https://image.tmdb.org/t/p/w185_and_h278_bestv2${credits[j].poster_path}`;

                $(`#cc${i}`).children().append(`
                    <div class="card border-dark bg-tran-1 w-100 ml-5 mr-5">
                        <div class="row justify-content-center">
                            <div class="col-2 cur-select" onclick="movie_info(${credits[j].id}, showing)">
                                <img class="card-img" src=${img.src} alt="Poster" onerror="this.src='img/No_picture_available.png'">
                            </div>
                            <div class="col-4">
                                <div class="card-body">
                                    <a class="a-img" href="#" onclick="movie_info(${credits[j].id}, showing)">
                                        <h5 class="card-title mb-0">${credits[j].title}</h5>
                                    </a>
                                    <p class="card-text text-secondary mb-1">${date}</p>
                                    <p class="card-text text-danger">${rated}</p>
                                    <p class="card-text"><strong>As: </strong>${as}</p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="card-body">
                                    <h5 class="card-text">Overview: </h5>
                                    <p class="card-text text-truncate">${credits[j].overview}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            }
        }

        $('[data-slide-to="0"]').addClass('active');
        $('#cc0').addClass('active');
    }

    cb();
}