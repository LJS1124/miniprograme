// prepare.js
Page({
  data: {
    teamIndex: 0, // 当前队伍索引
    teamNames: ['队伍1', '队伍2', '队伍3', '队伍4'],
    teamColors: ['#4A90E2', '#F5A623', '#7ED321', '#D0021B'],
    countdownValue: 3, // 倒计时开始值
    countdownActive: false,
    settings: null, // 存储游戏设置
    selectedLibrary: '' // 存储选择的词库
  },

  onLoad() {
    console.log('准备页面加载');
    
    // 获取关键数据，减少重复获取
    const gameData = wx.getStorageSync('currentGameData') || {};
    
    // 使用短路逻辑简化代码
    this.setData({
      teamIndex: gameData.teamIndex || 0,
      countdownActive: false
    });
    
    // 预加载部分数据，减少游戏开始时的延迟
    setTimeout(() => {
      this.preloadGameData();
    }, 100);
  },
  
  // 预加载游戏数据，提高跳转速度
  preloadGameData() {
    // 获取更多配置数据，但放在异步操作中
    const settings = wx.getStorageSync('gameSettings') || {};
    const selectedLibrary = wx.getStorageSync('selectedLibrary') || 'random';
    
    const gameData = {
      teamIndex: this.data.teamIndex,
      duration: settings.gameDuration || 60,
      difficulty: settings.difficulty || 'medium',
      library: selectedLibrary
    };
    
    this.setData({
      settings,
      selectedLibrary
    });
    
    // 预加载游戏数据
    wx.setStorageSync('currentGameData', gameData);
  },

  // 开始游戏
  startGame() {
    console.log('开始游戏按钮点击');
    this.startCountdown();
  },

  // 开始倒计时
  startCountdown() {
    console.log('开始倒计时');
    
    // 先更新UI状态，再启动定时器
    this.setData({
      countdownActive: true,
      countdownValue: 3
    });
    
    // 提前预热游戏页面，减少后续跳转延迟
    setTimeout(() => {
      // 在后台准备游戏页面需要的数据
      this.prepareGamePageData();
      
      this.setData({ countdownValue: 2 });
      
      setTimeout(() => {
        this.setData({ countdownValue: 1 });
        
        setTimeout(() => {
          console.log('倒计时完成，跳转到游戏页面');
          this.navigateToGame();
        }, 800); // 稍微缩短间隔提高响应速度
      }, 800);
    }, 800);
  },
  
  // 预热游戏页面数据
  prepareGamePageData() {
    // 提前计算和准备游戏页面需要的任何数据
    // 这可以减少游戏页面加载时的计算量
    const gameData = wx.getStorageSync('currentGameData');
    if (gameData) {
      // 更新关键数据，确保游戏页面获得最新信息
      gameData.timestamp = Date.now();
      wx.setStorageSync('currentGameData', gameData);
    }
  },

  // 跳转到游戏页面
  navigateToGame() {
    console.log('跳转到游戏页面');
    
    // 使用switchTab如果游戏页是tabBar页面会更快，或者保持使用redirectTo
    wx.redirectTo({
      url: '/pages/game/game',
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.reLaunch({
          url: '/pages/game/game'
        });
      }
    });
  },

  // 返回首页
  goBack() {
    console.log('返回按钮点击');
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  }
}) 