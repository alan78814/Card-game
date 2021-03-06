// 放在文件最上方
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同遊戲狀態 做不同行為
  //card來自document.querySelectorAll(".card").forEach(card => 
  dispatchCardAction(card) {
    //是牌背直接結束
    if(! card.classList.contains("back")) {
      return
    }
    //非牌背情況
    switch(this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        model.revealedCards.push(card)
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        model.revealedCards.push(card)

        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

const model = {   
  //翻牌站存陣列
  revealedCards: [],

  isRevealedCardsMatched () {
    // 數字相同 dataset.index % 13會相同 
    // ex:-- index=0 %13=0 黑桃1, index=13 %13=0 愛心1
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes:0 ,

}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]


const view = {
  //卡片牌背元素
  getCardElement(index) {
    return `<div data-index = ${index} class="card back"></div>`
  },
  //卡片內容:數字 花色
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  //產生卡片
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("");
    // this.getCardElement()可改成 view.getCardElement()
    // .getCardElement()為使用物件 const view = {
    // displayCards: function displayCards() { ...  }
  },

  //翻牌
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  //配對成功的card加上樣式
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },

  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  //得到隨機數字排列陣列
  getRandomNumberArray (count) {
    const number  = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let index = number.length - 1
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

//每張卡牌加上事件監聽器
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", event => {
    controller.dispatchCardAction(card)
  })
})


