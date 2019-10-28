function loading(id, type) {
    if (type) {
        $(id).hide();
        $('#loading').show();
    } else {
        $(id).show();
        $('#loading').hide();
    }
}

async function load_home(type, page) {

    $('#cat').find('.active').removeClass('active');

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
    const response = await fetch(`http://api.themoviedb.org/3/movie/${type}?api_key=${key}&page=${page}`);
    console.log(response);
    const data = await response.json();
    console.log(data);
    const list = data.results;

    if (!list.length)
        return;

    $('#list').empty();
    for (const item of list) {
        $('#list').append(`
            <div class="col-3 mb-3">
                <div class="card bg-dark text-light img-overlay">
                    <img src="https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}" class="card-img" alt="Poster" onerror="if (this.src != 'img/No_picture_available.png') this.src = 'img/No_picture_available.png';">

                    <div class="card-img-overlay d-flex flex-column justify-content-end hide-text text-center">
                        <a class="a-color" href="movie.html?id=${item.id}">
                            <h5 class="card-title">${item.title}</h5>
                            <p class="card-text">${item.release_date}</p>
                            <p class="card-text">Rating: ${item.vote_average}(${item.vote_count})</p>
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
                            <a class="page-link" href="#" onclick="get_list('${type}', ${page - 1})">
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
                        <a class="page-link" href="#" onclick="get_list('${type}', ${page + 1})">
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