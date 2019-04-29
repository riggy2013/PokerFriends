
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
//                  A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, sJ, lJ
// 13 is reserved for curPoint
var cardRank = [0, 12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15];

var  Suit = cc.Enum({
    n: 0, // null
    d: 1, // diamond
    c: 2, // club
    h: 3, // heart
    s: 4, // spade
    j: 5, // joker, NT
});

// class of  card
class Card {
    suit; // 1: diamond, 2, club, 3, heart, 4, spade, 5: joker
    point; // 1: A, 2~10: 11:J, 12:Q, 13:K, 14: small Joker, 15: large Joker
    _id;

    constructor(suitOrId, point) {
        if (arguments.length === 1) {
            this._id = suitOrId;
            this.suit = Math.floor(suitOrId/13) + 1;
            if (this.suit < 5)
                this.point = suitOrId%13 + 1;
            else // suit == 4
                this.point = suitOrId%13 + 14;
        } else if (arguments.length >= 2) {
            this.suit = suitOrId;
            this.point = point;
        }
    }

    get suitName() {
        return Suit[this.suit];
    }

    isTrump(curBid) {
        if (this.point == curBid.point || this.point == 14 
            || this.point == 15 || this.suit == curBid.suit)
            return true;
        return false;
    }

    // return true if thisCard > bCard
    sortPos(bCard, curBidCard) {
        cardRank[curBidCard.point] = 13;
        if (this.isTrump(curBidCard) && !bCard.isTrump(curBidCard))
            return 1;
        else if (!this.isTrump(curBidCard) && bCard.isTrump(curBidCard))
            return -1;
        else if (this.isTrump(curBidCard) && bCard.isTrump(curBidCard)) {
            if (this.suit == bCard.suit)
                return cardRank[this.point] - cardRank[bCard.point];
            else
                return this.suit - bCard.suit;
        } else { // not trump cards
            if (this.suit != bCard.suit)
                return this.suit - bCard.suit;
            else
                return cardRank[this.point] - cardRank[bCard.point];
        }
    }
}

Card.prototype.toString =  function() {
    return this.point + this.suitName;
};

class Bid {
    length;
    card;

    constructor(idList) {
        const allEqual = arr =>  arr.every (v => v === arr[0]);

        if  (idList.length == 0 || !allEqual(idList)) {
            length = 0;
            card = new Card(0, 2);
        }

        length = idList.length;
        card = new Card(idList[0]);
    }

    compare(curBid) {
        if (this.length > curBid.length) {
            return true;           
        } else if (this.length == curBid.length) {
            if (this.card.point > curBid.card.point)
                return true;
            else
                return false;
        } else
            return false;
    }
}

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
