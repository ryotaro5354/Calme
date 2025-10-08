/*----------------------------------------------------------
ページトップ
-----------------------------------------------*/
$(function () {
    let pagetop = $(".page-top");// ページトップボタンの要素を取得
    pagetop.hide();// 初期状態では非表示

    const footer = $('footer');// フッターの位置を取得

    $(window).on('scroll', function () {
        const scrollY = $(this).scrollTop();// 現在のスクロール量
        const windowHeight = $(window).height();// ウィンドウの高さ
        const footerTop = footer.offset().top;// フッターの上端位置

        // スクロールトップボタンの表示
        // スクロール量が200pxを超えたらボタン表示、それ以下なら非表示
        if (scrollY > 200) {
            pagetop.fadeIn();
        } else {
            pagetop.fadeOut();
        }

        // フッターに入ったかどうかで色変更
        if (scrollY + windowHeight >= footerTop + 80) {
            pagetop.addClass('footer-visible');
        } else {
            pagetop.removeClass('footer-visible');
        }
    });

    // クリックでトップに戻る
    pagetop.click(function () {
        $("html, body").animate({ scrollTop: 0 }, 700);
        return false;
    });
});


/*------------------------------------------------------------------
ドロップダウン、フィルター
------------------------------------------------------------------*/
// ページがぜんぶ読みこまれたら、この中のコードを動かすよ
$(document).ready(function () {
 // ▼「ドロップダウンのボタン」がクリックされたときの動き
    $('.dropdown-toggle').click(function (e) {//(e)はeventのこと
        e.stopPropagation();// クリックがほかのところに伝わらないようにする（ドアをしめる）
        $(this).siblings('.dropdown-menu').slideToggle(200); 
        // dropdown-toggleの中の兄弟dropdowntoggle,dropdown-menuのdropdownmenuを見つけて
        // その中のliをスライドで出したり隠したりりてね。0.2秒かけて
    });
    $(document).click(function () { // ▼ページのどこかをクリックしたら、メニューを閉じる
        $('.dropdown-menu').slideUp(200);// すべてのメニューをシュッと閉じる（200ミリ秒で）
    });
    

    const cardsPerPage = 6;// 1ページに出すカードの数を6まいにする
    let currentGender = 'all';// どの「性別カテゴリ」がえらばれているか（最初はぜんぶ＝all）
    let currentMenu = 'all';// どの「メニューカテゴリ」がえらばれているか（最初はぜんぶ＝all）
    let currentPage = 1;// いま何ページ目を見ているか（最初は1ページ目）

    const $cards = $('.cards .card');// 「.cards」の中にある「.card」をぜんぶ取ってくる
    //これが.cardだけだとページ全体のcardとついているものを持ってきちゃうけどcards cardにするとcardsの中のcardを全部取得してとなる

    // フィルターでカードをえらび出して表示するお仕事をする関数
    function filterCards() {
        // フィルターに合うカードだけを抽出
        let filtered = $cards.filter(function () {
            // カードに書いてある「データ（カテゴリー）」をカンマで分けてリストにする
            //htmlのdata-〇〇を書いてjsでdata('〇〇')で拾う
            const categories = $(this).data('category').split(',');

            // matchGenderを定義する。
            // currentGenderが"all"（ぜんぶ）または、categoriesにcurrentGenderが含まれている場合にtrueになる
            const matchGender = currentGender === 'all' || categories.includes(currentGender);

            // matchMenuを定義する。
            // currentMenuが"all"（ぜんぶ）または、categoriesにcurrentMenuが含まれている場合にtrueになる
            const matchMenu = currentMenu === 'all' || categories.includes(currentMenu);

            // 性別とメニュー、両方OKのものだけ返す！
            return matchGender && matchMenu;
        });

        // 一旦全部消した状態でフィルターにかかったやつだけを表示するようにしないと
        //もともとページにあったカード＋今フィルターでtrueになったカード」が両方表示されちゃう
        $cards.hide();

        // ▼今のページに出すカードだけを表示する
        // start: 1ページ目、2ページ目…で表示するカードの「はじめの番号」を計算
        // currentPage - 1 → ページ番号を0スタートに直す(配列は０からスタートするため)
        // それにcardsPerPage（1ページに表示する枚数const cardsPerPage=6）をかける(*)と
        // 「このページで何番目のカードから表示するか」が分かる
        const start = (currentPage - 1) * cardsPerPage;

        //何番目までだすか（startの0(1番目)からcardsPerPage(6コ)までとか）
        const end = start + cardsPerPage;

        // その間のカードだけ見せる！
        filtered.slice(start, end).show();

        // ページネーション作成
        const totalPages = Math.ceil(filtered.length / cardsPerPage);
        const $pagination = $('.gallery-pagination ul');
        $pagination.empty();
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            const disabledAttr = i === currentPage ? 'style="pointer-events:none;cursor:default;"' : '';
            $pagination.append(`<li><a href="#" class="${activeClass}" data-page="${i}" ${disabledAttr}>${i}</a></li>`);
        }
    }

    // ドロップダウン選択
     // 「ドロップダウンの中のリンク（aタグ）」がクリックされたときに動く処理を作る
    // e はイベントの情報（クリックしたなどの情報を持っている）
    $('.dropdown-menu a').click(function (e) {

        // リンクの本来の動きを止める
        // 例えば href="#" のページ移動をしないようにする
        e.preventDefault();

        // クリックしたリンクに書かれた data-category="men" などの情報を取り出して
        // currentGender に入れる
        // これで「どの性別カテゴリが選ばれたか」を記録する
        currentGender = $(this).data('category');

        // ドロップダウンを変えたら、必ず1ページ目から表示するようにする
        // 例えば2ページ目を見ていても、フィルターを変えたら1ページ目に戻す
        currentPage = 1;

        // クリックしたリンクの文字（例：「Men」）を取り出す
        // これをボタンに表示するために使う
        const selectedText = $(this).text();

        // 「このリンクが入っているドロップダウンの親」を見つけて
        // その中のボタン部分（dropdown-toggle）に文字を反映する
        // つまり選んだ文字をボタンに表示する
        $(this).closest('.dropdown').find('.dropdown-toggle').text(selectedText);

        // カードをフィルターして、選ばれたカテゴリのカードだけを表示する
        filterCards();
    });

    // フィルタボタン選択
    // 「フィルタボタン（aタグ）がクリックされたとき」に動く処理を作る
    // e はクリックなどのイベント情報を持っている
    $('.filter-list a').click(function (e) {

        // リンクの本来の動きを止める
    // 例えば href="#" のページ移動をしないようにする
        e.preventDefault();

        // クリックしたボタンの data-category の値を取り出して currentMenu に入れる
    // これで「どのメニューカテゴリが選ばれたか」を覚える
        currentMenu = $(this).data('category');

        // フィルターを変えたら、必ず1ページ目から表示するようにする
    // 例えば2ページ目を見ていても、フィルターを変えたら1ページ目に戻す
        currentPage = 1;

        $('.filter-list a').removeClass('active');
        $(this).addClass('active');

        // カードをフィルターして、選ばれたカテゴリのカードだけを表示する
        filterCards();
    });

    // ページ番号クリック
    $('.gallery-pagination').on('click', 'a', function (e) {
        e.preventDefault();
        currentPage = parseInt($(this).data('page'));

        $('.gallery-pagination a').removeClass('active');
        $(this).addClass('active');

        filterCards();

        $('html, body').animate({ scrollTop: $('.gallery-filter').offset().top }, 300);
    });

    // 初回表示
    filterCards();
});


/*---------------------------------------------------------------
ヘッダー消したりでてきたり開いたり閉じたりスクロール禁止にしたりハンバーガー開いたり閉じたり
-----------------------------------------------------------*/
$(function () {
    const $header = $('header'); // ヘッダー要素
    const $nav = $('.header-nav');// ナビゲーションメニュー
    const $body = $('body');// ボディ要素
    let prevY = $(window).scrollTop(); // 前回のスクロール位置
    let scrollPos = 0; // メニュー開閉前のスクロール位置
    let resizeTimer;
    // スクロール時にヘッダーを隠したり表示したりする処理
    $(window).on('scroll', function () {
        if ($header.hasClass('open')) return;// メニューが開いてるときは何もしない

        const currentY = $(this).scrollTop();
        if (currentY < prevY) {
            $header.removeClass('hidden');// 上にスクロール → ヘッダー表示
        } else {
            if (currentY > 0) {
                $header.addClass('hidden');// 下にスクロール → ヘッダー非表示
            }
        }
        prevY = currentY;
    });

    $(".hamburger-menu").on("click", function () {
        $header.toggleClass("open");

        if ($header.hasClass('open')) {
            // 開くときスクロール位置保持
            scrollPos = $(window).scrollTop();

            // body固定して背景スクロール禁止
            $body.css({
                position: 'fixed',
                top: -scrollPos + 'px',
                width: '100%'
            }).addClass('menu-open');

            // メニューにフェードイン用クラス追加
            $nav.addClass('fade-in');
            $header.removeClass('hidden');
        } else {
            // メニュー閉じるとき
            $nav.removeClass('fade-in'); // フェードアウト
            setTimeout(function () {
                $body.removeClass('menu-open').css({ position: '', top: '', width: '' });
                $(window).scrollTop(scrollPos);// 元の位置に戻す
            }, 300); // CSS transition に合わせて少し遅らせる
        }
    });

    $(".menu li a").on("click", function () {
        $header.removeClass("open");
        $nav.removeClass('fade-in'); // フェードアウト
        setTimeout(function () {
            $body.removeClass('menu-open').css({ position: '', top: '', width: '' });
            $(window).scrollTop(scrollPos);
        }, 300);
    });

    $(window).on('resize', function () { // ウィンドウリサイズ時にtransitionを一時的に無効化
        $nav.addClass('no-transition');
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            $nav.removeClass('no-transition');
        }, 100);
    });
});
/*-------------------------------------------------
フェードイン
-----------------------------------------*/
$(function () {
    function fadeInOnScroll() {
        $('.staff,.concept,.news,.menu-item,.about-item,.access,.gallery,.page-title,.single-inner').each(function () {
            const elemTop = $(this).offset().top;
            const scrollTop = $(window).scrollTop();
            const windowHeight = $(window).height();

            if (scrollTop + windowHeight > elemTop + 350) { // 50px 手前で開始
                $(this).addClass('fadein');
            }
        });
    }

    $(window).on('scroll load', fadeInOnScroll); // スクロールまたはページ読み込み時に実行
});

