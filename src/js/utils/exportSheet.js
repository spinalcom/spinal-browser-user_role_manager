import zipcelx from "zipcelx";
var CsvStringify = require('csv-stringify');
const path = require('path');
const pdfMake = window.pdfMake = require(
  "../../../node_modules/pdfmake/build/pdfmake.js");
const vfs = require('../../../node_modules/pdfmake/build/vfs_fonts.js')
window.pdfMake.vfs = vfs.pdfMake.vfs;
import {
  saveAs
} from 'file-saver';

export function exportToXLSX(filename, data) {
  const res = data.map((row) => {
    return row.map((col) => {
      return {
        value: col,
        type: typeof col === 'number' ? 'number' : 'string'
      }
    })
  })
  const config = {
    filename,
    sheet: {
      data: res
    }
  }
  zipcelx(config);
}

function download(filename, data, mineType) {
  var blob = new Blob([data], {
    type: mineType
  });

  saveAs(blob, filename)
}

export function exportToCSV(filename, data) {
  const extName = path.extname(filename)
  if (extName !== 'csv') filename = filename + '.csv'
  const res = data.map((row) => {
    return row.map((col) => {
      return typeof col === 'boolean' ? col.toString() : col;
    })
  })
  CsvStringify(res, (err, output) => {
    if (err) throw err
    download(filename, output, 'text/csv')
  })
}

export function exportToPDF(filename, data) {
  const extName = path.extname(filename)
  if (extName !== 'csv') filename = filename + '.pdf'
  const res = data.map((row) => {
    return row.map((col) => {
      return typeof col === 'boolean' ? col.toString() : col;
    })
  })
  res[0] = res[0].map((headerCol) => {
    return {
      text: headerCol,
      style: 'tableHeader'
    }
  })

  var dd = {
    content: [{
        text: filename,
        style: 'header'
      },
      {
        style: 'tableStyle',
        headerRows: 1,
        table: {
          body: res
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      tableStyle: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    },
  };
  pdfMake.createPdf(dd).download(filename);
}
