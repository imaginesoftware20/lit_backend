const person = require('./person.js');
const { isNull } = require('lodash');

module.exports = function () {
    /** 
     * Mapping every card to its half-suite
    */
    var mapping = new Map([ 
        ["spades_2","spades_lower"], ["spades_3","spades_lower"], ["spades_4","spades_lower"],
        ["spades_5","spades_lower"], ["spades_6","spades_lower"], ["spades_7","spades_lower"],
        ["spades_9","spades_higher"], ["spades_t","spades_higher"], ["spades_j","spades_higher"],
        ["spades_q","spades_higher"], ["spades_k","spades_higher"], ["spades_a","spades_higher"],
        ["hearts_2","hearts_lower"], ["hearts_3","hearts_lower"], ["hearts_4","hearts_lower"], 
        ["hearts_5","hearts_lower"], ["hearts_6","hearts_lower"], ["hearts_7","hearts_lower"],
        ["hearts_9","hearts_higher"], ["hearts_t","hearts_higher"], ["hearts_j","hearts_higher"], 
        ["hearts_q","hearts_higher"], ["hearts_k","hearts_higher"], ["hearts_a","hearts_higher"], 
        ["clubs_2","clubs_lower"], ["clubs_3","clubs_lower"], ["clubs_4","clubs_lower"], 
        ["clubs_5","clubs_lower"], ["clubs_6","clubs_lower"], ["clubs_7","clubs_lower"], 
        ["clubs_9","clubs_higher"], ["clubs_t","clubs_higher"], ["clubs_j","clubs_higher"], 
        ["clubs_q","clubs_higher"], ["clubs_k","clubs_higher"], ["clubs_a","clubs_higher"], 
        ["diamonds_2","diamonds_lower"], ["diamonds_3","diamonds_lower"], ["diamonds_4","diamonds_lower"], 
        ["diamonds_5","diamonds_lower"], ["diamonds_6","diamonds_lower"], ["diamonds_7","diamonds_lower"], 
        ["diamonds_9","diamonds_higher"], ["diamonds_t","diamonds_higher"], ["diamonds_j","diamonds_higher"], 
        ["diamonds_q","diamonds_higher"], ["diamonds_k","diamonds_higher"], ["diamonds_a","diamonds_higher"], 
        ["diamonds_8","jokers"], ["spades_8","jokers"], ["hearts_8","jokers"], 
        ["clubs_8","jokers"], ["joker_b","jokers"], ["joker_r","jokers"] ]); 
    
    var card_names = new Map([
        ["a","A"], ["k","K"], ["q","Q"], ["j","J"], ["t","10"], ["9","9"], ["8","8"], ["7","7"], ["6","6"],
        ["5","5"], ["4","4"], ["3","3"], ["2","2"],
    ]);
//  Q 10 9 8 7 6 5 4 3 2
    var set_symbol = new Map([
        ["spades","♠️"], ["hearts","♥️"], ["clubs","♣️"], ["diamonds","♦️"]
    ]);

    this.validate_key = function(code)
    {
        // Decode the Key from Header
        const words = this.words(code);

        //Check if the hit is genuine
        if(words[0] !== this.key())
        {
            return false;
        }

        return true;
    }

    this.set_name = function(cardsa, cardsb, cardsc)
    {
        if(cardsa.length!==0)
        return mapping.get(cardsa[0]);
        else if(cardsb.length!==0)
        return mapping.get(cardsb[0]);
        else
        return mapping.get(cardsc[0]);
    }    

    this.edit_set_name = function(set)
    {
        if(set === "jokers")
        return set.charAt(0).toUpperCase() + set.slice(1)
        var setName = set.split("_");
        return setName[1].charAt(0).toUpperCase() + setName[1].slice(1) + " " + set_symbol.get(setName[0]);
    }

    this.edit_card_string = function(card)
    {
        var num = card.charAt(card.length-1);
        var setname = card.substring(0,card.length-2);
        if(num === 'b')
        {
            return "Black Joker";
        }
        if(num === 'r')
        {
            return "Red Joker";
        }
        return card_names.get(num) + set_symbol.get(setname);
    }

    function compare(a , b) 
    {
        try
        {
            var startA = a.charAt(0);
            var startB = b.charAt(0);
            var endA = a.charAt(a.length-1);
            var endB = b.charAt(b.length-1);
            if (startA === 'j' || endA === '8') {
                return 1;
            }
            if (startB === 'j' || endB === '8') {
                return -1;
            }
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }

            // names must be equal
            return 0;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    function update_cards(db, gameid, pa, playera) 
    {
        try
        {
            var Ref = db.ref(gameid);

            //Update alias in db
            var usersRefa = Ref.child(playera);
            usersRefa.update({
                "cards": pa,
                "no_of_cards": pa.length
            });
            return;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            //return err;
        }
    }
    
    this.words = function(code)
    {
        try
        {
            let buff = new Buffer(code, 'base64');
            let text = buff.toString('ascii');
            return text.split(':');
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    //Create Gameid by adding timestamp to a random string
    this.randomstr = function()
    {
        try 
        {          
            let dt = String(new Date());
            let dtstr = dt.toString().split(" ").join("");
            let result           = '';
            let characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for ( let i = 0; i < 4; i++ ) 
            {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;

        }
        catch(err) 
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    this.shuffle = function()
    {
        try
        {
            var deck = new Map([ [1,"spades_2"], [2,"clubs_a"], [3,"diamonds_7"], [4,"hearts_4"], [5,"clubs_3"], 
            [6,"diamonds_8"], [7,"hearts_7"], [8,"clubs_k"], [9,"clubs_2"], [10,"spades_q"], 
            [11,"hearts_j"], [12,"spades_3"],[13,"hearts_2"], [14,"clubs_q"], [15,"diamonds_6"], 
            [16,"spades_8"], [17,"diamonds_9"], [18,"spades_a"], [19,"diamonds_5"], [20,"clubs_j"],
            [21,"diamonds_a"], [22,"hearts_9"],[23,"spades_4"], [24,"clubs_t"], [25,"diamonds_t"], 
            [26,"hearts_5"], [27,"spades_9"], [28,"clubs_9"], [29,"hearts_3"], [30,"hearts_a"],
            [31,"spades_k"], [32,"clubs_8"],[33,"diamonds_4"], [34,"diamonds_j"], [35,"spades_5"], 
            [36,"hearts_t"], [37,"clubs_7"], [38,"spades_t"], [39,"hearts_8"], [40,"diamonds_3"], 
            [41,"clubs_6"], [42,"diamonds_q"],[43,"joker_r"], [44,"spades_6"], [45,"hearts_6"], 
            [46,"diamonds_k"], [47,"clubs_5"], [48,"diamonds_2"], [49,"spades_j"], [50,"hearts_k"], 
            [51,"hearts_q"], [52,"joker_b"],[53,"spades_7"], [54,"clubs_4"] ]); 

            var j;

            var shuffle = new Map();

            for(j = 0; j < 54; j++)
            {
                for(;;)
                {
                    rancard = Math.floor(Math.random() * (54)) + 1;
                    var card = deck.get(rancard);
                    if(shuffle.has(card))
                    {
                        continue;
                    }
                    else
                    {
                        shuffle.set(card,0);
                        break;
                    }   
                }
            }
            return shuffle;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    this.cards = function(shuffle)
    {
        try 
        {
            var j, p1 = [], p2 = [], p3 = [], p4 = [], p5 = [], p6 = [];

            const iterator = shuffle.keys();

            for(j = 0; j < 54; j++)
            {
                switch(j%6) 
                {
                case 0:
                    p1.push(iterator.next().value);
                    break;
                case 1:
                    p2.push(iterator.next().value);
                    break;
                case 2:
                    p3.push(iterator.next().value);
                    break;
                case 3:
                    p4.push(iterator.next().value);
                    break;
                case 4:
                    p5.push(iterator.next().value);
                    break;
                case 5:
                    p6.push(iterator.next().value);
                    break;
                }
            }
            
            p1.sort(compare);
            p2.sort(compare);
            p3.sort(compare);
            p4.sort(compare);
            p5.sort(compare);
            p6.sort(compare);

            return new person(p1, p2, p3, p4, p5, p6);
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    this.key = function()
    {
        //let data = 'aW1hZ2luZS5zb2Z0d2FyZQ==:qw12';
        //let buff = new Buffer(data);
        //let bata = buff.toString('base64');
        return "aW1hZ2luZS5zb2Z0d2FyZQ==";
    }

    this.update_logs = function(db, gameid, logs, logs_count, current_log)
    {
        try 
        {
            if(logs[0] === "none")
            {
                logs = [];
            }
            if(logs.length === logs_count)
            {
                logs.splice(0,1);
            }
            logs.push(current_log);

            var Ref = db.ref();

            //Update logs in DB
            var usersRef = Ref.child(gameid);
            usersRef.update({
                "logs": logs
            });

            return;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            //return err;
        }
    }

    this.transac = function(pa, pb, card, db, gameid, playera, playerb, aliasa, aliasb, logs, logs_count)
    {
        var current_log;
        try
        {
            if(pb.includes(card))
            {
                //Remove card from Second Player's Hand            
                pb.splice(pb.indexOf(card),1);
                
                //Add card to First Player's Hand
                pa.push(card);
                pa.sort(compare);
                
                update_cards(db, gameid, pa, playera); 
                update_cards(db, gameid, pb, playerb); 

                current_log = aliasa + " took " + this.edit_card_string(card) + " from " + aliasb;
                this.update_logs(db, gameid, logs, logs_count, current_log);
                return true;
            }
            else
            {
                current_log = aliasb + " denied " + aliasa + " for " + this.edit_card_string(card);
                this.update_logs(db, gameid, logs, logs_count, current_log);
                return false;
            }
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    this.setdrop = function(db, gameid, success)
    {
        try
        {   
            var Ref = db.ref();

            //Update Cards of players in DB
            var usersRef = Ref.child(gameid);   
            usersRef.update({
                "last_transaction_drop": success
            });
            
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            //return err;
        }
    }

    this.transf = function(db, gameid, playerb)
    {
        try
        {   
            var Ref = db.ref();

            //Update Cards of players in DB
            var usersRef = Ref.child(gameid);
            usersRef.update({
                "turn": parseInt(playerb)
            });
            return true;

        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return false;
        }     
    }

    this.setscore = function(playera, db, gameid, success, score_odd, score_even)
    {
        try
        {
            var final;
            var ref = db.ref();
            var usersRef = ref.child(gameid);
                
            if((playera%2===0 && success === true) || (playera%2!==0 && success === false))
            {
                final = parseInt(score_even) + 1;
                usersRef.update({
                    "score_even": parseInt(final)
                });
            }
            else if((playera%2===0 && success  === false) || (playera%2!==0 && success === true))
            {
                final = parseInt(score_odd) + 1;
                usersRef.update({
                    "score_odd": parseInt(final)
                });
            }
            
            return true;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    this.wrongdrop = function(db, gameid, dropped_set, plcards)
    {
        try
        {
            var i;
            for (let [playerno, playercards] of plcards) 
            {
                for (i = 0; i < playercards.length; )
                {
                    if(mapping.get(playercards[i]) === dropped_set)
                    {
                        playercards.splice(i,1);
                    }
                    else i++;
                }
                update_cards(db, gameid, playercards, playerno); 
            }
            return;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            //return err;
        }
    }

    this.drop = function(cardsa, cardsb, cardsc, db, gameid, dropped_sets, plcards, setName)
    {
        try
        {
            var i=0;
            
            dropped_sets.push(setName);
            if(dropped_sets[0] === "none")
            {
                dropped_sets.splice(0,1);
            }
            
            var ref = db.ref();
            var usersRef = ref.child(gameid);
            //Update Cards of players in DB
            usersRef.update({
                "dropped_sets": dropped_sets
            });

            var keys = Array.from(plcards.keys());

            var playera = keys[i++];
            var pa = plcards.get(playera);
            var playerb = keys[i++];
            var pb = plcards.get(playerb);
            var playerc = keys[i++];
            var pc = plcards.get(playerc);

            for (i = 0; i < cardsa.length; i++)
            {
                if(!pa.includes(cardsa[i]))
                {
                    return false ;
                }
                else
                {
                    pa.splice(pa.indexOf(cardsa[i]),1);
                }
            }
            for (i = 0; i < cardsb.length; i++)
            {
                if(!pb.includes(cardsb[i]))
                {
                    return false ;
                }
                else
                {
                    pb.splice(pb.indexOf(cardsb[i]),1);
                }
            }
            for (i = 0; i < cardsc.length; i++)
            {
                if(!pc.includes(cardsc[i]))
                {
                    return false ;
                }
                else
                {
                    pc.splice(pc.indexOf(cardsc[i]),1);
                }
            }
                       
            update_cards(db, gameid, pa, playera); 
            update_cards(db, gameid, pb, playerb); 
            update_cards(db, gameid, pc, playerc); 

            return true;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
    }

    this.checkIfAllDisconnected = function(newPost){ 
        var allDisconnected = 1;
        for(var player=1;player<=6;player++){
            if(newPost[player]["connected"] === true){
                allDisconnected = 0;
                break;
            }
        }

        return allDisconnected;
    }
}