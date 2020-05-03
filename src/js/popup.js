import '../css/popup.css'

window.addEventListener('DOMContentLoaded', () => {
  var buttons = document.getElementsByClassName('lang-button') // get all language buttons

  // loop through langauage buttons
  Array.from(buttons).forEach(function (button) {
    // on language button click
    button.addEventListener('click', function (item) {
      // deselect all language buttons
      Array.from(buttons).forEach((item) =>
        item.classList.remove('button-selected'),
      )

      // select the clicked language button
      item.target.classList.add('button-selected')
      console.log(item.target.dataset.id)
      // get selected langauge
      const language = item.target.dataset.id

      // send message contains selected langauge to content.js in current active browser tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { language }, function (response) {
          console.log('response: ', response)
        })
      })
    })
  })
})
