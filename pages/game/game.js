// game.js
Page({
  data: {
    gameActive: false, // 游戏是否进行中
    remainingTime: 60, // 剩余时间，默认60秒
    displayTime: '60', // 用于显示的时间
    timeWarning: false, // 时间警告标志
    currentWord: '', // 当前词语
    score: 0, // 当前得分
    correctCount: 0, // 猜对数量
    passCount: 0, // 跳过数量
    teamIndex: 0, // 当前队伍索引
    teamNames: ['队伍1', '队伍2', '队伍3', '队伍4'],
    teamColors: ['#4A90E2', '#F5A623', '#7ED321', '#D0021B'],
    wordList: [], // 当前轮词库
    usedWords: [], // 已使用的词语
    correctWords: [], // 猜对的词语
    skippedWords: [], // 跳过的词语
    isPaused: false, // 是否暂停
    isEnding: false, // 是否正在结束游戏
    showWordAnimation: false, // 单词动画
    difficulty: 'medium', // 当前难度
    difficultyText: { // 难度文本
      easy: '简单',
      medium: '中等',
      hard: '困难'
    },
    // 基础词库 - 在实际项目中应该从服务器或配置文件加载
    wordLibraries: {
      basic: [
        '苹果', '香蕉', '电脑', '手机', '电视', '微信', '支付宝', '飞机', '火车', '汽车',
        '足球', '篮球', '游泳', '跑步', '唱歌', '跳舞', '画画', '读书', '写字', '睡觉',
        '吃饭', '喝水', '笑', '哭', '跳', '坐', '站', '走', '跑', '拍手'
      ],
      animals: [
        '狗', '猫', '老虎', '狮子', '大象', '长颈鹿', '猴子', '熊猫', '鳄鱼', '兔子',
        '蛇', '鱼', '鸟', '蝙蝠', '鲸鱼', '海豚', '章鱼', '蜘蛛', '蚂蚁', '蝴蝶'
      ],
      movies: [
        '泰坦尼克号', '阿凡达', '星球大战', '哈利波特', '功夫熊猫', '速度与激情', '复仇者联盟',
        '狮子王', '玩具总动员', '冰雪奇缘', '寻梦环游记', '大话西游', '让子弹飞', '你好李焕英'
      ]
    }
  },

  onLoad() {
    console.log('游戏页面加载');
    
    // 获取关键游戏数据
    const gameData = wx.getStorageSync('currentGameData');
    if (gameData) {
      console.log('获取到游戏数据:', gameData);
      this.setData({
        remainingTime: gameData.duration || 60,
        displayTime: String(gameData.duration || 60),
        teamIndex: gameData.teamIndex || 0,
        difficulty: gameData.difficulty || 'medium'
      });
      
      // 立即准备核心词语列表以加速显示
      this.prepareWordList(gameData.library, gameData.difficulty);
    } else {
      console.log('未获取到游戏数据，使用默认设置');
      this.prepareWordList('random', 'medium'); // 默认设置
    }
    
    // 其他非关键预加载操作放在异步中执行
    setTimeout(() => {
      this.preloadResultPageData();
    }, 100);
    
    // 自动开始游戏，但稍微延迟以确保UI已准备好
    setTimeout(() => {
      this.startGame();
    }, 300); // 减少延迟时间
  },
  
  // 预加载结果页面数据，减少游戏结束时的跳转延迟
  preloadResultPageData() {
    // 空的结果数据结构，游戏结束时会被替换
    const emptyResult = {
      teamIndex: this.data.teamIndex,
      teamName: this.data.teamNames[this.data.teamIndex],
      score: 0,
      correctWords: [],
      skippedWords: [],
      timestamp: new Date().getTime()
    };
    
    // 预存一个空的结果数据，可以让结果页面更快地初始化
    wx.setStorageSync('_preloadResultData', emptyResult);
  },

  // 准备词语列表
  prepareWordList(library, difficulty) {
    console.log('准备词语列表, 词库:', library, '难度:', difficulty);
    let wordPool = [];
    
    if (library === 'random') {
      // 随机词库：混合所有词库
      const allWords = [
        ...this.data.wordLibraries.basic,
        ...this.data.wordLibraries.animals,
        ...this.data.wordLibraries.movies
      ];
      wordPool = allWords;
    } else if (this.data.wordLibraries[library]) {
      // 使用指定词库
      wordPool = this.data.wordLibraries[library];
    } else {
      // 如果没有找到词库，使用基础词库
      wordPool = this.data.wordLibraries.basic;
    }
    
    // 根据难度筛选词语
    let filteredWords = wordPool;
    if (difficulty === 'easy') {
      // 简单模式：选择较短的词语
      filteredWords = wordPool.filter(word => word.length <= 3);
    } else if (difficulty === 'hard') {
      // 困难模式：选择较长的词语
      filteredWords = wordPool.filter(word => word.length >= 4);
    }
    
    // 确保有足够的词语，如果不够则使用全部词库
    if (filteredWords.length < 10) {
      filteredWords = wordPool;
    }
    
    // 随机打乱词语顺序
    this.shuffleArray(filteredWords);
    
    // 设置第一个词语
    const firstWord = filteredWords.length > 0 ? filteredWords[0] : '';
    
    this.setData({
      wordList: filteredWords,
      usedWords: firstWord ? [firstWord] : [],
      correctWords: [],
      skippedWords: [],
      score: 0,
      correctCount: 0,
      passCount: 0,
      currentWord: firstWord  // 直接设置当前词语
    });

    console.log('词语列表准备完成，共', filteredWords.length, '个词');
    if (filteredWords.length > 0) {
      console.log('第一个词语示例:', filteredWords[0]);
    } else {
      console.error('警告：词语列表为空!');
    }
  },

  // 打乱数组顺序（Fisher-Yates洗牌算法）
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // 开始游戏
  startGame() {
    console.log('开始游戏按钮点击');
    // 设置初始状态
    this.setData({
      gameActive: true,
      isPaused: false,
      isEnding: false,
      score: 0,
      correctCount: 0,
      passCount: 0,
      usedWords: [],
      correctWords: [],
      skippedWords: []
    });
    
    // 显示第一个词语
    this.showNextWord();
    
    // 启动计时器
    this.startTimer();
  },

  // 启动计时器
  startTimer() {
    console.log('启动计时器');
    // 记录开始时间，用于精确计时
    const startTime = Date.now();
    const totalDuration = this.data.remainingTime * 1000; // 转换为毫秒
    const endTime = startTime + totalDuration;
    
    // 使用更精确的计时器
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.ceil((endTime - now) / 1000); // 向上取整确保倒计时结束准确
      
      if (remaining > 0) {
        // 检查是否需要显示时间警告
        const timeWarning = remaining <= 10;
        
        this.setData({ 
          remainingTime: remaining,
          displayTime: String(remaining),
          timeWarning: timeWarning
        });
        
        // 当剩余时间为10秒时播放提示音（如果启用了音效）
        if (remaining === 10) {
          this.playSound('countdown');
        }
        
        // 如果游戏正在进行且未暂停，继续计时
        if (this.data.gameActive && !this.data.isPaused && !this.data.isEnding) {
          // 使用RAF(requestAnimationFrame)的替代方法进行流畅的计时
          setTimeout(updateTimer, 100); // 使用较短的间隔可以让显示更平滑
        }
      } else {
        // 时间到，结束游戏
        if (!this.data.isEnding) {
          this.endGame();
        }
      }
    };
    
    // 启动计时器
    updateTimer();
  },

  // 暂停游戏
  pauseGame() {
    console.log('暂停游戏');
    this.setData({
      isPaused: true
    });
  },

  // 恢复游戏
  resumeGame() {
    console.log('恢复游戏');
    this.setData({
      isPaused: false
    });
    
    // 恢复计时器
    this.startTimer();
  },

  // 显示下一个词语
  showNextWord() {
    // 过滤出未使用的词语
    const unusedWords = this.data.wordList.filter(word => 
      !this.data.usedWords.includes(word)
    );
    
    if (unusedWords.length > 0) {
      // 随机选择一个未使用的词语
      const randomIndex = Math.floor(Math.random() * unusedWords.length);
      const nextWord = unusedWords[randomIndex];
      
      console.log('显示下一个词语:', nextWord);
      this.setData({
        currentWord: nextWord,
        usedWords: [...this.data.usedWords, nextWord],
        showWordAnimation: true
      });
      
      // 动画结束后重置动画状态
      setTimeout(() => {
        this.setData({
          showWordAnimation: false
        });
      }, 300);
    } else if (this.data.wordList.length > 0) {
      // 如果所有词语都用完了，重置已使用列表并重新开始
      console.log('词库已用完，重新开始');
      const firstWord = this.data.wordList[0];
      this.setData({
        usedWords: [firstWord],
        currentWord: firstWord,
        showWordAnimation: true
      });
      
      setTimeout(() => {
        this.setData({
          showWordAnimation: false
        });
      }, 300);
    }
  },

  // 猜对词语
  correctWord() {
    console.log('猜对词语:', this.data.currentWord);
    if (!this.data.gameActive || this.data.isPaused || this.data.isEnding) return;
    
    // 播放猜对音效
    this.playSound('correct');
    
    // 记录猜对的词语
    this.setData({
      score: this.data.score + 1,
      correctCount: this.data.correctCount + 1,
      correctWords: [...this.data.correctWords, this.data.currentWord]
    });
    
    // 显示下一个词语
    this.showNextWord();
  },

  // 跳过词语
  passWord() {
    console.log('跳过词语:', this.data.currentWord);
    if (!this.data.gameActive || this.data.isPaused || this.data.isEnding) return;
    
    // 播放跳过音效
    this.playSound('skip');
    
    // 记录跳过的词语
    this.setData({
      skippedWords: [...this.data.skippedWords, this.data.currentWord],
      passCount: this.data.passCount + 1
    });
    
    // 显示下一个词语
    this.showNextWord();
  },

  // 结束游戏
  endGame() {
    if (this.data.isEnding) return; // 防止重复调用
    
    console.log('结束游戏');
    this.setData({ isEnding: true });
    
    // 播放游戏结束音效
    this.playSound('gameOver');
    
    // 保存游戏结果
    const gameResult = {
      teamIndex: this.data.teamIndex,
      teamName: this.data.teamNames[this.data.teamIndex],
      score: this.data.score,
      correctCount: this.data.correctCount,
      passCount: this.data.passCount,
      correctWords: this.data.correctWords,
      skippedWords: this.data.skippedWords,
      timestamp: new Date().getTime()
    };
    
    console.log('游戏结果:', gameResult);
    
    // 获取历史记录并添加当前结果
    let gameHistory = wx.getStorageSync('gameHistory') || [];
    gameHistory.push(gameResult);
    wx.setStorageSync('gameHistory', gameHistory);
    
    // 保存当前结果以便结果页面显示
    wx.setStorageSync('lastGameResult', gameResult);
    
    // 延迟一点跳转，让玩家看到最后一秒
    setTimeout(() => {
      // 使用redirectTo而不是navigateTo减少内存占用和提高性能
      wx.redirectTo({
        url: '/pages/result/result',
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.reLaunch({
            url: '/pages/result/result'
          });
        }
      });
    }, 300);
  },

  // 播放音效
  playSound(type) {
    // 检查是否启用了音效
    const settings = wx.getStorageSync('gameSettings');
    if (settings && settings.soundEffects) {
      // 在实际项目中，这里应该使用wx.createInnerAudioContext()播放声音
      console.log('播放音效：', type);
    }
  },

  // 页面卸载时清除计时器
  onUnload() {
    console.log('游戏页面卸载');
    this.setData({
      gameActive: false,
      isPaused: true,
      isEnding: true
    });
  }
}) 