import './App.css'
import Sheet from './components/Sheet';
import Shower from './components/Shower';
import useSheet from './contexts/sheetContext';
import { useEffect, } from 'react';


function App() {
  const length = 30
  const times = 1
  
  const {createSheet,sheet} = useSheet()

  useEffect(()=>{
    createSheet(length,times)
  },[])

  if(sheet == null){
    return <h1>Loading...</h1>
  }

  return (
    <div className=''>
      <Shower/>
      <Sheet/>
    </div>
  );
}

export default App;
