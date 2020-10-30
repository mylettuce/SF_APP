const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
const url = require('url')
//const pkg = require('./package.json')
//const fs = require('fs');



var fins = require('omron-fins');
var options = {timeout:10000};
var fins_SID = {};
finsHeader = {
    ICF : 0x80,
    RSV : 0x00,
    GCT : 0x02,
    DNA : 0x01,
    DA1 : 0x01,
    DA2 : 0x00,
    SNA : 0x01,
    SA1 : 0x04,
    SA2 : 0x00,
    SID : 0x00
}

var isPackaged = false;
if (
  process.mainModule &&
  process.mainModule.filename.indexOf('app.asar') !== -1
) {
  isPackaged = true;
} else if (process.argv.filter(a => a.indexOf('app.asar') !== -1).length > 0) {
  isPackaged = true;
}

//if(pkg.DEV) {
if(!isPackaged) {
    var client = fins.FinsClient(9600, '127.0.0.1');
}
else {
    var client = fins.FinsClient(9600, '192.168.0.100');
}
client.header = finsHeader

client.on("timeout", function(host) {
    console.log("timeout", host)
})

client.on('error',function(error) {
  console.log("Error: ", error);
});

client.on('reply',function(msg) {
    //console.log("Reply from: ", msg.remotehost);
    //console.log("Replying to issued command of: ", msg.command);
    //console.log("Response code of: ", msg.code);
    //console.log("Data returned: ", msg.values);
    //console.log('reply', msg)
    if(win && msg.command === "0101")
        win.webContents.send('plcReply', msg, fins_SID[msg.sid])
    delete fins_SID[msg.sid];
    //console.log(fins_SID);
});


/* Read 10 registers starting at DM register 00000 */
//client.read('D00000',10,function(err,bytes) {
//	console.log("Bytes: ", bytes);
//});

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let win

const gotTheLock = app.requestSingleInstanceLock()

function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({
      width: 1280, 
      height: 1024,
      icon: __dirname + '/icon.ico',
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true, // add 集成 Nodejs
        preload: __dirname + '/preload.js',
        worldSafeExecuteJavaScript: true,
      }
  })
    const isMac = process.platform === 'darwin'

    const template = [
      // { role: 'appMenu' }
      ...(isMac ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),
      // { role: 'fileMenu' }
      //{
      //  label: 'File',
      //  submenu: [
      //    isMac ? { role: 'close' } : { role: 'quit' }
      //  ]
      //},
      // { role: 'editMenu' }
      //{
      //  label: 'Edit',
      //  submenu: [
      //    { role: 'undo' },
      //    { role: 'redo' },
      //    { type: 'separator' },
      //    { role: 'cut' },
      //    { role: 'copy' },
      //    { role: 'paste' },
      //    ...(isMac ? [
      //      { role: 'pasteAndMatchStyle' },
      //      { role: 'delete' },
      //      { role: 'selectAll' },
      //      { type: 'separator' },
      //      {
      //        label: 'Speech',
      //        submenu: [
      //          { role: 'startspeaking' },
      //          { role: 'stopspeaking' }
      //        ]
      //      }
      //    ] : [
      //      { role: 'delete' },
      //      { type: 'separator' },
      //      { role: 'selectAll' }
      //    ])
      //  ]
      //},
      //// { role: 'viewMenu' }
      //...(pkg.DEV?[{
      ...(!isPackaged?[{
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      }]:[]),
      {
          label: "操作",
          submenu:[
              { 
                  label: "启动",
                  click: async () => {
                      console.log("Action => Start");
                      win.webContents.send('SF_MENU_START')
                      //client.write("WB0290:00", 1, null)
                      //client.write("WB0291:04", 1, null)
                  }
              },
              { 
                  label: "停止",
                  click: async () => {
                      console.log("Action => Stop");
                      win.webContents.send('SF_MENU_STOP')
                      //client.write("WB0290:00", 0, null)
                      //client.write("WB0291:04", 0, null)
                  }
              }
          ]
      },
        {
            label: "控制",
            submenu: [
                {
                    label: "功能开关",
                    accelerator: "CmdOrCtrl+F",
                    click: async () => {
                        win.webContents.send("SF_MENU_MAINCONTROL")
                    }
                },
                {
                    label: "传送带设置",
                    accelerator: "CmdOrCtrl+O",
                    click: async () => {
                        win.webContents.send("SF_MENU_CONVEYORSETTING")
                    }
                },
                //{
                //    label: "温区设置",
                //    click: async () => {
                //        win.webContents.send("SF_MENU_ZONESETTING")
                //    }
                //},
                {
                    label: "运行参数管理",
                    accelerator: "CmdOrCtrl+Y",
                    click: async () => {
                        win.webContents.send("SF_MENU_PROFILESETTING")
                    }
                },
                {
                    label: "升温参数管理",
                    accelerator: "CmdOrCtrl+S",
                    click: async () => {
                        win.webContents.send("SF_MENU_WARMUPSETTING")
                    }
                },
                {
                    label: "加湿参数管理",
                    accelerator: "CmdOrCtrl+W",
                    click: async () => {
                        win.webContents.send("SF_MENU_WETTERSETTING")
                    }
                },
                {
                    label: "气体参数管理",
                    accelerator: "CmdOrCtrl+A",
                    click: async () => {
                        win.webContents.send("SF_MENU_GASSETTING")
                    }
                }
            ]
        },
        {
            label: "报警",
            submenu: [
                {
                    label: "显示",
                    click: async () => {
                        win.webContents.send("SF_MENU_AlARMVIEWER")
                    }
                }
            ]
        }
    ]
    //console.log(template)
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    //win.webContents.on('did-finish-load', () => win.webContents.send('ping', '🤘') );
    ipcMain.on("plcRead", (event, address, n) => {
        //console.log(event, address, n)
        client.read(address, n, function(err,bytes) {
            win.webContents.send('plcReaded', bytes)
        })
    })
    ipcMain.on("plcWrite", (event, address, value) => {
        //console.log('PLC Write', address, value)
        //if(pkg.DEV===false||true){
        if(isPackaged===false||true){
            client.write(address, value, function(err,bytes) {
                win.webContents.send('plcWrited', bytes)
            })
        }
        else {
            console.log("Send skiped in dev mode")
        }
    })

  // 然后加载应用的 index.html。
  // package中的DEV为true时，开启调试窗口。为false时使用编译发布版本
  //if(pkg.DEV){
  if(!isPackaged){
    win.loadURL('http://localhost:3000/')
  }else{
    win.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  // 打开开发者工具。
  //win.webContents.openDevTools();

  let intervalTimer = setInterval(()=>{
      //console.log("Ontimer")
      if(client) {
          client.read("D00000", 500);
          //win.webContents.send('plcReaded', bytes)
          fins_SID[client.header.SID] = ["D", 0];
          client.read("D00500", 350);
          fins_SID[client.header.SID] = ["D", 500];
          client.read("D00920", 145);
          fins_SID[client.header.SID] = ["D", 920];
          client.read("W00000", 350);
          fins_SID[client.header.SID] = ["W", 0];
          client.read("C00000", 12);
          fins_SID[client.header.SID] = ["C", 0];
          client.read("D02000", 500);
          fins_SID[client.header.SID] = ["D", 2000];
      }
  }, 500)

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    console.log("win.closed")
    clearInterval(intervalTimer)
    win = null
    client = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
if(!gotTheLock) {
    app.quit()
}
else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if(win) {
            if(win.isMinimized())
                win.restore()
            win.focus()
        }
    })
    app.on('ready', createWindow)

    // 当全部窗口关闭时退出。
    app.on('window-all-closed', () => {
      // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
      // 否则绝大部分应用及其菜单栏会保持激活。
      console.log("app.window-all-closed")
      //clearInterval(intervalTimer)
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      // 在macOS上，当单击dock图标并且没有其他窗口打开时，
      // 通常在应用程序中重新创建一个窗口。
      if (win === null) {
        createWindow()
      }
    })
}

// 在这文件，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
// 在这里可以添加一些electron相关的其他模块，比如nodejs的一些原生模块
// 文件模块
// const BTFile = require('./sys_modules/BTFile')
// BTFile.getAppPath()
