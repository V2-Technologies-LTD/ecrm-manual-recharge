import * as path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const generateExcelFile = (data) => {
  const flatten = (obj) => {
    const result = {};
    for (const key in obj) {
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        const flatObj = flatten(obj[key]);
        for (const subKey in flatObj) {
          result[`${key}.${subKey}`] = flatObj[subKey];
        }
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  };

  const flattenedData = data.map(flatten);
  // Create a new workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(flattenedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Recharge Data");
  // Output file path
  const date = new Date();
  const safeDate = date.toISOString().replace(/:/g, "-");
  const filePath = path.join(__dirname, `recharge_report${safeDate}.xlsx`);
  // Write to file
  XLSX.writeFile(wb, filePath);
  return true
};
