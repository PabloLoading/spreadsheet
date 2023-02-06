import { createContext, useContext, useState } from "react";

interface props {
  children: JSX.Element;
}
interface ISheetContext {
  sheet: SheetType;
  createSheet: (len: number, times: number) => void;
  changeFocus: (pos: string) => void;
  changeCellValue: (pos: string, newValue: string) => void;
  doFunction: (pos: string) => void;
}
export interface SheetType {
  cells: CellType[][];
  functionStr: string;
  posFocus: string;
}

export interface CellType {
  pos: string;
  value: string;
  function: string;
  functionValue: string;
  usedCells: string[];
  invalidateCells: string[];
}

const SheetContext = createContext<ISheetContext>(null!);
const useSheet = () => useContext(SheetContext);

export const SheetContextProvider = ({ children }: props) => {
  const [sheet, setSheet] = useState<SheetType>(null!);

  const createSheet = (length: number, times: number) => {
    const initialSheet: SheetType = {
      cells: createCells(length, times),
      posFocus: "",
      functionStr: "",
    };
    setSheet(initialSheet);
  };

  const changeCellValue = (pos: string, text: string) => {
    const newSheet: SheetType = copySheet();
    const cell = getCell(pos, newSheet);
    const isFunction = text.startsWith("=");
    cell.value = text;

    if (isFunction)
      newSheet.functionStr = text.slice(1).toUpperCase().replaceAll(" ", "");
    else {
      cell.function = "";
      cell.functionValue = "";
    }
    setSheet(newSheet);
  };

  const doFunction = (pos: string) => {
    let newSheet: SheetType = copySheet();
    const cell: CellType = getCell(pos, newSheet);
    if (cell.value.startsWith("=")) {
      cell.function = cell.value.slice(1).toUpperCase().replaceAll(" ", "");
      setResult(cell, newSheet);
    }
    setTags(newSheet, pos);
    newSheet.functionStr = "";
    newSheet.posFocus = "";
    updateCells(cell.pos, cell, newSheet);
    setSheet(newSheet);
  };

  const changeFocus = (newPos: string) => {
    let newSheet: SheetType = copySheet();
    let cell = getCell(newPos, newSheet);

    newSheet.posFocus = newPos.toUpperCase();
    if (cell.function) newSheet.functionStr = cell.function;
    setSheet(newSheet);
  };

  // Private methods :

  const copySheet = () => JSON.parse(JSON.stringify(sheet));

  const getCell = (pos: string, sheet: SheetType) => {
    pos.toUpperCase();
    let cellLetter = "";
    for (let i = 0; i < pos.length; i++) {
      if (pos.charCodeAt(i) < 64 && pos[i] !== ".") break;
      cellLetter += pos.charAt(i);
    }
    const len = cellLetter.length;
    let cellNum = pos.slice(len);

    const x: number = cellLetter.charCodeAt(len - 1) - 64 + (len - 1) * 26;
    const y: number = parseInt(cellNum);
    return sheet.cells[x][y];
  };

  const setResult = (cell: CellType, sheet: SheetType) => {
    try {
      let str = cell.function.replaceAll(" ", "");
      let functionElems = str.split(/[-|+|*|/|(|)]/);
      functionElems.forEach((elem: string) => {
        if (isCellPos(elem)) {
          const cellUsed = getCell(elem, sheet);
          if (emptyCell(cellUsed))
            throw new Error("Tried to operate with an empty cell");
          if (elem === cell.pos)
            throw new Error("cell function reference itself");
          const cellValue =
            cellUsed.function !== "" ? cellUsed.functionValue : cellUsed.value;
          str = str.replace(elem, cellValue);
        }
      });
      // eslint-disable-next-line no-eval
      const res: number = eval(str);
      cell.functionValue = res.toFixed(2) + "";
    } catch (e) {
      cell.functionValue = "#Error#";
    }
  };

  const updateCells = (pos: string, firstCell: CellType, sheet: SheetType) => {
    const currentCell: CellType = getCell(pos, sheet);
    const cellsToUpdate: string[] = currentCell.invalidateCells;
    cellsToUpdate.forEach((cellPos: string) => {
      const cell: CellType = getCell(cellPos, sheet);
      if (cell.function !== "") {
        setResult(cell, sheet);
        if (cellPos === firstCell.pos) {
          invalidateCells(firstCell.pos, firstCell.pos, sheet);
          return;
        }
        if (pos !== cellPos) updateCells(cell.pos, firstCell, sheet);
      }
    });
  };
  const invalidateCells = (pos: string, firstPos: string, sheet: SheetType) => {
    const currentCell: CellType = getCell(pos, sheet);
    const cellsToUpdate: string[] = currentCell.invalidateCells;
    cellsToUpdate.forEach((cellPos: string) => {
      const cell: CellType = getCell(cellPos, sheet);
      if (cell.function !== "") {
        cell.functionValue = "#Error#";
        if (pos !== cellPos && cellPos !== firstPos)
          invalidateCells(cell.pos, firstPos, sheet);
      }
    });
  };

  const emptyCell = (cell: CellType) =>
    cell.value === "" && cell.functionValue === "";

  const isCellPos = (str: string) => {
    let cellLetter = "";
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) < 64 && str[i] !== ".") break;
      cellLetter += str[i];
    }
    let cellNum = str.slice(cellLetter.length);
    return (
      cellLetter.length > 0 &&
      parseInt(cellNum) > 0 &&
      parseInt(cellNum) < sheet.cells[0].length
    );
  };

  const setTags = (sheet: SheetType, cellPos: string) => {
    const currentCell = getCell(cellPos, sheet);
    const tags: string[] = sheet.functionStr
      .replace(" ", "")
      .split(/[-|+|*|/|(|)]/)
      .filter((elem: string) => isCellPos(elem));

    currentCell.usedCells.forEach((usedPos: string) => {
      if (!tags.includes(usedPos)) {
        const usedCell: CellType = getCell(usedPos, sheet);
        usedCell.invalidateCells = usedCell.invalidateCells.filter(
          (pos: string) => pos !== cellPos
        );
      }
    });

    currentCell.usedCells = tags;

    currentCell.usedCells.forEach((tag) => {
      const cell: CellType = getCell(tag, sheet);
      if (!cell.invalidateCells.includes(cellPos)) {
        cell.invalidateCells.push(cellPos);
      }
    });
  };

  const createCells = (len: number, times: number) => {
    const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 65));

    const alphabetTimes = (alphabet: string[], index: number) =>
      alphabet.map((letter) => alphabet[index] + letter);

    let letters: string[] = ["."].concat(alphabet);
    for (let i = 1; i < times; i++)
      letters = letters.concat(alphabetTimes(alphabet, i - 1));

    return letters.map((letter: string) =>
      [...Array(len + 1)].map((val, index: number) => {
        return {
          pos: letter + index,
          value: "",
          function: "",
          functionValue: "",
          usedCells: [],
          invalidateCells: [],
        };
      })
    );
  };

  let inValue = {
    sheet,
    createSheet,
    changeFocus,
    changeCellValue,
    doFunction,
    getCell,
  };

  return (
    <SheetContext.Provider value={inValue}>{children}</SheetContext.Provider>
  );
};

export default useSheet;
