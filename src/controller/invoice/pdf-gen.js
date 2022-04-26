//pdf reference-  https://www.geeksforgeeks.org/how-to-create-pdf-document-in-node-js/
//pdfkit table reference- https://www.npmjs.com/package/pdfkit-table
//import PDFDocument from 'pdfkit';
//import PdfTable from 'pdfkit-table';
import PDFDocument from 'pdfkit-table';

import fs from 'fs';

import utf8 from 'utf8';

import path from 'path';

const buildPdf = (invDefaultId, formObj) => {


  //To get the last object value (for invoice master details lastly updated)
  var keys = Object.keys(formObj);
  var last = keys[keys.length-1];
  let invNumber= formObj[last].masterData.invoiceNumber;


    let fontNormal = 'Helvetica';
    let fontBold = 'Helvetica-Bold';

    // Create a document
    //const doc = new PDFDocument();

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const customArabicFont = fs.readFileSync(path.resolve("./Amiri-Regular.ttf"));

    //heading
    doc
    .fontSize(16)
    .font(customArabicFont)
    .text('فاتورة ضريبة القيمة المضافة', {
        align: 'center',
        underline: true
      });

    doc
    .fontSize(16)
    .font(fontBold)
    .text('VAT Invoice', {
        align: 'center',
        underline: true
      });

    //   doc
    // .fontSize(16)
    // .font(customArabicFont)
    // .text(' تسجيل قيمة الضريبة المضافة ', {
    //     align: 'center',
    //     underline: true
    //   });

//doc.text("مرحبا كيف حالك", {features: ['rtla']})
    const table1 = {
        headers:[
            { label:"VAT Registration", renderer: null },
            { label:"3005332525000063", renderer: null },
            //{ label:"تسجيل قيمة الضريبة المضافة", renderer: null },
            { label:"تسجيل قيمة الضريبة المضافة" },
        ]
        //headers: ["VAT Registration", "3005332525000063", "تسجيل قيمة الضريبة المضافة"],
      };
      doc.table( table1, { 
        // A4 595.28 x 841.89 (portrait) (about width sizes)
        width: 300,
        //columnsSize: [ 200, 100, 100 ],
        prepareHeader: () => {
            
            //doc.text('hai').font(customArabicFont).fontSize(8);
            doc.font(customArabicFont).fontSize(8);
        },
      });
      
      

      const table2 = {
        headers:[
            { label:"Invoice No: ", renderer: null },
            { label: invNumber, renderer: null },
            //{ label:"تسجيل قيمة الضريبة المضافة", renderer: null },
            { label:"رقم الفاتورة" },
        ]
        //headers: ["VAT Registration", "3005332525000063", "تسجيل قيمة الضريبة المضافة"],
      };
      doc.table( table2, { 
        // A4 595.28 x 841.89 (portrait) (about width sizes)
        width: 300,
        //columnsSize: [ 200, 100, 100 ],
        prepareHeader: () => {
            
            //doc.text('hai').font(customArabicFont).fontSize(8);
            doc.font(customArabicFont).fontSize(8);
        },
      }); 



      //pusing form values to an array
        let myDatas=  [];
        Object.keys(formObj).forEach(key => {
          if(formObj[key].subData.productDetails){
            myDatas.push({ 
              prop_product:formObj[key].subData.productDetails, 
              prop_qty:formObj[key].subData.qty, 
              prop_unit:formObj[key].subData.unit, 
              prop_price: formObj[key].subData.unitPrice, 
              prop_total:formObj[key].subData.qty * formObj[key].subData.unitPrice
            })
          }
         
        } )
       



    const table = {
        title: "Title",
        subtitle: "Subtitle",
        headers: [
          { label:"Product Details", property: 'prop_product', width: 150, renderer: null },
          { label:"Quantity", property: 'prop_qty', width: 150, renderer: null }, 
          { label:"Unit", property: 'prop_unit', width: 100, renderer: null }, 
          { label:"Unit Price", property: 'prop_price', width: 100, renderer: null }, 
          { label:"Total", property: 'prop_total', width: 43, 
            renderer: (value, indexColumn, indexRow, row) => { return `U$ ${Number(value).toFixed(2)}` } 
          },
        ],

        datas:myDatas,


        // datas: [


        //   { 
        //     name: 'Name 1', 
        //     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ', 
        //     price1: '$1', 
        //     price3: '$ 3', 
        //     price2: '$2', 
        //     price4: '4', 
        //   },
        //   { 
        //     options: { fontSize: 10, separation: true},
        //     name: 'bold:Name 2', 
        //     description: 'bold:Lorem ipsum dolor.', 
        //     price1: 'bold:$1', 
        //     price3: '$3', 
        //     price2: '$2', 
        //     price4: '4', 
        //   },

        // ],
        // rows: [
        //   [
        //     "Apple",
        //     "Nullam ut facilisis mi. Nunc dignissim ex ac vulputate facilisis.",
        //     "$ 105,99",
        //     "$ 105,99",
        //     "$ 105,99",
        //     "105.99",
        //   ],
        //   [
        //     "Tire",
        //     "Donec ac tincidunt nisi, sit amet tincidunt mauris. Fusce venenatis tristique quam, nec rhoncus eros volutpat nec. Donec fringilla ut lorem vitae maximus. Morbi ex erat, luctus eu nulla sit amet, facilisis porttitor mi.",
        //     "$ 105,99",
        //     "$ 105,99",
        //     "$ 105,99",
        //     "105.99",
        //   ],
        // ],
      };
    
      doc.table(table, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font("Helvetica").fontSize(8);
          indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
        },
      });

      // Adding image in the pdf.
    doc.image('./simple-e-invoice-qrcodes/'+invDefaultId+'.png', {
        fit: [50, 50],
        align: 'center',
        valign: 'center'
    });


    // Saving the pdf file in root directory.
    doc.pipe(fs.createWriteStream('./simple-e-invoice-pdfs/'+invDefaultId+'.pdf'));

    

    // Adding functionality
    // doc
    // .fontSize(14)
    // .text('Invoice Number: '+scMasterForm.invoiceNumber, 100, 100);

 
    

    // Finalize PDF file
    doc.end();

}


export default {
    buildPdf
}