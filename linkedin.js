// ==UserScript==
// @name         LinkedIn 自動つながり申請システム(at keyword search page)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This script allows you to increase your LinkedIn connections efficiently at keyword search page (People).
// @author       Kanta Yamaoka (contact me: https://www.linkedin.com/in/kanta-yamaoka/ )
// @match        https://www.linkedin.com/search/results/people/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    var pageIndex;
    var setIntervalId;
    const COUNT_KEY = 'count';
    const COUNT_LIMIT = 10;
    //var totalCount    
    var isCuurentPageSearchResultPage = () => {
        // 検索結果のURLが一致していたらtrue判定をする
        return window.location.href.toLocaleLowerCase().indexOf('search/results/people/') != 1
    }

    if (isCuurentPageSearchResultPage()) { // trueの場合
        //elmにはsplit(&)したやつが配列で入っているのでそれを順番にif文で確認していく
        window.location.href.split('&').forEach(elm => {
            //eleに入っているやつに、page=　という文字列があればif分の中身を実行
            if (elm.indexOf('page=') != -1) {
                //page= の文字列の長さをlengthで取得。ようはこれで５という数字を取得。
                var start = 'page='.length
                //elmをさっき取得した5でslice ⇨elmの中身を５番目のやつから取得。
                pageIndex = parseInt(elm.slice(start))
                console.log('pageIndex', pageIndex)
            }
        })
        //when could not "page=" but clearly the current page is clearly the people search result page
        //上のif文が実行されなかった場合こっちが実行される。現在のURLの後ろに&page=1がついたURLに遷移させる。
        if (!pageIndex) {
            window.location.href += '&page=1'
        }

    }

    var initAutoConnector = () => {
        if (localStorage.getItem(COUNT_KEY) == null) {
            localStorage.setItem(COUNT_KEY, 0);
        }

        //表示されたページ上のhtml要素（document）から引数に入っているクラスを見つけてそれを配列形式で該当した全てを変数に代入
        var connectButtonCandidates = document.querySelectorAll('button[class="artdeco-button artdeco-button--2 artdeco-button--secondary ember-view"]');
        //変数宣言（配列で）
        var connectButtons = [];
        console.log(connectButtonCandidates);
        //filter buttons: get only connect buttons
        //connectButtonCandidatesに入っている配列の数をlengthで取得し、その数より大きくなるまでループ
        for (var i = 0; i < connectButtonCandidates.length; i++) {
            //console.log('Button condition', connectButtonCandidates[i].innerText)
            //innerTextでHTML要素の<開始タグ>と<終了タグ>に内包されたテキストを取得->さっきquerySelectorAllで取得したやつのテキストにConnectがあるか
            if (connectButtonCandidates[i].innerText == 'つながりを申請') {
                //変数connectButtonsにconnectButtonCandidates[i]を追加
                connectButtons.push(connectButtonCandidates[i]) // Node Listが入ってくる？？
            };
        }


        //gets random integers ranged from 0 to 300
        //by changing intervals, LinkedIn is not likely to detect this sort of automation
        var getRandomInteger = () => {
            var min = 900;
            var max = 9000;
            //Math.floor(x)・・・引数で渡した数値の小数点を切り捨てる。
            //Math.random()・・・0以上1未満の乱数を生成する。
            return Math.floor(Math.random() * (max + 1 - min)) + min;
        }

        var connectButtonCount = 0

        var connectButtonOperation = () => {
            try {
                // if (count <= 8) {
                if (Number(localStorage.getItem(COUNT_KEY)) <= COUNT_LIMIT) {
                    // console.log(totalCount);

                    if (connectButtonCount < connectButtons.length) {

                        connectButtons[connectButtonCount].click();

                        setTimeout(() => {
                            //clicks only when "Send Invitation" exists
                            var cancel = document.querySelector('button[class="artdeco-modal__dismiss artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary ember-view"]')
                            if (cancel) {
                                console.log('sendInvitationElement exists', cancel)
                                //✖️ボタンを自動でクリックする
                                cancel.click();
                            }
                            connectButtonCount++;
                            localStorage.setItem(COUNT_KEY, Number(localStorage.getItem(COUNT_KEY))+1);
                        }, getRandomInteger())

                    } else {
                        console.log('already clicked all connect buttons')
                        clearInterval(setIntervalId)
                        //when no connect buttons available
                        //then move to next result page
                        var currentUrl = window.location.href

                        //矢印は単純に左から右に変わったよってわかりやすくするためのもの
                        //console.log(`page=${pageIndex}`, '->', `page=${pageIndex + 1}`)

                        //.replace( 対象の文字, 置換する文字 )
                        //現在のURLのpage=をプラス１したやつにする
                        var nextPageUrl = currentUrl.replace(`page=${pageIndex}`, `page=${pageIndex + 1}`)
                        //console.log(currentUrl.slice(50),nextPageUrl.slice(50))
                        setTimeout(() => { window.location.href = nextPageUrl }, 5000)

                    }
                } else {
                    clearInterval(setIntervalId);
                    localStorage.removeItem('count');
                    localStorage.removeItem(COUNT_KEY);
                    throw new Error('規定数に達したため終了しました');
                }
            } catch (e) {
                alert(e.message);
            }
        }

        //setInterval…一定時間ごとに特定の処理を繰り返す
        //setInterval(関数,処理間隔)
        //第一引数に与えられた関数を、第二引数に与えられた間隔で実行する。処理間隔の単位はミリ秒
        setIntervalId = setInterval(connectButtonOperation, 6000 + getRandomInteger()) //ここでconnectButtonOperationの関数が走る

    }

    // 検索結果のURLの場合に、initAutoConnectorという関数を走らせる
    if (isCuurentPageSearchResultPage()) {
        console.log('Found "Connect" buttons. Startsing automatically conectiong...')
        //window（ページ全体）の読み込みが完了した時にinitAutoConnectorを実行する。
        window.onload = () => { initAutoConnector() }
    } else {
        console.log('Could not find "Connect" buttons. This page may not be search result page.')
    }
    //adds Autoconnector bar element to DOM
    var initACBar = () => {
        var autoconnectStopButton = document.createElement('div');
        autoconnectStopButton.innerHTML = `<span id='ACstatus'>自動でつながり申請を実行中です...</span><p id='ACstopButton'>停止したい場合こちらをクリック</p>`
        var css = (prop, value) => {
            autoconnectStopButton.style[prop] = value
        }

        css('width', '23%')
        css('height', '95px')
        css('backgroundColor', 'white')
        css('color', '#0178B5')
        css('border', '2px solid #0178B5')
        css('borderRadius', '10px')
        css('textAlign', 'center')
        css('textHeight', '10px')
        css('position', 'fixed')
        css('bottom', '5%')
        css('left', '1%')
        css('zIndex', '10000')

        document.body.appendChild(autoconnectStopButton)
        document.getElementById('ACstopButton').style.margin = '10px'


        autoconnectStopButton.onclick = () => {
            clearInterval(setIntervalId)
            css('backgroundColor', '#c8c8c8')
            document.getElementById('ACstatus').innerText = '自動申請を無効化しました'
            document.getElementById('ACstopButton').innerText = '再度自動化を実行するには、ページを更新してください'
        }

    }

    initACBar()

})();