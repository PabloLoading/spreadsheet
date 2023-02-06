import useSheet from "../contexts/sheetContext";
import Cell from "./Cell";
import { CellType } from "../contexts/sheetContext";

const Sheet = () => {
  const { sheet } = useSheet();

  return (
    <div className="relative overflow-scroll">
      {sheet.cells.map((row, index) => {
        return (
          <div key={index} className="flex ">
            {row.map((cell: CellType) => (
              <Cell key={cell.pos} cell={cell} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
export default Sheet;
