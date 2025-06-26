document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');

    const startButton = document.getElementById('start-button');
    const questionText = document.getElementById('question-text');
    const choicesContainer = document.getElementById('choices-container');
    const resultTitle = document.getElementById('result-title');
    const resultArtist = document.getElementById('result-artist');
    const resultAlbumArt = document.getElementById('result-album-art');
    const resultYoutubeLink = document.getElementById('result-youtube-link');
    const restartButton = document.getElementById('restart-button');

    let questions = [];
    let musicData = {};
    let currentQuestionIndex = 0;
    let typeCounts = {
        upbeat: 0,
        chill: 0,
        energetic: 0,
        melancholy: 0
    };

    // データを読み込む
    async function loadData() {
        try {
            const questionsResponse = await fetch('data/questions.json');
            questions = await questionsResponse.json();

            const musicResponse = await fetch('data/music.json');
            musicData = await musicResponse.json();
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            alert('アプリの初期化に失敗しました。ページをリロードしてください。');
        }
    }

    // 画面を切り替える
    function showScreen(screenToShow) {
        startScreen.style.display = 'none';
        quizScreen.style.display = 'none';
        resultScreen.style.display = 'none';
        screenToShow.style.display = 'block';
    }

    // クイズを開始する
    function startQuiz() {
        currentQuestionIndex = 0;
        typeCounts = {
            upbeat: 0,
            chill: 0,
            energetic: 0,
            melancholy: 0
        };
        showScreen(quizScreen);
        displayQuestion();
    }

    // 質問を表示する
    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            questionText.textContent = question.text;
            choicesContainer.innerHTML = ''; // 選択肢をクリア

            question.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.classList.add('choice-button');
                button.addEventListener('click', () => handleChoice(choice.type));
                choicesContainer.appendChild(button);
            });
        } else {
            // 全ての質問に答えたら結果を表示
            calculateResult();
        }
    }

    // 選択肢が選ばれた時の処理
    function handleChoice(type) {
        typeCounts[type]++; // 選択されたタイプのカウントを増やす
        currentQuestionIndex++;
        displayQuestion();
    }

    // 結果を計算する
    function calculateResult() {
        let maxCount = 0;
        let resultType = '';

        for (const type in typeCounts) {
            if (typeCounts[type] > maxCount) {
                maxCount = typeCounts[type];
                resultType = type;
            }
        }

        // 同点の場合のランダム選択（オプション）
        const tiedTypes = Object.keys(typeCounts).filter(type => typeCounts[type] === maxCount);
        resultType = tiedTypes[Math.floor(Math.random() * tiedTypes.length)];

        displayResult(resultType);
    }

    // 結果を表示する
    function displayResult(resultType) {
        showScreen(resultScreen);
        const recommendedSongs = musicData[resultType];
        if (recommendedSongs && recommendedSongs.length > 0) {
            // 複数の曲がある場合、ランダムに1曲選ぶ
            const song = recommendedSongs[Math.floor(Math.random() * recommendedSongs.length)];
            resultTitle.textContent = song.title;
            resultArtist.textContent = song.artist;
            resultAlbumArt.src = song.albumArtUrl;
            resultAlbumArt.alt = `${song.title} - ${song.artist} のアルバムアート`;
            resultYoutubeLink.href = song.youtubeUrl;
        } else {
            resultTitle.textContent = 'おすすめの曲が見つかりませんでした。';
            resultArtist.textContent = '';
            resultAlbumArt.src = '';
            resultAlbumArt.alt = '';
            resultYoutubeLink.href = '#';
        }
    }

    // イベントリスナー
    startButton.addEventListener('click', startQuiz);
    restartButton.addEventListener('click', () => {
        showScreen(startScreen); // スタート画面に戻る
    });

    // アプリ起動時にデータを読み込み、スタート画面を表示
    loadData().then(() => {
        showScreen(startScreen);
    });
});