'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;

console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  response => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  if (request.type === 'CRAWLER') {
    const trs = document.body.querySelectorAll('.home-project-inside-div .first-level-article > div:nth-child(4) tbody > tr')
    console.log('hhhh')
    let arr = []
    for (let i = 0; i < trs.length; i++) {
      const textIndent = trs[i].querySelector('th').style.textIndent
      const param = trs[i].querySelector('th > .ng-binding').textContent
      const type = trs[i].querySelector('td:nth-child(5)').textContent.replace(/\[/, '').replace(/\]/, '')
      const require = trs[i].querySelector('td:nth-child(4)').textContent

      const textIndentNumber = textIndent ? textIndent.replace(/px/, '') : 0

      arr.push({
        name: param,
        isRequire: require === '是',
        type,
        level: Number(textIndentNumber) / 10
      })
    }

    let strArr = [{ str: '{', level: 0 }]

    let str = `{`
    let lastLevelArr = []
    let lastTypeArr = []

    for (let i = 0; i < arr.length; i++) {

      const { type, level, isRequire, name } = arr[i]

      if (lastLevelArr.length) {
        const lastLevel = lastLevelArr[lastLevelArr.length - 1]

        if (lastLevel >= level) {

          let count = lastLevel - level
          let tempLevel

          for (let i = 0; i <= count; i++) {
            const lastType = lastTypeArr.pop()
            switch (lastType) {
              case 'object': 
                str += '},'
                tempLevel = lastLevelArr.pop()
                strArr.push({ str: '},', level: tempLevel + 1 })
                
                break
              case 'array': 
                str += '}>,'
                tempLevel = lastLevelArr.pop()
                strArr.push({ str: '}>,', level: tempLevel + 1 })
                
                break
              default:
                // do nothing
            }
          }
        }
      }

      switch (type) {
        case 'string': 
        case 'number':
          strArr.push({ str: `${name}${isRequire ? ':' : '?:'} ${type},`, level: level + 1 })
          str += `${name}${isRequire ? ':' : '?:'} ${type},`
          break
        case 'object':
          str += `${name}${isRequire ? ':' : '?:'} {`
          strArr.push({ str: `${name}${isRequire ? ':' : '?:'} {`, level: level + 1 })
          lastLevelArr.push(level)
          lastTypeArr.push(type)
          break
        case 'array':
          str += `${name}${isRequire ? ':' : '?:'} Array<{`
          strArr.push({ str: `${name}${isRequire ? ':' : '?:'} Array<{`, level: level + 1 })
          lastLevelArr.push(level)
          lastTypeArr.push(type)
          break
      }
    }

    if (lastLevelArr.length) {
      const lastType = lastTypeArr[lastTypeArr.length - 1]
        let tempLevel
        switch (lastType) {
          case 'object': 
            str += '},'
            tempLevel = lastLevelArr.pop()
            strArr.push({ str: '},', level: tempLevel + 1 })
            lastTypeArr.pop()
            break
          case 'array': 
            str += '}>,'
            tempLevel = lastLevelArr.pop()
            strArr.push({ str: '}>,', level: tempLevel + 1 })
            lastTypeArr.pop()
          default:
            // do nothing
        }
      
    }

    str += '}'
    strArr.push({ str: '}', level: 0 })

    // console.log(str)
    // console.log(strArr)

    sendResponse({
      str,
      strArr,
    })
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
