import React, { ButtonHTMLAttributes, ChangeEvent, DetailedHTMLProps, useState } from 'react';
import './NewGameMenu.css';
// import { startGameEvent, addPlayerEvent } from '../../logic/event.listeners'
import { AddPlayerAction, addPlayerToGameState, StartGameAction, updateGameState } from '../../redux/gameState/gameStateActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../../redux/gameState/store';
import { Player } from '../../types/gameStateTypes';
import { Console } from 'console';


export const NewGameMenu: React.FC = () => {
  const [name, updateName] = useState({ name: '', color:'', room: '' })
  // const [Room, updateRoom] = useState('')
  const dispatch = useDispatch();
  const [option, updateOption] = useState(true)

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    if (event.target) {
      updateName(state => ({
        ...state,
        [event.target.name]: event.target.value
      }))
    }

  }
  console.log(name)


  const player = useSelector((state: RootState) => state.playerStateReducer)

  const addPlayer = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    const color = 'blue'
    dispatch(AddPlayerAction(name.name, name.color, name.room))
  }

  const rooms = useSelector((state: RootState) => state.allGamesStateReducer)


  // const selectRoom = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   console.log(e.target.value);
  //   updateRoom(e.target.value);
  // }

  return (
    <form className='form' >
      <div className='menu-container'>
        <div className='title-container'>
          <h3>Welcome</h3>
        </div>
        <input
          type='text'
          name='name'
          value={name.name}
          placeholder='player name...'
          onChange={handleChange}
        ></input>

        <input
          type='text'
          name='color'
          value={name.color}
          placeholder='color'
          onChange = {handleChange}
        >
        </input>

        <input
          type='text'
          name='room'
          value={name.room}
          placeholder='room name'
          onChange = {handleChange}

        ></input>
        <input
          type='text'
          name='number of players'
          placeholder='1 - 4 players...'
        ></input>
        {/* 
        <select
          placeholder='select room'
          value={Room}
          onChange={selectRoom}>
          {(rooms.length > 0) ?
            rooms.map(room =>
              <option value={`${room}`} id='room-options'>
                {room}
              </option>) :
            <option> Start new game</option>
          }
        </select> */}

        <button className='start_game_button' type='submit' onClick={addPlayer} >
          Play
        </button>
        {player.name}
      </div>
    </form>
  );
};