const person = require('./person.js');

module.exports = function () {
    
    
    this.words = function(code)
    {
        let buff = new Buffer(code, 'base64');
        let text = buff.toString('ascii');
        return text.split(':');
    }

    //Create Gameid by adding timestamp to a random string
    this.randomstr = function()
    {
        try 
        {          
            let dt = String(new Date());
            let dtstr = dt.toString().split(" ").join("");
            let result           = '';
            let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for ( let i = 0; i < 10; i++ ) 
            {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result + dtstr.substring(0,dtstr.search("GMT")) + Date.now();

        }catch(err) 
        {
            return err + "     \n    " + err.message;
        }
    }

    this.shuffle = function()
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

    this.cards = function(shuffle)
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
        
        p1.sort();
        p2.sort();
        p3.sort();
        p4.sort();
        p5.sort();
        p6.sort();

        return new person(p1, p2, p3, p4, p5, p6);
    }

    this.key = function()
    {
        //let data = 'aW1hZ2luZS5zb2Z0d2FyZQ==:qw12';
        //let buff = new Buffer(data);
        //let bata = buff.toString('base64');
        return "aW1hZ2luZS5zb2Z0d2FyZQ==";
    }

    this.transac = function(pa, pb, card, db, gameid, playera, playerb)
    {
        if(pb.includes(card))
        {
          try
          {
            //Remove card from Second Player's Hand            
            pb.splice(pb.indexOf(card),1);
            
            //Add card to First Player's Hand
            pa.push(card);
            pa.sort();
            
            var Ref = db.ref(gameid);

            //Update Cards of players 1 in DB
            var usersRefa = Ref.child(playera);
            usersRefa.set({
              "cards": pa
            });

            //Update Cards of players 2 in DB
            var usersRefb = Ref.child(playerb);
            usersRefb.set({
              "cards": pb
            });

          }
          catch(err)
          {
            console.log(err + "     \n    " + err.message);
          }
          
          return true;
        }
        else
        {            
            return false ;
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
                "turn": playerb,
                "last_transaction_drop": "false"
            });

        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
        }
        
     
    }


    this.drop = function(pa, pb, pc, cardsa, cardsb, cardsc, db, gameid, playera, playerb, playerc, score, dropped_sets)
    {
        var i;
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
        try
        {               
            var Ref = db.ref(gameid);

            //Update alias in db
            var usersRefa = Ref.child(playera);
            usersRefa.set({
                "cards": pa
            });
            var usersRefb = Ref.child(playerb);
            usersRefb.set({
                "cards": pb
            });
            var usersRefc = Ref.child(playerc);
            usersRefc.set({
                "cards": pc
            });

            var scores = score.split(':');
            var final;
            if(playera%2===0)
            {
                final = String(scores[0]) + ":" + (parseInt(scores[1])+1);
            }
            else
            {
                final = String(parseInt(scores[0])+1) + ":" + scores[1];
            }
            
            var dropped_card = cardsa[0];
            var current_dropped_set = "";
            var card_length = dropped_card.length-1;
            var card_numb = dropped_card.charAt(card_length);
            var prefix = dropped_card.substring(0,card_length);
            
            if(card_numb==='7' || card_numb==='6' || card_numb==='5' || card_numb==='4' || card_numb==='3' || card_numb==='2')
            {
                current_dropped_set = current_dropped_set + prefix + "lower";
            }
            else if(card_numb==='a' || card_numb==='k' || card_numb==='q' || card_numb==='j' || card_numb==='t' || card_numb===9)
            {
                current_dropped_set = current_dropped_set + prefix + "higher";
            }
            else if(card_numb==='b' || card_numb==='r' || card_numb===8)
            {
                current_dropped_set = current_dropped_set + "jokers";
            }
            
            if(dropped_sets === "")
            {
                dropped_set = [];
            }
            else
            {
                dropped_set = dropped_sets;
            }
            dropped_set.push(current_dropped_set);

            var ref = db.ref();

            //Update Cards of players in DB
            var usersRef = ref.child(gameid);
            usersRef.update({
                "last_transaction_drop": "true",
                "score": final,
                "dropped_sets": dropped_set
            });
            
            return true;
        }
        catch(err)
        {
            console.log(err + "     \n    " + err.message);
            return err;
        }
        

    }
}
