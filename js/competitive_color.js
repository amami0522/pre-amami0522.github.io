//参考 : https://algon-320.hatenablog.com/entry/2019/04/06/011234

(function () {
    class User {
        constructor(service, handle) {
            this.service = service;
            this.handle = handle;
            this.rating = 0;
            this.color = '#000';  //デフォルトの色
        }
    }
    class Service {
        constructor(name, url) {
            this.name = name;
            this.url = url;
        }
    }

    let atcoder = new Service('atcoder', 'https://atcoder.jp/user/');
    let codeforces = new Service('codeforces', 'http://codeforces.com/profile/');
    let topcoder_algorithm = new Service('topcoder_algorithm', 'https://www.topcoder.com/members/');

    let atcoder_user = new User(atcoder, 'mitsui321');
    let codeforces_user = new User(codeforces, 'amami0522');
    let topcoder_algorithm_user = new User(topcoder_algorithm, 'amami0522');

    let accounts = [atcoder_user, codeforces_user, topcoder_algorithm_user];

    //ユーザーページへのリンクのみ
    function set_html_without_rating(user) {
        let a = document.getElementById(user.service.name + '_rating');
        a.href = user.service.url + user.handle;
        a.innerHTML = user.handle;
        a.setAttribute('style', 'text-decoration:none;font-weight:bold;color:' + user.color);
    }

    //ユーザーページへのリンク + レーティング表示 + 色
    function set_html(user) {
        let a = document.getElementById(user.service.name + '_rating');
        a.href = user.service.url + user.handle;
        a.innerHTML = user.handle + ' (' + user.rating.toString() + ')';
        a.setAttribute('style', 'text-decoration:none;font-weight:bold;color:' + user.color);
    }

    function fetch_ratings() {
        let query_str = '';
        accounts.forEach(user => {
            query_str += user.service.name + "=" + user.handle + '&';
        });

        function error() {
            accounts.forEach(user => set_html_without_rating(user));
        }

        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://kyopro-ratings.herokuapp.com/json?' + query_str, true);
        xhr.onload = function(e) {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    json = JSON.parse(xhr.responseText);
                    if('error' in json) {
                        error();
                    }
                    else {
                        accounts.forEach(user => {
                            let service_name = user.service.name;
                            if(json[service_name]['status'] == 'success') {
                                user.rating = json[service_name]['rating'];
                                user.color = json[service_name]['color'];
                                set_html(user);
                            }
                            else {
                                set_html_without_rating(user);
                            }
                        });
                    }
                }
            }
        };
        xhr.onerror = function(e) { error(); };
        xhr.ontimeout = function(e) { error(); };
        xhr.timeout = 10000;
        xhr.send(null);
    }
    fetch_ratings();
})();