var Common = require("Common");
var webSocket = require("websocket");
var sentData = false;

var date = new Date();
var curPlayId = 0;
var curBid = {
    length: 0,
    card: {
        suit: 0,
        point: 2,
    },
};
var curPoint = 2;

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        button: {
            default: null,
            type: cc.Button
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!',
        localNodeList: [cc.Node],
        selCards: [],
        gameState: 0,
    },

    listenEvents() {
        this.node.on(cc.Node.EventType.TOUCH_START,  function (event) {
            this.onChooseStart(event);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END,  function (event) {
            this.onChooseEnd(event);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,  function  (event) {
            this.onChooseEnd(event);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.onChooseMove(event);
        }, this);
    },

    onChooseStart(event) {
        var mousePos = this.node.convertToNodeSpaceAR(event.getLocation());
 //       console.log("Start: " +  mousePos);
        for (let i in this.localNodeList) {
            this.selCards[i] = false; // reset select cards
            var nodeBox = new cc.Rect(this.localNodeList[i].x-Common.cardWidth/2, this.localNodeList[i].y-Common.cardHeight/2,
                 Common.cardWidth/2, this.localNodeList[i].choose ? Common.cardHeight-Common.cardRise : Common.cardHeight);
            if (nodeBox.contains(mousePos)) {
                this.selCards[i] = true;
            };
        }
    },
    
    onChooseEnd(event) {
        var  mousePos = this.node.convertToNodeSpaceAR(event.getLocation());
//        console.log("End: " + mousePos);
        for (let i in this.localNodeList) {
            var nodeBox = new cc.Rect(this.localNodeList[i].x-Common.cardWidth/2, this.localNodeList[i].y-Common.cardHeight/2,
                 Common.cardWidth/2, this.localNodeList[i].choose ? Common.cardHeight-Common.cardRise : Common.cardHeight);
            if (nodeBox.contains(mousePos)) {
                this.selCards[i] = true;
            };

            if (this.selCards[i]) {
                if (this.localNodeList[i].choose) { // select a raised card, now de-choose and lower.
                    this.localNodeList[i].setPosition(this.localNodeList[i].x, this.localNodeList[i].y-Common.cardRise);
                    this.localNodeList[i].attr({choose: false});
                } else { // select a lowered card, set choose and raise.
                    this.localNodeList[i].setPosition(this.localNodeList[i].x, this.localNodeList[i].y+Common.cardRise);
                    this.localNodeList[i].attr({choose: true});
                }

            }

        }
    },

    onChooseMove(event) {
        var mousePos = this.node.convertToNodeSpaceAR(event.getLocation());
//        console.log("Moving: " + mousePos);
        for (let i in this.localNodeList) {
            var nodeBox = new cc.Rect(this.localNodeList[i].x-Common.cardWidth/2, this.localNodeList[i].y-Common.cardHeight/2,
                 Common.cardWidth/2, this.localNodeList[i].choose ? Common.cardHeight-Common.cardRise : Common.cardHeight);
            if (nodeBox.contains(mousePos)) {
                this.selCards[i] = true;
            };
        }
    },


    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;

        // Show local Cards
//        var localCardList = [5, 5, 52, 53, 1, 4, 6, 9, 15, 18, 33, 33, 18, 9, 7, 23, 45, 31, 22, 19, 13, 14, 20, 20, 21];

        // generate nodes
//        this.localNodeList = this.genNodeList(localCardList);

        // show local nodes
//        this.showLocalNodes(this.localNodeList);


//        var h0CardList = [0, 0, 12];
        var h1CardList = [5, 6, 7];
        var h2CardList = [3, 3, 10];
        var h3CardList = [9, 9, 8];
        var h4CardList = [12, 12, 10];

//        var h0BaseV2 = cc.v2(0, 0);
        var h1BaseV2 = cc.v2(300, 100);
        var h2BaseV2 = cc.v2(300, 250);
        var h3BaseV2 = cc.v2(-300, 100);
        var h4BaseV2 = cc.v2(-300, 250);

        //var h0NodeList = this.genNodeList(h0CardList);
        //this.setNodeListPos(h0NodeList, h0BaseV2, Common.hAlignEnum.Center);
        var h1NodeList = this.genNodeList(h1CardList);
        this.setNodeListPos(h1NodeList, h1BaseV2, Common.hAlignEnum.Right);
        var h2NodeList = this.genNodeList(h2CardList);
        this.setNodeListPos(h2NodeList, h2BaseV2, Common.hAlignEnum.Right);
        var h3NodeList = this.genNodeList(h3CardList);
        this.setNodeListPos(h3NodeList, h3BaseV2, Common.hAlignEnum.Left);
        var h4NodeList = this.genNodeList(h4CardList);
        this.setNodeListPos(h4NodeList, h4BaseV2, Common.hAlignEnum.Left);

        this.listenEvents();



    },

    start() {

        webSocket.connect("ws://localhost:8001");
 //       console.log("webSocket state of " + webSocket.sock.readyState + " at " + date);

        this.gameState = 0;
 //       if (webSocket.readyState === webSocket.OPEN) {
 //           webSocket.send_data("hello, world!");
 //       }

//        webSocket.close();

    },

    gameFSM: function () {
        switch(this.gameState) {
            case 0: // init
                var label = this.button.getComponentInChildren(cc.Label);
                if (label.string == "叫牌") {
                    if (webSocket.sock.readyState === webSocket.sock.OPEN) {
                        webSocket.send_data(JSON.stringify({
                            state: 0,
                            ctype: "start",
                        }));
                    }
                    this.gameState = 1; // waiting dist cards
                }
                break;
            case 1: // waiting dist cards
                if (webSocket.msgArray.length != 0) {
                    var newMsg = webSocket.msgArray.shift();

                    var newData = JSON.parse(newMsg);

                    if (newData.state == 1 && newData.ctype == "dist" && newData.player == curPlayId) {
                        var newNode = this.genNode(newData.card);
                        newNode.attr({choose:false});
                        this.insertNode(this.localNodeList, newNode);
                        this.selCards.push(false);

                                // show local nodes
                         this.showLocalNodes(this.localNodeList);

                    }
                }
                break;

        }
    },

    // called every frame
    update: function () {

        if (webSocket.sock.readyState === webSocket.sock.OPEN) {
//            console.log("update at " + date + " when socket state " + webSocket.sock.readyState + " game state " + this.gameState);
//            webSocket.send_data("hello, world!");
            this.gameFSM();
        }


    },

    genNode: function (cardId) {

        var node = new cc.Node();
        node.scale = Common.cardScale;
        node.parent = this.node;
        node.attr({cardId: cardId});
        var sprite = node.addComponent(cc.Sprite);
        cc.loader.loadRes("cards", cc.SpriteAtlas, function(err, atlas) {
            var aCard = new Common.Card(cardId);
            var frame = atlas.getSpriteFrame(aCard.toString());
            sprite.spriteFrame = frame;
        });

        return node;
    },

    insertNode: function (nodeList, newNode) {
        // this is a simple but not optimal solution. As it is a small list, it is ok.
        nodeList.push(newNode); 


        nodeList.sort(function(a,b) {
//            return b.cardId-a.cardId; 
            var aCard = new Common.Card(a.cardId);
            var bCard = new Common.Card(b.cardId);

            return(bCard.sortPos(aCard, curBid.card));
        }); // TODO: sort with trump card.

        return nodeList;
    },

    genNodeList: function (cardList) {
        var nodeList = new Array();

        cardList.sort(function(a, b) { return b-a}); // TODO: sort with trump card.

        for (let i in cardList) {
            var node = this.genNode(cardList[i]);
            nodeList.push(node);
        }

        return nodeList;
    },

    setNodeListPos: function (nodeList, baseV2, alignType, baseZIndex = 0) {

        var nodeListWidth = 0.5 * (nodeList.length + 1) * Common.cardWidth;
        var adjustX;

        switch(alignType) {
            case Common.hAlignEnum.Left:
                adjustX = 0;
                break;
            case Common.hAlignEnum.Center:
                adjustX = -nodeListWidth/2;
                break;
            case Common.hAlignEnum.Right:
                adjustX = -nodeListWidth;
                break;
            default:
                adjustX = 0;
        }

        var baseLeftV2 = baseV2.add(cc.v2(adjustX, 0));

        for (let i=0; i < nodeList.length; ++i) {
            if (nodeList[i].choose) // raise if choose
                nodeList[i].setPosition(baseLeftV2.x+Common.cardWidth/2, baseLeftV2.y+Common.cardRise);
            else
                nodeList[i].setPosition(baseLeftV2.x+Common.cardWidth/2, baseLeftV2.y);
            nodeList[i].zIndex = i + baseZIndex;
            baseLeftV2.addSelf(cc.v2(Common.cardWidth/2, 0));
        }
    },

    showLocalNodes: function (nodeList) {
        // split into 2 if too many cards
        var maxNumCardsPerRow = Math.ceil(Common.numCardsEachPlayer/2);
        var upperNodeList, lowerNodeList;
        var numCards = nodeList.length;

        if (numCards <= maxNumCardsPerRow) {
            upperNodeList = [];
            lowerNodeList = nodeList;
        } else {
            upperNodeList = nodeList.slice(0, Math.floor(numCards/2));
            lowerNodeList = nodeList.slice(Math.floor(numCards/2), numCards);
        }
        
        var localUpperCardV2 = cc.v2(Common.midPointX, Common.upperRowBaseY);
        this.setNodeListPos(upperNodeList, localUpperCardV2, Common.hAlignEnum.Center);
        var localLowerCardV2 = cc.v2(Common.midPointX, Common.lowerRowBaseY);
        this.setNodeListPos(lowerNodeList, localLowerCardV2, Common.hAlignEnum.Center, upperNodeList.length);
    },

    btnClick: function (event, customEventData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var label = button.getComponentInChildren(cc.Label);
        var h0NodeList  = [];

        console.log("button clicked with text " + label.string);
        switch (label.string) {
            case "开始":
                label.string = "叫牌";
                break;
            case "叫牌":
                // check legal
                var bidCardList = [];

                for (var localNode of this.localNodeList) {
                    if (localNode.choose) {
                        bidCardList.push(localNode.cardId);
                        console.log("bidCardList items ", localNode.cardId);
                    }
                }

                console.log(bidCardList, curBid, curPoint);
                if (this.bidLegal(bidCardList, curBid, curPoint)) {
                    // bid
                    for (let i=this.localNodeList.length-1; i >= 0; i--) {
                        if (this.localNodeList[i].choose) {
                            h0NodeList.unshift(this.localNodeList[i]);
                            this.localNodeList.splice(i, 1);
                        }
                    }

                    this.showLocalNodes(this.localNodeList);

                    var h0BaseV2 = cc.v2(0, 0);
            
                    this.setNodeListPos(h0NodeList, h0BaseV2, Common.hAlignEnum.Center);

                    if (webSocket.sock.readyState === webSocket.sock.OPEN) {
                        webSocket.send_data(JSON.stringify({
                            state: 1,
                            ctype: "bid",
                            player: curPlayId,
                            numBid: bidCardList.length,
                            cardId: bidCardList[0],
                        }));
                    }


                }
        }

/*       for (let i=this.localNodeList.length-1; i >= 0; i--) {
            if (this.localNodeList[i].choose) {
                h0NodeList.unshift(this.localNodeList[i]);
                this.localNodeList.splice(i, 1);
            }
        }

//        console.log("localNodeList.length = " + this.localNodeList.length + ", h0NodeList.length = " + h0NodeList.length +".");

        this.showLocalNodes(this.localNodeList);

        var h0BaseV2 = cc.v2(0, 0);

        this.setNodeListPos(h0NodeList, h0BaseV2, Common.hAlignEnum.Center);

        
        setTimeout(function() {
//            console.log("Waited for 10 sec");
            // destroy cards
            let lengthH0NodeList = h0NodeList.length;

            for (let i = 0; i < lengthH0NodeList; i++) {
                var h0Node = h0NodeList.pop();

                h0Node.active = 0;
                h0Node.destroy();
            }
        }, 10000);
*/
    },

    bidLegal: function(cardIdList, bid, point) {
        var aCard = new Common.Card();
        var bidCard = new Common.Card();
        const allEqual = arr => arr.every( v => v === arr[0] );

        if (cardIdList.length == 0) // empty?
            return false;

        if (!allEqual(cardIdList))
            return false;

        aCard.id = cardIdList[0];

        if (bid.length > 0) {
            bidCard.id = bid[0];
        }

        if (cardIdList.length == 1) {
            if (aCard.point != point)
                return false;
        } else {
            if (aCard.point != point && aCard.point != 14 && aCard.point != 15)
                return false;
        }

        // if bid is empty
        if (bid.length == 0) {
            bid = cardIdList;
            return true;
        } else if (cardIdList.length < bid.length) {
            return false;
        } else if (cardId.length == bid.length) {
            if (aCard.point > bidCard.point) {
                bid = cardIdList;
                return true;
            }
        } else if (cardId.length > bid.length) {
            bid = cardIdList;
            return true;
        }
    },

});
