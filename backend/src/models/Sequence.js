import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Sequence 1', 'Sequence 2'],
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Reference to the term model; applicable only for student courses.
    term: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Term',
        required: true
    },
    year: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
        trim: true
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// Middleware to handle adding module to term
sequenceSchema.post('save', async function (doc) {
    await mongoose.model('Term').findByIdAndUpdate(doc.term, {
        $addToSet: { modules: doc._id }
    });
});

// Middleware to handle updating term reference
sequenceSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.term) {
        const doc = await this.model.findOne(this.getQuery());
        if (doc && doc.term.toString() !== update.term.toString()) {
            await mongoose.model('Term').findByIdAndUpdate(doc.term, {
                $pull: { modules: doc._id }
            });
            await mongoose.model('Term').findByIdAndUpdate(update.term, {
                $addToSet: { modules: doc._id }
            });
        }
    }
    next();
});

// Middleware to remove module reference from term on delete
sequenceSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await mongoose.model('Term').findByIdAndUpdate(doc.term, {
            $pull: { modules: doc._id }
        });
    }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

export default Sequence;
