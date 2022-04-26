import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
autoIncrement.initialize(mongoose.connection);

const invoiceMasterSchema = mongoose.Schema(
    {
        //invId: { type: Number, default: '' },
        invoiceNumber: { type: String, default: '' },
        filedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        invoiceChild: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'invoicetransactions',
            },
        ],
    },
    { timestamps: true }
);

// invoiceMasterSchema.plugin(autoIncrement.plugin, {
// model: "invoicemaster", // collection or table name in which you want to apply auto increment
// field: "invId", // field of model which you want to auto increment
// startAt: 1, // start your auto increment value from 1
// incrementBy: 1, // incremented by 1
// });


const invoice_master = mongoose.model('invoicemaster', invoiceMasterSchema);
export default invoice_master;