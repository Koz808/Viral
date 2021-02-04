import { ClearmisinfoProps, CLEAR_MISINFO, logOnOffProps, LOG_ON_OFF, MoveActionProps, MOVE_ACTION, ShareCardProps, SHARE_CARD } from './../../types/gameStateTypes';
import { GameStateActionTypes } from '../../types/gameStateTypes'
//Below are example of actions with typescript. 
// we need to create an action for each reduced case 


export function moveAction(props: MoveActionProps): GameStateActionTypes {
  const { oldState, currentPlayerID, location } = props
  return {
    type: MOVE_ACTION,
    payload: { oldState, currentPlayerID, location }
  }
}



export function clearMisinfoAction(props: ClearmisinfoProps): GameStateActionTypes {
  const { oldState, currentPlayerID, location, misinfoType } = props;
  return {
    type: CLEAR_MISINFO,
    payload: { oldState, currentPlayerID, location, misinfoType }
  }
}


export function shareCardAction(props: ShareCardProps): GameStateActionTypes {
  const { oldState, currentPlayerID, recipient, sharedCard } = props;
  return {
    type: SHARE_CARD,
    payload: { oldState, currentPlayerID, recipient, sharedCard }
  }
}

export function logOnOffAction(props: logOnOffProps): GameStateActionTypes {
  const { oldState, currentPlayerID, location, usedCard } = props;
  return {
    type: LOG_ON_OFF,
    payload: { oldState, currentPlayerID, location, usedCard }
  }
}