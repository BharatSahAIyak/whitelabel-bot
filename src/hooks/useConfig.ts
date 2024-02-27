import {useContext} from 'react';
import { AppContext } from '../context';

export const useConfig =(key:string,name:string)=>{

    const context =useContext(AppContext);
    console.log("hola:",{context,key,name})
    return context?.config?.[key]?.[name]
}