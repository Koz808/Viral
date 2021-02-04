import {Gamestate,Card,Source} from './objects.REDO'
import {sources} from './sources'

//! HELPER HELPERS
function shuffle(array:any[]) { 
  let currentIndex=array.length
  let tempValue
  let randomIndex

  while(0!==currentIndex) {
    randomIndex=Math.floor(Math.random()* currentIndex);
    currentIndex-=1
    tempValue=array[currentIndex];
    array[currentIndex]=array[randomIndex];
    array[randomIndex]=tempValue
  }
  return array;
}


function didWin(state:Gamestate) {
  if (state.misinformation.community.debunked===true&& 
    state.misinformation.social.debunked===true&&
    state.misinformation.relations.debunked===true)
  return true 
  else return false; 
}

function didLose(state:Gamestate){
  if (state.chaosMeter===4)
    return true
  if (
    state.misinformation.community.markersLeft===0|| 
    state.misinformation.social.markersLeft===0|| 
    state.misinformation.relations.markersLeft===0
    )
    return true
  if (state.connectionDeck.length===0){
    return true
  }
  return false
}

function createConnectionDeck() {
  let deck:Card[]=[];
  for (const source of sources){
    deck.push({cardType:'connection',sourceName:source.name,misinfoType:source.category});
  }
  return deck;
}

function createMisinformationDeck() {
  let deck:Card[]=[];
  for (const source of sources){
    deck.push({cardType:'misinformation',sourceName:source.name,misinfoType:source.category});
  }
  return deck;
}

function createSources() {
  let array:Source[]=[];
  for (const source of sources){
    array.push({
      name:source.name,
      misinfoType:source.category,
      markers_community:0,
      markers_social:0,
      markers_relations:0,
      canMove:false,
      canLogOn:false,
      canLogOff:false,
      canClearCommunity:false,
      canClearSocial:false,
      canClearRelations:false,
      canShare:[],
      canDebunk:[],
    })
  }
  return array
}

//! SET STATE

function playerOrder(oldState:Gamestate) {
  let players=oldState.players
  let newPlayers=shuffle(players)
  newPlayers[0].isCurrent= true
  let newState={...oldState,newPlayers}
  return newState
}

function insertViralCards(oldState:Gamestate) {

  let oldDeck=oldState.connectionDeck

  const viral1:Card={cardType:"viral",sourceName:null, misinfoType:null}
  const viral2:Card={cardType:"viral",sourceName:null, misinfoType:null}
  const viral3:Card={cardType:"viral",sourceName:null, misinfoType:null}
  let first=oldDeck.slice(0,(oldDeck.length/3))
  let second=oldDeck.slice((oldDeck.length/3),(2*oldDeck.length/3))
  let third=oldDeck.slice((2*oldDeck.length/3),oldDeck.length)

  first.push(viral1)
  second.push(viral2)
  third.push(viral3)

  first=shuffle(first)
  second=shuffle(second)
  third=shuffle(third)

  let connectionDeck=[...first,...second,...third]

  let newState={...oldState,connectionDeck}
  return newState

}

//* spread level will define how many times this function is called 

function dealMisinfoCard (oldState:Gamestate,weight:number,viral:boolean) {
  
  let oldDeck=oldState.misinformationDeckActive
  let drawSource

  if(viral){ 
    drawSource=oldDeck[oldDeck.length-1].sourceName
  }
  else { 
    drawSource=oldDeck[0].sourceName
  }

  for(const source of oldState.sources){
    if(source.name===drawSource){
      while(weight>0){
        if(source[`markers_${source.misinfoType}`]==3){
          
          oldState=outbreak(source,oldState)
        }
        else{
        //* add marker to source
        source[`markers_${source.misinfoType}`]++
        //* remove marker from global bucket
        oldState.misinformation[source.misinfoType].markersLeft--
        didLose(oldState)
        }
        weight--
      }
    }
  }
  if (viral){
    oldState.misinformationDeckPassive.push(oldDeck[oldDeck.length-1])
    oldState.misinformationDeckActive.shift()
  }
  else{
  oldState.misinformationDeckPassive.push(oldDeck[0]) //! LOOK INTO THIS
  oldState.misinformationDeckActive.shift()
  }
  let newState={...oldState}
  return newState
}

function outbreak(outbreak_source:Source,oldState:Gamestate) {
  oldState.chaosMeter++
  let connections:string[];
  for (const source of sources){
    if(source.name===outbreak_source.name){
      connections=source.connections  //* set list of connections to spread to
    }
  }
  for(const connection of connections){ 
    for (const source of oldState.sources){
      if (source.name===connection){
        if(source[`markers_${outbreak_source.misinfoType}`]===3){
          oldState=outbreak(source,oldState)
        }
        else{
          source[`markers_${outbreak_source.misinfoType}`]++
        }
        
      }
    }
  }
        
  let newState={...oldState}
  return newState
}



function dealConnectionCard (oldState:Gamestate) {
  let newCard:Card=oldState.connectionDeck[0]

  if(newCard.cardType==='viral'){
    oldState=viral(oldState)
    oldState.connectionDeck.shift()
  }
  else {
    for (const player of oldState.players) {
      if(player.isCurrent){

        player.cards.push(newCard)
        oldState.connectionDeck.shift()
        if(player.cards.length>6)
          {
            let chosenCard={
              cardType: 'connection',
              sourceName: 'University',
              misinfoType: 'community',
            } //* front end to give player choice of card to delete
            deleteCard(chosenCard,oldState)
          }
      }
    }
  }

  let newState={...oldState}
  return newState
}

function viral (oldState:Gamestate) {
 
 oldState=dealMisinfoCard(oldState,3,true)
 oldState.spreadLevel++
 //* shuffle passive misinfo deck and put on top of active misinfo deck
 oldState.misinformationDeckActive=[...shuffle(oldState.misinformationDeckPassive),...oldState.misinformationDeckActive]
 let newState={...oldState}
 return newState
}

function deleteCard(card:Card,oldState:Gamestate){
  for (const player of oldState.players) {
    if(player.isCurrent){
      for(const [i,value] of player.cards.entries()){ 
        if(value===card){
          player.cards.splice(i,1)
        }
      }
    }
  }
  let newState={...oldState}
  return newState

}

function createPlayer(name:string,color:string,oldState:Gamestate){ 
  let random=Math.floor(Math.random() * 100000)
  oldState.players.push({
    name,
    id:String(random),
    cards:[],
    cardHandOverflow:false,
    isCurrent:false,
    pawnColor:color,
    currentSource:'crazy dave'})
  
  let newState={...oldState}
  return newState;
}

function setUp(players){
 
 let cards;
 let misinfo=6;
 let index=0;
 let weights=[3,3,2,2,1,1]

 const sources=createSources()
 players=shuffle(players) 
 const turnOrder=[] //! where is this set??
 const spreadLevel=0; //! how is this managed??
 const chaosMeter=0;
 const misinformation={
   community:{name:'community', debunked:false,markersLeft:16},
   social:{name:'social', debunked:false,markersLeft:16},
   relations:{name:'relations', debunked:false,markersLeft:16},
  }
 const withoutViral=shuffle(createConnectionDeck());
 const misinformationDeckActive=shuffle(createMisinformationDeck());
 const misinformationDeckPassive=[]
 const dealHistory=0;
 const turnMovesLeft=0;
 const gameWon=false;
 const gameLost=false;
 

 let state={
  sources,
  players,
  turnOrder,
  spreadLevel,
  chaosMeter,
  misinformation,
  connectionDeck:withoutViral,
  misinformationDeckActive,
  misinformationDeckPassive,
  dealHistory,
  turnMovesLeft,
  gameWon,
  gameLost}

 if(state.players.length>2) cards=2;
 else cards=3
  
 for(let i=0; i<state.players.length; i++) { //* deal connection cards to players before inserting viral cards
  while(cards>0){
    state=dealConnectionCard(state)
    cards--
  }
  state.players[i].isCurrent=false;
  if(i!==state.players.length-1) state.players[i+1].isCurrent=true;
  else state.players[0].isCurrent=true;
 }

 let updateState=insertViralCards({...state,connectionDeck:withoutViral})
 

 while(misinfo>0){
  let weight=weights[index]
  updateState=dealMisinfoCard(updateState,weight,false)
  index++
  misinfo--
 }

 let newState={...updateState}
 return newState
}








