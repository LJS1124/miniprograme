// index.js
Page({
  data: {
    selectedLibrary: 'random',
    showRulesModal: false
  },

  onLoad() {
    console.log('首页加载');
    // 加载时检查是否有缓存的设置
    const selectedLibrary = wx.getStorageSync('selectedLibrary') || 'random';
    this.setData({
      selectedLibrary
    });
  },

  // 选择词库
  selectLibrary(e) {
    console.log('选择词库:', e.currentTarget.dataset.library);
    const library = e.currentTarget.dataset.library;
    this.setData({
      selectedLibrary: library
    });
    wx.setStorageSync('selectedLibrary', library);
  },

  // 显示规则说明
  showRules() {
    console.log('显示规则说明');
    this.setData({
      showRulesModal: true
    });
  },

  // 关闭规则弹窗
  closeRulesModal() {
    console.log('关闭规则弹窗');
    this.setData({
      showRulesModal: false
    });
  },

  // 开始游戏
  startGame() {
    console.log('开始游戏按钮点击');
    
    // 减少同步操作，仅保存关键数据
    const selectedLibrary = this.data.selectedLibrary;
    wx.setStorageSync('selectedLibrary', selectedLibrary);
    
    // 简化游戏数据，减少处理量
    const settings = wx.getStorageSync('gameSettings');
    const gameData = {
      teamIndex: 0,
      duration: settings?.gameDuration || 60,
      difficulty: settings?.difficulty || 'medium',
      library: selectedLibrary
    };
    
    // 保存游戏数据
    wx.setStorageSync('currentGameData', gameData);
    
    // 使用redirectTo而不是navigateTo减少内存占用
    wx.redirectTo({
      url: '/pages/prepare/prepare',
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.reLaunch({
          url: '/pages/prepare/prepare'
        });
      }
    });
  },

  // 前往设置页
  goToSettings() {
    console.log('前往设置页按钮点击');
    wx.redirectTo({
      url: '/pages/settings/settings',
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.reLaunch({
          url: '/pages/settings/settings'
        });
      }
    });
  },

  // 前往排行榜
  goToRanking() {
    console.log('前往排行榜按钮点击');
    wx.showToast({
      title: '排行榜功能开发中',
      icon: 'none',
      duration: 2000
    });
  }
})
