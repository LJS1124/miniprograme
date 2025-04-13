// result.js
Page({
  data: {
    result: null,
    teamColors: ['#4A90E2', '#F5A623', '#7ED321', '#D0021B'],
    showConfetti: true, // 是否显示庆祝效果
  },

  onLoad() {
    console.log('结果页面加载');
    
    // 尝试先使用预加载的数据，立即显示页面结构
    const preloadData = wx.getStorageSync('_preloadResultData');
    if (preloadData) {
      this.setData({ result: preloadData });
    }
    
    // 获取最终的游戏结果
    const lastGameResult = wx.getStorageSync('lastGameResult');
    if (lastGameResult) {
      console.log('获取到游戏结果:', lastGameResult);
      this.setData({
        result: lastGameResult
      });
      
      // 3秒后自动关闭庆祝效果
      setTimeout(() => {
        this.setData({
          showConfetti: false
        });
      }, 3000);
    } else {
      console.log('未获取到游戏结果');
    }
    
    // 清除预加载数据
    wx.removeStorageSync('_preloadResultData');
  },

  // 再来一轮
  playAgain() {
    console.log('再来一轮按钮点击');
    // 获取当前队伍索引和游戏设置
    const { teamIndex } = this.data.result;
    const settings = wx.getStorageSync('gameSettings');
    const selectedLibrary = wx.getStorageSync('selectedLibrary');
    
    // 计算下一个队伍索引
    const nextTeamIndex = (teamIndex + 1) % 4; // 循环使用4个队伍颜色
    
    // 保存当前游戏数据
    const gameData = {
      teamIndex: nextTeamIndex,
      duration: settings?.gameDuration || 60,
      difficulty: settings?.difficulty || 'medium',
      library: selectedLibrary || 'random'
    };
    wx.setStorageSync('currentGameData', gameData);
    
    console.log('下一轮游戏数据:', gameData);
    
    // 跳转到准备页面
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

  // 返回首页
  backToHome() {
    console.log('返回首页按钮点击');
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 分享成绩
  shareResult() {
    console.log('分享成绩按钮点击');
    // 在实际项目中，这里可以调用分享 API
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none',
      duration: 2000
    });
  }
}) 