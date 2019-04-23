
const numCardInDeck = 54;
var numDeck = 2;
var numPlayer = 5; // 4~7
var numTotalCards = numDeck * numCardInDeck;
const numFaceDownCards = [8, 8, 6, 8];
var numCardsEachPlayer = (numTotalCards - numFaceDownCards[numPlayer-4]) / numPlayer;
const cardScale = 0.75;
const cardWidth = 108*cardScale;
const cardHeight = 144*cardScale;
const midPointX = 0;
const upperRowBaseY = -150;
const lowerRowBaseY = -250;
const cardRise = 25;
const hAlignEnum = {
    "Left": 1,
    "Center": 2,
    "Right": 3 
};
Object.freeze(hAlignEnum);

var  Suit = cc.Enum({
    d: 1, // diamond
    c: 2, // club
    h: 3, // heart
    s: 4, // spade
    j: 5, // joker
});

// class of  card
function Card (point, suit) {
    Object.defineProperties(this, {
        point: {
            value: point, // 1:A, 2~10, 11:J, 12:Q, 13:K, 14: small Joker, 15: large Joker 
            writable: true
        },
        suit: {
            value: suit,
            writable: true
        },

        suitName: {
            get: function() {
                return  Suit[this.suit];
            }
        },
    });

    Object.defineProperty(this, 'id', {
        get() {
            return this._id;
        },
        set(value) { // value 0~53, 0~12: club, 13~25: diamond, 26~38: heart, 39~51: spade
                    // 52: small Joker, 53: large Joker
            this._id = value;
            this.suit = Math.floor(value/13) + 1;
            if (this.suit < 5)
                this.point = value%13 + 1;
            else // suit == 5
                this.point = value%13 + 14;
        }
    });
}

Card.prototype.toString =  function() {
    return this.point + this.suitName;
};

module.exports = {
    Suit: Suit,
    Card: Card,
    numCardInDeck,
    numDeck,
    numPlayer,
    numTotalCards,
    numFaceDownCards,
    numCardsEachPlayer,
    cardScale,
    cardHeight,
    cardWidth,
    midPointX,
    upperRowBaseY,
    lowerRowBaseY,
    cardRise,
    hAlignEnum
};
