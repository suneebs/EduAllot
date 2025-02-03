import { useState } from "react";
import * as XLSX from "xlsx";

const ExcelUploader = () => {
  const [tableData, setTableData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setTableData(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  const eliminateData = () => {
    if (tableData.length <= 1) {
      alert("No data available to filter!");
      return;
    }

    const headerRow = tableData[0];
    const distanceColumnIndex = headerRow.findIndex((header) =>
      header.toLowerCase().includes("distance from the present working place to cet")
    );
    const marksColumnIndex = headerRow.findIndex((header) =>
      header.toLowerCase().includes("% marks obtained in qualifying exam")
    );

    if (distanceColumnIndex === -1 || marksColumnIndex === -1) {
      alert("Required columns not found!");
      return;
    }

    const filteredData = [
      headerRow,
      ...tableData.slice(1).filter((row) => {
        const distanceValue = String(row[distanceColumnIndex] || "").replace(/[^\d.-]/g, "");
        const marksValue = parseFloat(row[marksColumnIndex] || "");
        const distanceNumber = parseFloat(distanceValue);

        return !isNaN(distanceNumber) && distanceNumber <= 75 && !isNaN(marksValue) && marksValue >= 45;
      }),
    ];

    setTableData(filteredData);
  };

  return (
    <div>
      <h1>Upload Excel File and Display Data</h1>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={eliminateData}>Eliminate Distance &gt; 75km and Marks &lt; 45%</button>
      <table>
        <thead>
          <tr>
            {tableData.length > 0 && ["#", ...tableData[0]].map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{rowIndex + 1}</td>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelUploader;
