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
            });
    }
    //Sets the count to 52 and reshuffles all the drawn cards back into the deck.
    shuffle() {
        fetch(`https://deckofcardsapi.com/api/deck/${this.id}/shuffle/`);
    }
}

class Game {
    constructor(players) {
        console.log(players);
        //remove start button and replace with quit button.
        document.getElementsByClassName('nav-wrapper')[0].removeChild(document.getElementById('start-btn'));
        document.getElementsByClassName('nav-wrapper')[0].insertAdjacentHTML('beforeend', '<button class="black btn right" id="quit-btn">Quit</button>');
        document.getElementById('quit-btn').addEventListener('click', (evt) => {
            this.endGame();
        })
        this.playerArray = []; //create Array to store players
        this.playersOut = []; //stores players that have been eliminated
        if (players === 2) { //two player game
            document.getElementById('player3Chips').textContent = "";
            this.player1 = new Player('player1', 500);
            this.player2 = new Player('player2', 500);
            this.playerArray.push(this.player1);
            this.playerArray.push(this.player2);

        } else { //three player game
            this.player1 = new Player('player1', 500);
            this.player2 = new Player('player2', 500);
            this.player3 = new Player('player3', 500);
            this.playerArray.push(this.player1);
            this.playerArray.push(this.player2);
            this.playerArray.push(this.player3);
        }

        this.pot = new Player('pot', 0); //create pot
        this.deck = new Deck(); //create deck
        this.enableListener = false;
        //display players chip counts
        for (var i = 0; i < this.playerArray.length; i++) {
            document.getElementById(`${this.playerArray[i].name}Chips`).textContent = `${this.playerArray[i].name} Chips: ${this.playerArray[i].chips}`;
        }
        document.getElementById('potChips').textContent = `Pot: ${this.pot.chips}`;
        //insert the ante button
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="ante-button">Ante</button>`);
        document.getElementById('ante-button').addEventListener('click', this.ante);
        //set listeners
        for (var i = 0; i < this.playerArray.length; i++) {
            //set listener on first card
            document.getElementById(`${this.playerArray[i].name}-im1`).addEventListener('click', (evt) => {
                if (this.enableListener === true) {
                    if (evt.target.getAttribute('src') === "cardImage/cardBack.jpg") {
                        let targetName = evt.target.getAttribute('id').slice(0, 7);
                        console.log(`${targetName}'s cards were looked at`);
                        let target = null;
                        for (var i = 0; i < this.playerArray.length; i++) {
                            if (this.playerArray[i].name === targetName) {
                                target = this.playerArray[i];
                            }
                        }
                        evt.target.setAttribute('src', `${target.hand[0].image}`);
                        evt.target.nextElementSibling.setAttribute('src', `${target.hand[1].image}`);
                    } else {
                        evt.target.setAttribute('src', `cardImage/cardBack.jpg`);
                        evt.target.nextElementSibling.setAttribute('src', `cardImage/cardBack.jpg`);
                    }
                }
            });
            //set listener on second card
            document.getElementById(`${this.playerArray[i].name}-im2`).addEventListener('click', (evt) => {
                if (this.enableListener === true) {
                    if (evt.target.getAttribute('src') === "cardImage/cardBack.jpg") {
                        let targetName = evt.target.getAttribute('id').slice(0, 7);
                        console.log(`${targetName}'s cards were looked`);
                        let target = null;
                        for (var i = 0; i < this.playerArray.length; i++) {
                            if (this.playerArray[i].name === targetName) {
                                target = this.playerArray[i];
                            }
                        }
                        evt.target.previousElementSibling.setAttribute('src', `${target.hand[0].image}`);
                        evt.target.setAttribute('src', `${target.hand[1].image}`);
                    } else {
                        evt.target.previousElementSibling.setAttribute('src', "cardImage/cardBack.jpg");
                        evt.target.setAttribute('src', "cardImage/cardBack.jpg");
                    }
                }
            });
        }
    }

    endGame() { //when you press quit or only one player is left

        //remove reveal button if it exists
        if (document.getElementById('reveal-button') !== null) {
            document.getElementById('reveal-button').remove();
        }
        //remove the nextHand/deal button if it exists
        if (document.getElementById('deal-button') !== null) {
            document.getElementById('deal-button').remove();
        }
        //remove ante button if it exists
        if (document.getElementById('ante-button') !== null) {
            document.getElementById('ante-button').remove();
        }
        //remove stay/fold buttons if they exist
        if (document.getElementsByClassName('stay-fold-btn').length > 0) {
            let stayFoldArr = document.getElementsByClassName('stay-fold-btn');
            for (var i = stayFoldArr.length - 1; i >= 0; i--) {
                stayFoldArr[i].remove();
            }
        }
        //toast the player with the most chips
        game.playerArray.sort(function(a, b) {
            return b.chips - a.chips;
        })
        Materialize.toast(`${game.playerArray[0].name} is the victor with ${game.playerArray[0].chips} chips!`, 9000, 'red');
        //toast the other players and their chip counts
        for (var i = 1; i < game.playerArray.length; i++) {
            Materialize.toast(`${game.playerArray[i].name} finishes with ${game.playerArray[i].chips} chips!`, 9000);
        }
        //if players were eliminated, display them
        if (game.playersOut.length > 0) {
            for (var i = 0; i < game.playersOut.length; i++) {
                Materialize.toast(`${game.playersOut[i].name} was eliminated with ${game.playersOut[i].chips} chips`, 10000, 'red');
            }
        }
        //if one player remains, give all the chips in the pot to the remaining player.
        if (game.playerArray.length === 1) {
            game.playerArray[0].recieveChips(game.pot.giveChips(game.pot.chips));
        }
        game.updateChips();
        //hide the cards
        game.hideCards();
        //remove the quit button
        document.getElementsByClassName('nav-wrapper')[0].removeChild(document.getElementById('quit-btn'));

        //put in a new game button
        document.getElementsByClassName('nav-wrapper')[0].insertAdjacentHTML('beforeend', '            <button class="black dropdown-button btn right" data-activates="newG" id="start-btn">New Game</button>');
        $('.dropdown-button').dropdown();
        //
    }

    dealHands() { //deals hands to all players
        for (var i = 0; i < game.playerArray.length; i++) {
            game.playerArray[i].drawCards(game.deck);
        }
        game.pot.drawCards(game.deck);
    }

    showCardBacks() {
        document.getElementById('pot-im1').setAttribute('src', `cardImage/cardBack.jpg`);
        document.getElementById('pot-im2').setAttribute('src', `cardImage/cardBack.jpg`);
        for (var i = 0; i < game.playerArray.length; i++) {
            document.getElementById(`${game.playerArray[i].name}-im1`).setAttribute('src', `cardImage/cardBack.jpg`);
            document.getElementById(`${game.playerArray[i].name}-im2`).setAttribute('src', `cardImage/cardBack.jpg`);
        }
    }

    hideCards() { //hides all cards on the board
        document.getElementById('pot-im1').setAttribute('src', `cardImage/Green.png`);
        document.getElementById('pot-im2').setAttribute('src', `cardImage/Green.png`);
        for (var i = 0; i < game.playerArray.length; i++) {
            document.getElementById(`${game.playerArray[i].name}-im1`).setAttribute('src', `cardImage/Green.png`);
            document.getElementById(`${game.playerArray[i].name}-im2`).setAttribute('src', `cardImage/Green.png`);
        }
    }

    updateChips() { //update the chip counts
        for (var i = 0; i < game.playerArray.length; i++) {
            document.getElementById(`${game.playerArray[i].name}Chips`).textContent = `${game.playerArray[i].name} Chips: ${game.playerArray[i].chips}`;
        }
        document.getElementById('potChips').textContent = `Pot: ${game.pot.chips}`;
    }

    ante() {
        //if a player is out and they still have chips left, put them back in!
        for (var i = 0; i < game.playersOut.length; i++) {
            let player = game.playersOut.pop();
            if (player.chips > 0) {
                Materialize.toast(`${player.name} is back in!`)
                game.playerArray.push(player);
            }
        }
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
        game.showCardBacks(); //set the images of the players hand
        game.stayOrFold();
        game.enableListener = true;
    }
    stayOrFold() {
        this.stayOrFoldedCounter = 0; //counts how many players fold/stay
        //get rid of the deal button
        document.getElementById('pot').removeChild(document.getElementById('deal-button'));
        //set the play or fold buttons
        for (var i = 0; i < game.playerArray.length; i++) {
            document.getElementById(`${game.playerArray[i].name}`).insertAdjacentHTML('beforeend', `<button class="btn red ${game.playerArray[i].name} stay-fold-btn" id="${game.playerArray[i].name}-stay">Stay</button>`); //stay button

            document.getElementById(`${game.playerArray[i].name}`).insertAdjacentHTML('beforeend', `<button class="btn black ${game.playerArray[i].name} stay-fold-btn" id="${game.playerArray[i].name}-fold">Fold</button>`); //fold button

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
                    game.reveal(); //if this is the last click, run next function
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
                    game.reveal();
                }
            });
        }
    }
    reveal() {
        game.enableListener = false;
        //set a reveal button and kill it when it's clicked and executes
        document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="reveal-button">Reveal</button>`);
        document.getElementById('reveal-button').addEventListener('click', (evt) => {
            evt.target.remove();
            game.flipAndExchange();
        });
    }

    flipAndExchange() {
        //function that shows the players hands.
        function showHands() {
            for (var i = 0; i < playersIn.length; i++) {
                document.getElementById(`${playersIn[i].name}-im1`).setAttribute('src', `${playersIn[i].hand[0].image}`);
                document.getElementById(`${playersIn[i].name}-im2`).setAttribute('src', `${playersIn[i].hand[1].image}`);
            }
        }

        let playersIn = []; //stores the players that don't fold
        for (var i = 0; i < game.playerArray.length; i++) {
            if (game.playerArray[i].in == true) {
                playersIn.push(game.playerArray[i]);
            }
        }

        if (playersIn.length == 0) { //if everyone folds
            //everyone must re-ante
            for (var i = 0; i < game.playerArray.length; i++) {
                game.pot.recieveChips(game.playerArray[i].giveChips(10));
            }
            Materialize.toast('Everyone Folded, everyone re-antes', 3000);
        }
        //if only one player is in
        else if (playersIn.length === 1) {
            //flip the pot cards
            document.getElementById('pot-im1').setAttribute('src', `${game.pot.hand[0].image}`);
            document.getElementById('pot-im2').setAttribute('src', `${game.pot.hand[1].image}`);
            //show the players cards
            showHands();
            //check winner, exchange chips;
            let winner = game.compareHands(playersIn[0], game.pot);
            Materialize.toast(`${playersIn[0].name} held`, 5000);
            Materialize.toast(`${winner.name} wins ${game.pot.chips} chips!`, 5000, 'red');
            winner.recieveChips(playersIn[0].giveChips(game.pot.chips));
            winner.recieveChips(game.pot.giveChips(game.pot.chips));
            //set new round button if the pot is empty
            if (game.pot.chips === 0) {
                document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="ante-button">New Round</button>`);
                document.getElementById('ante-button').addEventListener('click', game.ante)
            }
        } else {

            showHands(); //show the hands of everyone that is in.
            let winner = playersIn[0]; //find the winner
            Materialize.toast(`${playersIn[0].name} held`, 5000);
            for (var i = 1; i < playersIn.length; i++) {
                Materialize.toast(`${playersIn[i].name} held`, 5000);
                winner = game.compareHands(playersIn[i], winner);
            }
            Materialize.toast(`${winner.name} wins!`, 6000, 'red'); //congratulate them
            for (var i = 0; i < playersIn.length; i++) { //exchange chips
                if (playersIn[i] !== winner) { //toast exchanges
                    Materialize.toast(`${playersIn[i].name} pays ${game.pot.chips} chips`, 6500);
                    winner.recieveChips(playersIn[i].giveChips(game.pot.chips));
                }
            }
        }
        //  if a player doesn't have enough chips, boot them!
        for (var i = 0; i < game.playerArray.length; i++) {
            if (game.playerArray[i].chips < 0) {
                Materialize.toast(`${game.playerArray[i].name} is out of chips!`, 5000);
                document.getElementById(`${game.playerArray[i].name}-im1`).setAttribute('src', `cardImage/Green.png`);
                document.getElementById(`${game.playerArray[i].name}-im2`).setAttribute('src', `cardImage/Green.png`);
                game.updateChips();
                game.playersOut.push(game.playerArray.splice(i, 1)[0]);
            }
        }
        //if all but one player is out and the pot is empty, the remaining player wins!
        if (game.playerArray.length === 1) {
            game.endGame();
        } else if (game.pot.chips !== 0) { //add deal button for a new hand
            document.getElementById('pot').insertAdjacentHTML('beforeend', `<button class="btn red" id="deal-button">Next Hand</button>`);
            game.dealHands();
            document.getElementById('deal-button').addEventListener('click', () => game.deal());
        }
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
}
let game;
document.getElementById('two-player').addEventListener('click', () => {
    game = new Game(2);
});
document.getElementById('three-player').addEventListener('click', () => {
    game = new Game(3);
});
