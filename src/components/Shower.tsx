import useSheet from "../contexts/sheetContext"

const Shower = () =>{
    
    const {sheet} = useSheet()
    
    const functionMode : boolean = sheet.functionStr != "";
    let classes : string = functionMode ?  "border-teal-700" : "text-stone-400 border-stone-400"

    return <div className='lg p-4 sticky left-0 top-0 bg-white border-b-2 border-stone-800 overflow-hidden z-10'>
        <div className='p-2 flex items-baseline'>
            <p className='mx-20'>🗒️ Free use SpreadSheet</p>
            <p>Current function: </p>
            <p className={"tracking-wide w-1/5 mx-3 border-2 py-2 px-4 "+classes}>
                {sheet.functionStr || "empty"}
            </p>
        </div>
    </div>
}

export default Shower