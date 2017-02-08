class Pot {
    constructor() {
        this.name = 'pot';
        this.chips = 0;
        this.hand = [];
    }

    clearHand() {
        this.hand = [];
    }

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

    recieveChips(chips) {
        this.chips += chips;
    }

    giveChips(chips) {
        this.chips -= chips;
        return chips;
    }
}

class Player {

    //initialized with a name, an amount of chips, and the ability to hold two cards;
    constructor(name) {
        this.name = name;
        this.chips = 500;
        this.hand = [];
        this.in = true;
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
        this.player1 = new Player('player1'); //create player1
        this.pot = new Pot(); //create pot
        this.deck = new Deck(); //create deck

        //insert player1's chip count
        document.getElementById('p1Chips').textContent = `Chips: ${this.player1.chips}`;

        //insert the pots chip count
        document.getElementById('potChips').textContent = `Pot: ${this.pot.chips}`;

        //insert the ante button
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="ante-button">Ante</button>`);
        document.getElementById('ante-button').addEventListener('click', this.ante)
    }

    ante() {
        document.getElementById('pot-im1').setAttribute('src', `cardImage/Green.png`);
        document.getElementById('pot-im2').setAttribute('src', `cardImage/Green.png`);
        document.getElementById('player1-im1').setAttribute('src', `cardImage/Green.png`);
        document.getElementById('player1-im2').setAttribute('src', `cardImage/Green.png`);
        //shufle deck
        game.deck.shuffle();
        //exchange chips
        game.pot.recieveChips(game.player1.giveChips(10));
        //display updated chip counts
        document.getElementById('p1Chips').textContent = `Chips: ${game.player1.chips}`;
        document.getElementById('potChips').textContent = `Chips: ${game.pot.chips}`;
        //give players their cards
        game.player1.drawCards(game.deck);
        game.pot.drawCards(game.deck);
        //remove ante button
        document.getElementById('pot').removeChild(document.getElementById('ante-button'));
        //add deal button
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="deal-button">Deal</button>`);
        //make it deal when clicked;
        document.getElementById('deal-button').addEventListener('click', () => game.deal());
    }

    deal() {
        //set the images of the players hand
        document.getElementById('player1-im1').setAttribute('src', `${game.player1.hand[0].image}`);
        document.getElementById('player1-im2').setAttribute('src', `${game.player1.hand[1].image}`);
        //set the images of the pot's hand
        document.getElementById('pot-im1').setAttribute('src', `cardImage/cardBack.jpg`);
        document.getElementById('pot-im2').setAttribute('src', `cardImage/cardBack.jpg`);
        game.stayOrFold();
    }
    stayOrFold() {
        //get rid of the deal button
        document.getElementById('pot').removeChild(document.getElementById('deal-button'));
        //set the play or fold buttons
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<p id='player-notifier'>Player 1!</p>`);
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="stay-button">Stay</button>`);
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="fold-button">Fold</button>`);
        //set functionality
        document.getElementById('stay-button').addEventListener('click', () => {
            game.player1.in = true;
            game.flipAndExchange();
        });
        document.getElementById('fold-button').addEventListener('click', () => {
            game.player1.in = false;
            game.flipAndExchange();
        });
    }

    flipAndExchange() {
        //remove the buttons and the player label
        document.getElementById('pot').removeChild(document.getElementById('stay-button'));
        document.getElementById('pot').removeChild(document.getElementById('fold-button'));
        document.getElementById('pot').removeChild(document.getElementById('player-notifier'));
        if (game.player1.in == false) {
            document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="deal-button">New Round</button>`);
            document.getElementById('deal-button').addEventListener('click', () => game.deal());
            //deal new cards for next round
            game.player1.drawCards(game.deck);
            game.pot.drawCards(game.deck);
        } else {
            //flip the pot cards
            document.getElementById('pot-im1').setAttribute('src', `${game.pot.hand[0].image}`);
            document.getElementById('pot-im2').setAttribute('src', `${game.pot.hand[1].image}`);
            //check winner, exchange chips;
            let winner = game.compareHands(game.player1, game.pot);
            winner.recieveChips(game.player1.giveChips(game.pot.chips));
            winner.recieveChips(game.pot.giveChips(game.pot.chips));
            //update chips
            document.getElementById('p1Chips').textContent = `Chips: ${game.player1.chips}`;
            document.getElementById('potChips').textContent = `Chips: ${game.pot.chips}`;
            //deal new cards for next round
            game.player1.drawCards(game.deck);
            game.pot.drawCards(game.deck);

            //add ante button if the pot is empty
            if (game.player1.chips < game.pot.chips) {
                document.getElementById('pot').insertAdjacentHTML('beforeend', `<p class="tex-red">YOU LOSE!!</button>`);
            } else if (game.pot.chips === 0) {
                document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="ante-button">New Round</button>`);
                document.getElementById('ante-button').addEventListener('click', this.ante)
            } else { //add deal button for a new hand
                document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="deal-button">Next Hand</button>`);
                document.getElementById('deal-button').addEventListener('click', () => game.deal());
            }
        }


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
