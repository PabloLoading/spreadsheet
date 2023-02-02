
import { createContext, useContext,useState} from "react";

interface props{
    children: JSX.Element
}
interface ISheetContext{
    sheet : SheetType,
    createSheet : (len : number,times : number) => void,
    changeFocus: (pos : string) => void,
    changeCellValue : (pos : string , newValue : string) => void
    doFunction : (pos : string) => void,
}
export interface SheetType{
    cells : CellType[][],
    functionStr: string,
    posFocus: string,
}

export interface CellType {
    pos:string,
    value:string
    function : string,
    functionValue : string
    invalidateCells: string[]
}

const SheetContext = createContext<ISheetContext>(null!)
const useSheet = () => useContext(SheetContext)

export const SheetContextProvider= ({children} : props)=>{
    const [sheet,setSheet] = useState<SheetType>(null!)
    console.log(sheet)

    const createSheet = (length : number, times : number)=>{
        const initialSheet : SheetType = {
            cells : createCells(length,times),
            posFocus:"",
            functionStr:"",
        }
        setSheet(initialSheet)
    }

    const changeCellValue=(pos : string,text : string)=>{
        const newSheet : SheetType = copySheet()
        const cell = getCell(pos,newSheet)
        const isFunction = text.startsWith('=')
        cell.value=text

        if(isFunction) newSheet.functionStr = text.slice(1).toUpperCase().replaceAll(" ","")
        else {
            cell.function =""
            cell.functionValue=""
        }
        
        setSheet(newSheet)
    }
    
    const doFunction = (pos: string) => {
        let newSheet: SheetType = copySheet()
        const cell: CellType = getCell(pos, newSheet)
        if (cell.value.startsWith('=')) {
            cell.function = cell.value.slice(1).toUpperCase().replaceAll(" ","")
            setResult(cell, newSheet)
            setTags(newSheet)
        }
        newSheet.functionStr = ""
        newSheet.posFocus = ""
        updateCells(cell.pos, newSheet)
        setSheet(newSheet)
    }

    const changeFocus=(newPos : string)=>{
        let newSheet : SheetType = copySheet()
        let cell = getCell(newPos,newSheet)

        newSheet.posFocus = newPos.toUpperCase()
        if(cell.function) newSheet.functionStr = cell.function
        setSheet(newSheet)
    }

    // Private methods :

    const copySheet = () => JSON.parse(JSON.stringify(sheet));

    const getCell = (pos : string,sheet : SheetType) =>{
        pos.toUpperCase()
        const x  : number = pos.charCodeAt(0) - 64 // ACSII
        const y : number= parseInt(pos.slice(1))
        return sheet.cells[x][y]
    }
    
    const setResult =(cell : CellType,sheet : SheetType)=>{
        try{
            let str = cell.function.replaceAll(" ","")
            let functionElems = str.split(/[-|+|*|/|(|)]/)
            functionElems.map((elem : string)=>{
                if(isCellPos(elem)){ 
                    const cellUsed = getCell(elem,sheet)
                    if(emptyCell(cellUsed)) throw new Error('Tried to operate with an empty cell')
                    if(elem == cell.pos) throw new Error('cell function reference itself')
                    const cellValue = cellUsed.function!="" ? cellUsed.functionValue : cellUsed.value
                    str = str.replace(elem,cellValue)
                }
            })
            const res = eval(str)
            cell.functionValue = res
        }
        catch(e){
            cell.functionValue = "#Error#"
        }
    }
    const emptyCell = (cell : CellType)=>cell.value == "" && cell.functionValue ==""

    const isCellPos = (str : string)=>{
        const letter= str.charCodeAt(0)
        const num : number = parseInt(str.slice(1))
        return letter>= 65 && letter <= 90 && num >0 && num <sheet.cells.length
    } 
        
 
    const setTags = (sheet :SheetType)=>{
        let str = sheet.functionStr.replace(" ","")
        let functionElems = str.split('+').map((part : string)=>part.split('-')).flat()
        const tags : string[] = functionElems.filter((elem : string)=>isCellPos(elem))

        tags.map(tag=>{
            const cell: CellType = getCell(tag,sheet)
            cell.invalidateCells.push(sheet.posFocus)
        })
    }

    const updateCells = (pos : string,sheet : SheetType)=>{
        const currentCell: CellType = getCell(pos,sheet)
        const cellsToUpdate : string[] = currentCell.invalidateCells
        cellsToUpdate.map((cellPos : string)=>{
            const cell: CellType = getCell(cellPos,sheet)
            if(cell.function!=""){
                setResult(cell,sheet)
                if(pos!=cellPos) updateCells(cell.pos,sheet)
            }
        })

    }

    const createCells = (len : number,times : number) =>{
        const alphabet : string[] = [".","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
        let letters : string[] = ["."]
        // in development
        const a=[...Array(times)].map(value=>{
            letters = [...letters,...alphabet]
        })

        return alphabet
        .map((letter : string)=>[...Array(len+1)]
        .map((val,index : number)=>{
            return {pos:letter+index,value:"",function:"" , functionValue : "",invalidateCells:[]}}))
    }
    

    let inValue = {sheet,createSheet,changeFocus,changeCellValue,doFunction,getCell}

    return <SheetContext.Provider value={inValue}>
        {children}
    </SheetContext.Provider>
}

export default useSheet