class Player {

    //initialized with a name, an amount of chips, and the ability to hold two cards;
    constructor(name, chips) {
        this.name = name;
        this.chips = chips;
        this.hand = [];
        this.in = null;
    }

    //give the specified amount of chips to another player/pot.
    giveChips(chips) {
        this.chips -= chips;
        return chips;
    }

    //recieve the specified amount of chips from another player/pot;
    recieveChips(chips) {
        this.chips += chips;
    }

    //add cards from specified deck to players hand.
    drawCards(deck) {
        let deckID = deck.id;
        deck.count -= 2;
        return fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`)
            .then((res) => {
                return res.json();
            }).then((res) => {
                this.hand = [];
                this.hand.push(...res.cards);
            });
    }

    //empties the players hand
    clearHand() {
        this.hand = [];
    }
}

class Deck {
    //initializes a new deck with an id and a card count(the amount of cards not currently dealed out);
    constructor() {
        fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                this.id = res.deck_id;
                this.count = 52;
            });
    }
    //Sets the count to 52 and reshuffles all the drawn cards back into the deck.
    shuffle() {
        this.count = 52;
        fetch(`https://deckofcardsapi.com/api/deck/${this.id}/shuffle/`);
    }
}

class Game {
    constructor() {
        this.playerArray = []; //create Array to store players
        this.player1 = new Player('player1', 500);
        this.player2 = new Player('player2', 500);
        this.playerArray.push(this.player1);
        this.playerArray.push(this.player2);
        this.pot = new Player('pot', 0); //create pot
        this.deck = new Deck(); //create deck
        //insert player1's chip count
        for (var i = 0; i < this.playerArray.length; i++) {
            document.getElementById(`${this.playerArray[i].name}Chips`).textContent = `Chips: ${this.playerArray[i].chips}`;
        }

        //insert the pots chip count
        document.getElementById('potChips').textContent = `Pot: ${this.pot.chips}`;

        //insert the ante button
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="ante-button">Ante</button>`);
        document.getElementById('ante-button').addEventListener('click', this.ante)
    }

    dealHands() {
        for (var i = 0; i < game.playerArray.length; i++) {
            game.playerArray[i].drawCards(game.deck);
        }
        game.pot.drawCards(game.deck);
    }

    hideCards() {
        document.getElementById('pot-im1').setAttribute('src', `cardImage/Green.png`);
        document.getElementById('pot-im2').setAttribute('src', `cardImage/Green.png`);
        for (var i = 0; i < game.playerArray.length; i++) {
            console.log
            document.getElementById(`${game.playerArray[i].name}-im1`).setAttribute('src', `cardImage/Green.png`);
            document.getElementById(`${game.playerArray[i].name}-im2`).setAttribute('src', `cardImage/Green.png`);
        }
    }

    updateChips() {
        for (var i = 0; i < game.playerArray.length; i++) {
            document.getElementById(`${game.playerArray[i].name}Chips`).textContent = `Chips: ${game.playerArray[i].chips}`;
        }
        document.getElementById('potChips').textContent = `Pot: ${game.pot.chips}`;
    }

    ante() {
        //set the cards to be invisible
        game.hideCards();
        //shufle deck
        game.deck.shuffle();
        //exchange chips
        for (var i = 0; i < game.playerArray.length; i++) {
            game.pot.recieveChips(game.playerArray[i].giveChips(10));
        }
        //display updated chip counts
        game.updateChips();
        //give players their cards
        game.dealHands();
        //remove ante button
        document.getElementById('pot').removeChild(document.getElementById('ante-button'));
        //add deal button
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="deal-button">Deal</button>`);
        //make it deal when clicked;
        document.getElementById('deal-button').addEventListener('click', () => game.deal());
    }

    deal() {
        game.deck.shuffle();
        //set the images of the players hand
        for (var i = 0; i < game.playerArray.length; i++) {
            document.getElementById(`${game.playerArray[i].name}-im1`).setAttribute('src', `${game.playerArray[i].hand[0].image}`);
            document.getElementById(`${game.playerArray[i].name}-im2`).setAttribute('src', `${game.playerArray[i].hand[1].image}`);
        }

        //set the images of the pot's hand
        document.getElementById('pot-im1').setAttribute('src', `cardImage/cardBack.jpg`);
        document.getElementById('pot-im2').setAttribute('src', `cardImage/cardBack.jpg`);
        game.stayOrFold();
    }
    stayOrFold() {
        this.stayOrFoldedCounter = 0; //counts how many players fold/stay
        //get rid of the deal button
        document.getElementById('pot').removeChild(document.getElementById('deal-button'));
        //set the play or fold buttons
        for (var i = 0; i < game.playerArray.length; i++) {
            document.getElementById(`${game.playerArray[i].name}`).insertAdjacentHTML('beforeend', `<button class="btn red ${game.playerArray[i].name} stay-fold-btn" id="${game.playerArray[i].name}-stay">Stay</button>`); //stay button

            document.getElementById(`${game.playerArray[i].name}`).insertAdjacentHTML('beforeend', `<button class="btn red ${game.playerArray[i].name} stay-fold-btn" id="${game.playerArray[i].name}-fold">Fold</button>`); //fold button

            document.getElementById(`${game.playerArray[i].name}-stay`).addEventListener('click', (evt) => {
                //set the correct player property
                if (evt.target.classList.contains('player1')) {
                    game.player1.in = true;
                }
                if (evt.target.classList.contains('player2')) {
                    game.player2.in = true;
                }
                if (evt.target.classList.contains('player3')) {
                    game.player3.in = true;
                }
                game.stayOrFoldedCounter++; //keep track of button click
                evt.target.nextElementSibling.remove(); //kill buttons
                evt.target.remove();
                if (game.stayOrFoldedCounter === game.playerArray.length) {
                    game.flipAndExchange(); //if this is the last click, run next function
                }
            });
            document.getElementById(`${game.playerArray[i].name}-fold`).addEventListener('click', (evt) => {
                //set the correct player property
                if (evt.target.classList.contains('player1')) {
                    game.player1.in = false;
                }
                if (evt.target.classList.contains('player2')) {
                    game.player2.in = false;
                }
                if (evt.target.classList.contains('player3')) {
                    game.player3.in = false;
                }
                game.stayOrFoldedCounter++;
                evt.target.previousElementSibling.remove();
                evt.target.remove();
                if (game.stayOrFoldedCounter === game.playerArray.length) {
                    game.flipAndExchange();
                }
            });
        }
    }

    flipAndExchange() {
        console.log('hello');
        let playerIn = false;
        let playersIn = [];
        for (var i = 0; i < game.playerArray.length; i++) {
            if (game.playerArray[i].in == true) {
                playerIn = true;
                playersIn.push(game.playerArray[i]);
            }
        }
        if (playerIn == false) { //if everyone folds
            //everyone must re-ante
            for (var i = 0; i < game.playerArray.length; i++) {
                game.pot.recieveChips(game.playerArray[i].giveChips(10));
            }
        }
        else if (playersIn.length === 1) {
            //flip the pot cards
            document.getElementById('pot-im1').setAttribute('src', `${game.pot.hand[0].image}`);
            document.getElementById('pot-im2').setAttribute('src', `${game.pot.hand[1].image}`);
            //check winner, exchange chips;
            let winner = game.compareHands(playersIn[0], game.pot);
            winner.recieveChips(playersIn[0].giveChips(game.pot.chips));
            winner.recieveChips(game.pot.giveChips(game.pot.chips));
            if (game.pot.chips === 0) {
                document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="ante-button">New Round</button>`);
                document.getElementById('ante-button').addEventListener('click', game.ante())
            }
        }
        else {
            let winner = playersIn[0]; //find the winner
            for (var i = 1; i < playersIn.length; i++) {
                winner = game.compareHands(playersIn[i], winner);
            } //then have the winner recieve chips from the other players that are in.
            for (var i = 0; i < playersIn.length; i++) {
                winner.recieveChips(playersIn[i].giveChips(game.pot.chips));
            }
        }
        //
        for (var i = 0; i < game.playerArray.length; i++) {
            if (game.playerArray[i].chips < pot.chips) {
                document.getElementById(`${game.playerArray[i].name}-im1`).setAttribute('src', `cardImage/Green.png`);
                document.getElementById(`${game.playerArray[i].name}-im2`).setAttribute('src', `cardImage/Green.png`);
                game.playerArray = game.playerArray.splice(i, 1);
            }
        }
        if ((game.playerArray.length === 1) && (game.pot === 0)) {
            console.log('GAME OVER!')
        } else { //add deal button for a new hand
            document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="deal-button">Next Hand</button>`);
            game.dealHands();
            document.getElementById('deal-button').addEventListener('click', () => game.deal());
        }
        console.log('updating Chips');
        game.updateChips();
    }

    compareHands(p1, p2) {
        let values = ['2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K', 'A'];
        let suits = ['D', 'C', 'H', 'S'];

        //function checks if the hands are a pair
        function isPair(hand) {
            if (hand[0].value === hand[1].value) {
                return true;
            }
            return false;
        }

        //function finds the highest value of hand
        function highestValue(hand) {
            let biggestIndex = values.indexOf(hand[0].code[0]);
            if (values.indexOf(hand[1].code[0]) > biggestIndex) {
                biggestIndex = values.indexOf(hand[1].code[0]);
            }
            return biggestIndex;
        }

        function secondValue(hand) {
            let secondValue = values.indexOf(hand[0].code[0]);
            if (values.indexOf(hand[1].code[0]) < secondValue) {
                secondValue = values.indexOf(hand[1].code[0]);
            }
            return secondValue;
        }

        //finds the highest suit()
        function suitOfHighCard(hand) {
            if (values.indexOf(hand[0].code[0]) > values.indexOf(hand[1].code[0])) {
                return suits.indexOf(hand[0].code[1]);
            }
            return suits.indexOf(hand[1].code[1]);
        }

        //looking for highest card ifstatement hell
        if (isPair(p1.hand) && isPair(p2.hand)) { //if they're both double
            if (highestValue(p1.hand) === highestValue(p2.hand)) { //and they both have the same value
                if (suitOfHighCard(p1.hand) > suitOfHighCard(p2.hand)) { //if hand1's highest suit is higher then hand2s, return hand1, else return hand2
                    return p1;
                } else {
                    return p2;
                }
            } else { //and they don't have the same value, return the one with the highest value;
                if (highestValue(p1.hand) > highestValue(p2.hand)) {
                    return p1;
                } else {
                    return p2;
                }
            } //if the cards don't have the same value, return the one with the highest value
        } else if (isPair(p1.hand) || isPair(p2.hand)) { //if one is a pair and the other isn't return the one that is a pair!
            if (isPair(p1.hand)) {
                return p1;
            } else {
                return p2;
            }
        } else { //if neither is a pair
            if (highestValue(p1.hand) === highestValue(p2.hand)) { //and they have the same values
                if (secondValue(p1.hand) === secondValue(p2.hand)) { //and the second card is also the same value
                    if (suitOfHighCard(p1.hand) > suitOfHighCard(p2.hand)) { //if hand1's highest suit is higher then hand2s, return hand1, else return hand2
                        return p1;
                    } else {
                        return p2;
                    }
                } else if (secondValue(p1.hand) > secondValue(p2.hand)) { //the second cards values are different, return the higher one
                    return p1;
                } else {
                    return p2;
                }
            } else { //return the card with the higest value;
                if (highestValue(p1.hand) > highestValue(p2.hand)) {
                    return p1;
                }
                return p2;
            }
        }
    }
    // lookAndDecide(){
    //   document.getElementById(player1)
    // }
}
let game;
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementsByClassName('nav-wrapper')[0].removeChild(document.getElementById('start-btn'));
    document.getElementsByClassName('nav-wrapper')[0].insertAdjacentHTML('beforeend', '<button class="black btn right" id="start-btn">Quit</button>');
    game = new Game()
});
