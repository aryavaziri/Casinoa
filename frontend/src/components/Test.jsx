import React from "react";
import { useReducer } from "react";

function init(para){
  return {count : para}
}

function reducer(state, action){
  switch(action.type){
    case 'increment' : return{count : state.count+1}
    case 'decrement' : return{count : state.count-1}
    default : alert('adam bash...')
  }
}

export default function Main(){
  const [state, dispatch] = useReducer(reducer, 100, init)
  return(
    <>
      count is : {state.count}
      <button onClick={()=> dispatch({type : 'increment'})}>plus</button>
      <button onClick={()=> dispatch({type : 'decrement'})}>minus</button>
    </>
  )

}