/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/contentScript.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/contentScript.js":
/*!******************************!*\
  !*** ./src/contentScript.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
        const lastType = lastTypeArr[lastTypeArr.length - 1]
        if (lastLevel === level) {
          switch (lastType) {
            case 'object': 
              str += '},'
              strArr.push({ str: '},', level: level + 1 })
              lastLevelArr.pop()
              lastTypeArr.pop()
              break
            case 'array': 
              str += '}>,'
              strArr.push({ str: '}>,', level: level + 1 })
              lastLevelArr.pop()
              lastTypeArr.pop()
            default:
              // do nothing
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
            strArr.push({ str: '},', level: tempLevel })
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


/***/ })

/******/ });
//# sourceMappingURL=contentScript.js.map