import mongoose from 'mongoose';

//creating a schema
//creating an object bugTransactionsSchema
const invoiceTransactionsSchema = mongoose.Schema(
    {
        masterId: {
            type: mongoose.Schema.ObjectId,
            ref: 'invoicemaster'
        },
        productDetails: { type: String, default: '' },
        qty: { type: String, default: '' },
        unit: { type: String, default: '' },
        unitPrice: { type: String, default: '' }
    },
    { timestamps: true }
);

const invoice_transaction = mongoose.model('invoicetransactions', invoiceTransactionsSchema);
export default invoice_transaction;