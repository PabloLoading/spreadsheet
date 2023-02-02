import useSheet from "../contexts/sheetContext"
import { KeyboardEvent,useEffect,useRef,} from 'react'
import { CellType } from "../contexts/sheetContext"

interface props {
    cell: CellType
}
type FormEvent = React.FormEvent<HTMLInputElement>

const Cell = ({cell} : props) =>{
    const input = useRef<HTMLInputElement>(null!)  
    
    const {changeFocus,changeCellValue,doFunction,sheet} = useSheet()
    const showResult :  boolean = sheet.posFocus != cell.pos && !!cell.function

    useEffect(()=>{
        if(input.current?.value){
            input.current.value = showResult ? cell.functionValue : cell.value 
        }
        
    },[cell.value,cell.functionValue,showResult])

    const isLeftHeader = cell.pos.charAt(1)=='0'
    const isTopHeader = cell.pos.charAt(0)=='.'

    const handleFocus = ()=>{
        if(!isLeftHeader && !isTopHeader){
            changeFocus(cell.pos)
        }
    }
    const handleChange = (e : FormEvent)=>{
        let text : string = e.currentTarget.value
        changeCellValue(cell.pos,text)
    }
    const handleKey = (e : KeyboardEvent) =>{
        if(e.key === 'Enter'){
            input.current.blur()
        }
    }
    const handleBlur=()=>{
        doFunction(cell.pos)
    }

    const events = {
        onBlur:handleBlur,
        onKeyDown:handleKey, 
        onChange:handleChange, 
        onFocus:handleFocus 
    }

    const header = <div className={"border-2 border-stone-400  bg-stone-300 "}>
        <p className="p-2  text-center w-40" >{ isLeftHeader  ? cell.pos.charAt(0) : cell.pos.slice(1)}</p>
    </div>

    return (isLeftHeader || isTopHeader) ? header :  <div className="border-2 border-stone-300">
        <input ref={input} {...events} className="p-2 w-40" type='text'/>
    </div>
}

export default Cell