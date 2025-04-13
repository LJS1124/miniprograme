// settings.js
Page({
  data: {
    // 默认设置
    gameDuration: 60, // 默认60秒
    difficulty: 'medium', // 默认中等难度
    soundEffects: true, // 默认开启音效
    backgroundMusic: true, // 默认开启背景音乐

    // 游戏时间选项
    durationOptions: [
      { value: 30, label: '30 秒' },
      { value: 60, label: '60 秒' },
      { value: 90, label: '90 秒' }
    ],
    // 难度选项
    difficultyOptions: [
      { value: 'easy', label: '简单' },
      { value: 'medium', label: '中等' },
      { value: 'hard', label: '困难' }
    ]
  },

  onLoad() {
    console.log('设置页面加载');
    // 加载本地缓存中的设置，如果有的话
    const settings = wx.getStorageSync('gameSettings');
    if (settings) {
      this.setData({
        gameDuration: settings.gameDuration || 60,
        difficulty: settings.difficulty || 'medium',
        soundEffects: settings.soundEffects !== undefined ? settings.soundEffects : true,
        backgroundMusic: settings.backgroundMusic !== undefined ? settings.backgroundMusic : true
      });
    }
  },

  // 设置游戏时间
  setDuration(e) {
    console.log('设置游戏时间:', e.currentTarget.dataset.value);
    this.setData({
      gameDuration: parseInt(e.currentTarget.dataset.value)
    });
  },

  // 设置难度
  setDifficulty(e) {
    console.log('设置难度:', e.currentTarget.dataset.value);
    this.setData({
      difficulty: e.currentTarget.dataset.value
    });
  },

  // 切换音效开关
  toggleSoundEffects() {
    console.log('切换音效');
    this.setData({
      soundEffects: !this.data.soundEffects
    });
  },

  // 切换背景音乐开关
  toggleBackgroundMusic() {
    console.log('切换背景音乐');
    this.setData({
      backgroundMusic: !this.data.backgroundMusic
    });
  },

  // 保存设置并返回首页
  saveSettings() {
    console.log('保存设置');
    // 保存设置到本地缓存
    const settings = {
      gameDuration: this.data.gameDuration,
      difficulty: this.data.difficulty,
      soundEffects: this.data.soundEffects,
      backgroundMusic: this.data.backgroundMusic
    };
    wx.setStorageSync('gameSettings', settings);

    // 直接使用redirectTo而不是navigateBack，减少页面栈操作
    wx.redirectTo({
      url: '/pages/index/index',
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  },

  // 返回首页
  goBack() {
    console.log('返回按钮点击');
    // 直接使用redirectTo而不是navigateBack，减少页面栈操作
    wx.redirectTo({
      url: '/pages/index/index',
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  }
}) 